import express, {Application, Request, Response} from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
async function main(){
    app.listen(3000, ()=>{

    })
}
main().catch((e) => {
    throw e
}).finally(async () => {
    await prisma.$disconnect()
});