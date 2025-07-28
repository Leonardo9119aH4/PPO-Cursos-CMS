import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { getUsers, requireLogin, users }  from "./users";
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

function verifyCourseAccess(prisma: PrismaClient){ //verifica se o usuário é dono do curso (possui acesso de edição)
    return async (req: Request, res: Response, next: Function) => {
        await requireLogin(prisma)(req, res, next);
        const course = await prisma.course.findUnique({
            where: {
                id: Number(req.params.courseId)
            },
            select:{
                id: true,
                title: true,
                maxLifes: true,
                description: true,
                secondsRecoveryLife: true,
                practiceRecoveryLife: true,
                thubnail: true,
                state: true,
                userId: true,
            }
        });
        if(!course){
            res.status(404).json("Curso não existe"); 
            return;
        }
        if(course.userId != req.session.user!.id){
            res.status(403).json("Acesso negado");
            return;
        }
        req.course = course;
        next();
    }
}

export async function courses(app: Application, prisma: PrismaClient, storage: string) { 
    const imageExtensions = ["image/png", "image/jpg", "image/jpeg"];
    app.post("/newcourse", requireLogin(prisma), async (req, res)=>{ //rota para criar um novo minicurso
        try{
            const courseStorage: string = `${storage}/users/${req.session.user!.id}/courses/new`; //cria a pasta como new pois não se sabe o id do curso
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
                        secondsRecoveryLife: 1000, //só para teste
                        practiceRecoveryLife: Number(req.body.practiceRecoveryLife),
                        thubnail: `/users/${req.session.user!.id}/courses/new/${req.file.filename}`, //salva o caminho como new pois não se sabe o id do curso
                        state: 0,
                        userId: req.session.user!.id
                        }
                    });
                    await fs.rename(courseStorage, `${storage}/users/${req.session.user!.id}/courses/${course.id}`); //altera o nome pasta de new para o id do curso
                    await prisma.course.update({
                        where: {id: course.id},
                        data: {thubnail: `/users/${req.session.user!.id}/courses/${course.id}/${req.file.filename}`} //altera o caminho no banco de dados, sincronizando com o disco
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
    app.get("/accountCourses", requireLogin(prisma), async (req: Request, res: Response) => { //rota para obter os cursos de um jogador
        try{
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
                    userId: req.session.user!.id
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
    app.get("/getCourseToEdit/:courseId", verifyCourseAccess(prisma), async (req: Request, res: Response) => { //rota para obter os níveis para a edição do minicurso
        try{
            const course = req.course!;
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
    app.post("/createLevel/:type/:courseId", verifyCourseAccess(prisma), async (req: Request, res: Response) => {
        const lastLevel = await prisma.level.findFirst({
            orderBy: {
                order: 'desc'
            },
            where: {
                courseId: Number(req.params.courseId)
            }
        });
        const level = await prisma.level.create({
            data: {
                type: 1,
                recoveryLifes: 0,
                order: lastLevel ? lastLevel.order+1 : 0,
                courseId: req.session.user!.id
            }
        });
        res.status(200).json(level);
    });
    app.get("/getleveltoedit", verifyCourseAccess(prisma), async (req: Request, res: Response)=>{
        const course = req.course!;
        
    })
}