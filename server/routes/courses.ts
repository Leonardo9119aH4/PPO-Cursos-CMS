import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { getUsers, getLoggedUser, users }  from "./users";
import fs from "fs/promises";
import path from "path";

function createUploader(storage: string, allowedTypes: string[], name: string){ // Cria um middleware de upload de arquivos com multer
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storage)
        },
        filename: (req, file, cb) => {
            cb(null, name+path.extname(file.originalname));
        }
    });
    return multer({
        storage: multerStorage,
        fileFilter: (req, file, cb) => {
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
}

async function verifyCourseConflict(title: string, prisma: PrismaClient, userId: number): Promise<Boolean>{ //verifica se já existe um curso com certo nome
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true
        },
        where: {
            userId: userId
        }
    });
    for(let course of courses){
        if(course.title == title){
            return true;
        }
    }
    return false;
}

export async function courses(app: Application, prisma: PrismaClient, storage: string) { 
    const imageExtensions = ["image/png", "image/jpg", "image/jpeg"];
    app.post("/newcourse", async (req, res)=>{ //rota para criar um novo minicurso
        try{
            if(req.cookies.authKey == null){
                res.status(204).json("Sem conta logada");
                return;
            }
            const user = await getLoggedUser(prisma, req.cookies.authKey);
            if(user == null){
                res.clearCookie('authKey', {
                    path: "/", 
                    secure: false,    
                    httpOnly: true,   
                    sameSite: "lax"
                });
                res.status(401).json("Sem usuário para chave fornecida");
                return;
            }
            const courseStorage: string = `${storage}/users/${user.id}/courses/new`; //cria a pasta como new pois não se sabe o id do curso
            await fs.mkdir(courseStorage, {recursive: true});
            const uploader = createUploader(courseStorage, imageExtensions, "thubnail");
            uploader.single("thumbnail")(req, res, async function (err: any) {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({message: "Erro no upload", error: 4});
                }
                else if (err) {
                    return res.status(500).json("Erro interno");
                }
                if (!req.file) {
                    return res.status(415).json("Tipo não suportado");
                }
                try{ // é necessário outro try pra não crashar o servidor
                    const course = await prisma.course.create({
                    data: {
                        title: req.body.title,
                        maxLifes: Number(req.body.maxLifes),
                        description: req.body.description,
                        timeRecoveryLife: "2025-06-16T12:00:00.000Z",
                        practiceRecoveryLife: Number(req.body.practiceRecoveryLife),
                        thubnail: `/users/${user.id}/courses/new/${req.file.filename}`, //salva o caminho como new pois não se sabe o id do curso
                        state: 0,
                        userId: user.id
                        }
                    });
                    await fs.rename(courseStorage, `${storage}/users/${user.id}/courses/${course.id}`); //altera o nome pasta de new para o id do curso
                    await prisma.course.update({
                        where: {id: course.id},
                        data: {thubnail: `${storage}/users/${user.id}/courses/${course.id}/${req.file.filename}`} //altera o caminho no banco de dados, sincronizando com o disco
                    })
                    res.status(200).json("Enviado com sucesso");
                }
                catch(er){
                    await fs.rm(courseStorage, { recursive: true, force: true });
                    res.status(500).json("Algum erro ao salvar no banco de dados");
                }
            });
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    })
    app.get("/accountCourses", async (req: Request, res: Response) => { //rota para obter os cursos de um jogador
        try{
            if(req.cookies.authKey == null){
                res.status(204).json("Sem conta logada");
                return;
            }
            const user = await getLoggedUser(prisma, req.cookies.authKey);
            if(user == null){
                res.clearCookie('authKey', {
                    path: "/", 
                    secure: false,    
                    httpOnly: true,   
                    sameSite: "lax"
                });
                res.status(404).json("Sem usuário para chave fornecida");
                return;
            }
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    thubnail: true,
                    description: true,
                    maxLifes: true,
                    practiceRecoveryLife: true,
                    state: true,
                },
                where: {
                    userId: user.id
                }
            });
            res.status(200).json(courses);
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
    app.get("/getFile/*", async (req: Request, res: Response) => {
        try{
            const relativePath = req.params[0]; // pega tudo após /getFile/
            const absolutePath = path.join(__dirname, "..", storage, relativePath);
            res.sendFile(absolutePath);
        }
        catch(er){
            res.send(500).json(er);
        }
    })
    app.get("/getCourseToEdit/:courseId", async (req: Request, res: Response) => { //rota para obter os níveis para a edição do minicurso
        try{
            if(req.cookies.authKey == null){
                res.status(204).json("Sem conta logada");
                return;
            }
            const user = await getLoggedUser(prisma, req.cookies.authKey);
            if(user == null){
                res.clearCookie('authKey', {
                    path: "/", 
                    secure: false,    
                    httpOnly: true,   
                    sameSite: "lax"
                });
                res.status(401).json("Sem usuário para chave fornecida"); 
                return;
            }
            const course = await prisma.course.findUnique({
                where: {
                    id: Number(req.params.courseId)
                },
                select:{
                    id: true,
                    title: true,
                    maxLifes: true,
                    timeRecoveryLife: true,
                    practiceRecoveryLife: true,
                    userId: true,
                }
            });
            if(!course){
                res.status(404).json("Curso não existe"); 
                return;
            }
            if(course.userId != user.id){
                res.status(403).json("Acesso negado");
                return;
            }
            const levels = await prisma.level.findMany({ //é normal obter valor nulo
                select: {
                    type: true,
                    content: true,
                    recoveryLifes: true,
                    order: true,
                    courseId: true,
                },
                where: {
                    courseId: course.id,
                }
            })
            res.status(200).json({course, levels});
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
    app.post("/newLevel/:courseId", async(req: Request, res: Response) => {
        
    })
}