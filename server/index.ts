import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { users } from "./routes/users";
import { courses } from "./routes/courses";
import multer from "multer";

const app = express();
const prisma = new PrismaClient();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/users")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString()+"_"+file.originalname);
    }
});
async function main(){
    app.listen(3000, ()=>{});
    // app.use(cors({  // Permite o envio de cookies e cabeçalhos de autenticação
    //     origin: "http://localhost:5173", 
    //     credentials: true, 
    // }));
    app.use(cors({  // Aceita qualquer origem, usar para DESENVOLVIMENTO, dá erro com cookies
        origin: "*", 
    }));
    app.use(express.json());
    app.use(cookieParser());
    users(app, prisma, storage);
    courses(app, prisma, storage);

}
main().catch((e) => {
    throw e;
}).finally(async () => {
    await prisma.$disconnect();
});