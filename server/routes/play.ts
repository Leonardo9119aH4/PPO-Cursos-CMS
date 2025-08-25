import { PrismaClient, Course, Level } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import { getUsers, requireLogin, users }  from "./users";

async function getLevelIfPublic(prisma: PrismaClient, levelId: number): Promise<Level | null>{
    const level = await prisma.level.findUnique({
        where: {
            id: Number(levelId)
        }
    });
    const course = await prisma.course.findUnique({
        where: {
            id: level?.courseId
        }
    });
    if(course == null){
        return null;
    }
    if(course.state != 1){
        return null;
    }
    return level;
}

export async function play(app: Application, prisma: PrismaClient){
    // Parte da aquisição de cursos públicos
    app.get("/getcourses", async (req: Request, res: Response)=>{
        try{
            const courses = await prisma.course.findMany({
                where: {
                    state: 1
                }
            });
            res.status(200).json(courses);
        }
        catch(er){
            res.status(500).json(er);
            console.log(er);
        }
    });
    app.get("/getCourse/:courseId", requireLogin(prisma), async (req: Request, res: Response)=>{
        try{
            const course = await prisma.course.findUnique({
                where: {
                    id: Number(req.params.courseId)
                }
            });
            if(course == null){
                res.sendStatus(404);
                return;
            }
            if(course.state == 0 || course.state == 2){
                res.sendStatus(403);
                return;
            }
            const levels = await prisma.level.findMany({
                where: {
                    courseId: Number(req.params.courseId)
                }
            })
            res.status(200).json({
                course,
                levels: levels
            });
        }
        catch(er){
            res.status(500).json(er);
            console.log(er);
        }
    });
    app.get("/getLevel/:levelId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            if(isNaN(Number(req.params.levelId))){
                res.status(400).json("ID inválido");
                return;
            }
            const level = await getLevelIfPublic(prisma, Number(req.params.levelId));
            if(level === null){
                res.status(404).json("Nível não existe ou não está disponível");
                return;
            }
            res.status(200).json(level);
        }
        catch(er){
            res.status(500).json(er);
            console.log(er);
        }
    });
}