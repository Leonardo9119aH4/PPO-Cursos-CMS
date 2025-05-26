import { PrismaClient } from "@prisma/client";
import { Application, Request, Response } from "express";
import multer, { MulterError } from "multer";

export async function courses(app: Application, prisma: PrismaClient, storage: multer.StorageEngine) {
    function createUploader(storage: multer.StorageEngine, allowedTypes: string[]){
        return multer({
            storage,
            fileFilter: (req, file, cb) => {
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            }
        });
    }
    const imageUploader = createUploader(storage, ["image/png", "image/jpg", "image/jpeg"]);
    app.post("/newcourse", imageUploader.single("thubnail"), async (req: Request, res: Response) => {
        if(!req.file){
            res.status(404).json("Arquivo não encontrado ou tipo não suportado");
            return;
        }
        res.status(200).json("Enviado com sucesso");
    })
}