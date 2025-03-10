import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { users } from "./routes/users";

const app = express();
const prisma = new PrismaClient();
async function main(){
    app.listen(3000, ()=>{});
    users(app, prisma)
}
main().catch((e) => {
    throw e
}).finally(async () => {
    await prisma.$disconnect()
});