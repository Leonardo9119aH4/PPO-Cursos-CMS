import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { getUsers, getLoggedUser, users }  from "./users";
import fs from "fs/promises";
import path from "path";

function createUploader(storage: string, allowedTypes: string[], userId: number){ // Cria um middleware de upload de arquivos com multer
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storage)
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString()+"_"+userId.toString());
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

async function findFile(storage: string, fileName: string): Promise<string | null> { //acha o caminho de qualquer arquivo de qualquer usuário
    try {
        
    }
    catch{
        return null; 
    }
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
                res.status(404).json("Sem usuário para chave fornecida");
                return;
            }
            const courseStorage: string = `${storage}/users/${user.id}/courses/new`;
            await fs.mkdir(courseStorage, {recursive: true});
            const uploader = createUploader(courseStorage, imageExtensions, user.id);
            uploader.single("thumbnail")(req, res, async function (err: any) {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json("Erro no upload");
                } else if (err) {
                    return res.status(500).json("Erro interno");
                }
                if (!req.file) {
                    return res.status(404).json("Arquivo não encontrado ou tipo não suportado");
                }
                try{ // é necessário outro try pra não crashar o servidor
                    const course = await prisma.course.create({
                    data: {
                        title: req.body.title,
                        maxLifes: Number(req.body.maxLifes),
                        description: req.body.description,
                        timeRecoveryLife: "2025-06-16T12:00:00.000Z",
                        practiceRecoveryLife: Number(req.body.practiceRecoveryLife),
                        thubnail: req.file.filename,
                        state: 0,
                        userId: user.id
                        }
                    });
                    await fs.rename(courseStorage, `${storage}/users/${user.id}/courses/${course.id}`);
                    res.status(200).json("Enviado com sucesso");
                }
                catch(er){
                    await fs.rm(courseStorage, { recursive: true, force: true });
                    res.status(400).json("Algum erro ao salvar no banco de dados");
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
    app.get("/getCourseThubnail/:name", async (req: Request, res: Response) => {
        try{
            findFile(storage, req.params.name).then(data => {
                console.log(data);
            })
            res.sendStatus(200);
        }
        catch(er){
            res.send(500).json(er);
        }
    })
    app.get("/editCourse/:courseId", async (req: Request, res: Response) => { //rota para editar um minicurso em específico
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

        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
}