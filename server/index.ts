import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import cors from "cors";
import { users } from "./routes/users";

const app = express();
const prisma = new PrismaClient();
async function main(){
    app.listen(3000, ()=>{});
    app.use(cors());
    app.use(express.json())
    users(app, prisma);

}
main().catch((e) => {
    throw e;
}).finally(async () => {
    await prisma.$disconnect();
});