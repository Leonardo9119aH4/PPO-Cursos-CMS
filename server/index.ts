import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { users } from "./routes/users";
import { courses } from "./routes/courses";
import multer from "multer";
import dotenv from "dotenv";

const app = express();
const prisma = new PrismaClient();
dotenv.config();
const storage = process.env.UPLOADS_DIR || "./uploads";
const corsOptions = {
    origin: process.env.CLIENT_URL, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
// const corsOptions = { // Aceita qualquer origem, usar para DESENVOLVIMENTO, dá erro com cookies
//     origin: "*"
// };

async function main(){
    app.listen(process.env.SERVER_PORT, ()=>{});
    app.use(cors(corsOptions));
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
