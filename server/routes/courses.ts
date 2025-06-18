import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { getUsers, getLoggedUser, users }  from "./users";
import fs from "fs/promises";

function createUploader(storage: string, allowedTypes: string[]){ // Cria um middleware de upload de arquivos com multer
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storage)
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString()+"_"+file.originalname);
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

async function verifyCourseConflict(title: string, prisma: PrismaClient, userId: number): Promise<Boolean>{
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
    app.post("/newcourse", async (req, res)=>{
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
            const uploader = createUploader(courseStorage, imageExtensions);
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
    app.get("/accountCourses", async (req: Request, res: Response) => {
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
                    practiceRecoveryLife: true
                },
                where: {
                    userId: user.id
                }
            });
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
    app.get("/editCourse/:courseId", async (req: Request, res: Response) => {
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