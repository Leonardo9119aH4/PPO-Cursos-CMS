import { PrismaClient } from "@prisma/client";
import { Application, Request, Response } from "express";

export async function users(app: Application, prisma: PrismaClient){
    app.post("/signup", async (req: Request, res: Response)=>{
        console.log("foi");
        res.sendStatus(200);
    })
}