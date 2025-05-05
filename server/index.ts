import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { users } from "./routes/users";

const app = express();
const prisma = new PrismaClient();
async function main(){
    app.listen(3000, ()=>{});
    app.use(cors({  // Permite o envio de cookies e cabeçalhos de autenticação
        origin: "http://localhost:5173", 
        credentials: true, 
    }));
    app.use(express.json());
    app.use(cookieParser());
    users(app, prisma);

}
main().catch((e) => {
    throw e;
}).finally(async () => {
    await prisma.$disconnect();
});