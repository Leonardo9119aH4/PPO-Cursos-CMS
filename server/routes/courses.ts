import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import getUsers from "./users";

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

export async function courses(app: Application, prisma: PrismaClient, storage: string) {
    const imageExtensions = ["image/png", "image/jpg", "image/jpeg"];
    app.post("/newcourse", async (req: Request, res: Response) => {
        
        if(!req.file){
            res.status(404).json("Arquivo não encontrado ou tipo não suportado");
            return;
        }
    })
    app.use("/newcourse", imageUploader.single("thubnail"), (req:Request, res:Response, next:NextFunction)=>{
        res.status(200).json("Enviado com sucesso");
        next();
    })
}