import { PrismaClient, Course, Level } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import { getUsers, requireLogin, users }  from "./users";

interface QuizContent {
    alternatives: any[],
    answer: number,
    enunciation: string,
    penalization: number
}

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

function isQuizContentArray(content: any): content is QuizContent[] {
    return (
        Array.isArray(content) &&
        content.every(q =>
            typeof q === 'object' &&
            Array.isArray(q.alternatives) &&
            typeof q.answer === 'number' &&
            typeof q.enunciation === 'string' &&
            typeof q.penalization === 'number'
        )
    );
}

export async function play(app: Application, prisma: PrismaClient){
    // Parte da aquisição de cursos públicos
    app.get("/getcourses/:detail?", async (req: Request, res: Response)=>{ //Detalhe = 1 -> cursos que o usuário está fazendo | 2 -> cursos que o usuário NÃO está fazendo
        try{
            let courses: Course[] | null;
            if(req.params.detail && req.params.detail == "1"){
                if(!req.session.user){
                    res.status(401).json("Login necessário");
                    return;
                }
                const userStudyings = await prisma.studying.findMany({
                    where: {
                        userId: Number(req.session.user.id)
                    },
                    include: {
                        course: true
                    }
                });
                courses = userStudyings.map(studying => studying.course).filter(course => course.state === 1);
            }
            else if(req.params.detail == "2"){
                if(!req.session.user){
                    res.status(401).json("Login necessário");
                    return;
                }
                const allPublicCourses = await prisma.course.findMany({
                    where: {
                        state: 1
                    },
                    include: {
                        levelPosts: true
                    }
                });
                const userStudyings = await prisma.studying.findMany({ // Busca cursos que o usuário está fazendo
                    where: {
                        userId: Number(req.session.user.id)
                    },
                    select: {
                        courseId: true
                    }
                });
                const userCourseIds = userStudyings.map(studying => studying.courseId);
                courses = allPublicCourses.filter(course => // Filtra cursos que o usuário NÃO está fazendo
                    !userCourseIds.includes(course.id)
                );
            }
            else{
                courses = await prisma.course.findMany({
                    where: {
                        state: 1
                    },
                    include: {
                        levelPosts: true
                    }
                });
            }
            res.status(200).json(courses);
        }
        catch(er){
            res.status(500).json(er);
            console.log(er);
        }
    });
    app.get("/getCourse/:courseId", requireLogin(prisma), async (req: Request, res: Response)=>{ //também retorna os níveis de onde o usuáio parou
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido!");
                return;
            }
            const course = await prisma.course.findUnique({
                where: {
                    id: courseId
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
            const studying = await prisma.studying.findFirst({
                where: {
                    courseId: courseId,
                    userId: req.session.user!.id
                }
            });
            if(studying == null){
                res.status(403).json("Você precisa começar este curso primeiro");
                return;
            }
            const levels = await prisma.level.findMany({
                where: {
                    courseId: Number(req.params.courseId),
                    order: {lte: studying.levels}
                },
                orderBy: {
                    order: 'asc'
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
    app.post("/startCourse/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido!");
                return;
            }
            const course = await prisma.course.findUnique({
                where: {
                    id: courseId
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
            const existingStudying = await prisma.studying.findFirst({
                where: {
                    userId: Number(req.session.user!.id),
                    courseId: courseId
                }
            });
            if(existingStudying){
                res.status(409).json("Você já está realizando este curso");
                return;
            }
            const studying = await prisma.studying.create({
                data: {
                    lifes: course.maxLifes,
                    userId: Number(req.session.user!.id),
                    courseId: course.id
                }
            });
            res.status(200).json(studying);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
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
    app.post("/levelUp/:courseId/:levelId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            const levelId = Number(req.params.levelId);
            if(isNaN(courseId) || isNaN(levelId)){
                res.status(400).json("ID inválido");
                return;
            }
            const level = await prisma.level.findUnique({
                where: { id: levelId },
                select: { order: true, courseId: true }
            });
            if(!level || level.courseId !== courseId){
                res.status(404).json("Nível não encontrado no curso especificado");
                return;
            }
            const result = await prisma.studying.updateMany({
                    where: {
                        courseId: courseId,
                        userId: req.session.user!.id,
                        levels: level.order
                    },
                    data: {
                        levels: { increment: 1 }
                    }
            });
            if(result.count === 0){
                    res.status(403).json("Não é possível subir de nível pois você não completou o nível atual.");
                    return;
            }
            res.sendStatus(200);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.get("/getStudying/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido");
                return;
            }
            const studying = await prisma.studying.findFirst({
                where: {
                    userId: req.session.user!.id,
                    courseId: courseId
                }
            });
            res.status(200).json(studying);
        }
        catch(er){
            res.status(500).json(er);
        }
    });
    app.post("/wrongAnswer/:levelId/:question", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const levelId = Number(req.params.levelId);
            const question = Number(req.params.question);
            if(isNaN(levelId) || isNaN(question)){
                res.status(400).json("ID inválido");
                return;
            }
            const level = await getLevelIfPublic(prisma, levelId);
            if(!level){
                res.status(404).json("Nível não encontrado");
                return;
            }
            if(!isQuizContentArray(level.content)){
                res.status(400).json("Este nível não é um quiz!");
                return;
            }
            const content = level.content as QuizContent[];
            await prisma.studying.updateMany({
                where: {
                    courseId: level.courseId,
                    userId: req.session.user!.id
                },
                data: {
                    lifes: {decrement: content[question].penalization}
                }
            });
            res.sendStatus(200);
        }
        catch(er){
            res.status(500).json(er);
        }
    });
    app.get("/getPractice/:courseId", requireLogin(prisma), async(req:Request, res:Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido");
                return;
            }
            // Verifica se o usuário já começou o curso
            const studying = await prisma.studying.findFirst({
                where: {
                    userId: req.session.user!.id,
                    courseId: courseId
                }
            });
            if(!studying){
                res.status(403).json("Você precisa começar este curso primeiro");
                return;
            }

            // Busca níveis do curso com order <= nível atual do usuário
            const levels = await prisma.level.findMany({
                where: {
                    courseId: courseId,
                    order: { lte: studying.levels }
                }
            });

            // Coleta perguntas de níveis que sejam quiz (content como array de QuizContent)
            const allQuestions: QuizContent[] = [];
            for(const level of levels){
                if(isQuizContentArray(level.content)){
                    const content = level.content as QuizContent[];
                    // concat questions
                    allQuestions.push(...content);
                }
            }

            // Embaralha e limita em 25 perguntas
            const shuffled = allQuestions.slice();
            for(let i = shuffled.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = tmp;
            }
            const limited = shuffled.slice(0, 25);

            res.status(200).json(limited);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.post("/finishPractice/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido");
                return;
            }
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { maxLifes: true }
            });
            if(!course){
                res.status(404).json("Curso não encontrado");
                return;
            }

            const studying = await prisma.studying.findFirst({
                where: {
                    courseId: courseId,
                    userId: req.session.user!.id
                }
            });
            if(!studying){
                res.status(403).json("Você precisa começar este curso primeiro");
                return;
            }

            if(studying.lifes >= course.maxLifes){
                // Já no máximo
                res.status(200).json({ message: "Vidas já no máximo", studying });
                return;
            }

            const updated = await prisma.studying.update({
                where: { id: studying.id },
                data: { lifes: { increment: 1 } }
            });

            res.status(200).json(updated);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.post("/addxp/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido");
                return;
            }

            const amount = Number(req.body.xp ?? req.body.amount ?? req.body.value);
            if(isNaN(amount) || amount <= 0){
                res.status(400).json("Quantidade de XP inválida");
                return;
            }

            const studying = await prisma.studying.findFirst({
                where: {
                    courseId: courseId,
                    userId: req.session.user!.id
                }
            });
            if(!studying){
                res.status(403).json("Você precisa começar este curso primeiro");
                return;
            }

            const updated = await prisma.studying.update({
                where: { id: studying.id },
                data: { xp: { increment: amount } }
            });

            res.status(200).json(updated);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.get("/userxp/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const courseId = Number(req.params.courseId);
            if(isNaN(courseId)){
                res.status(400).json("ID inválido");
                return;
            }
            const studying = await prisma.studying.findFirst({
                where: {
                    userId: req.session.user!.id,
                    courseId: courseId
                }
            });
            if(!studying){
                res.status(403).json("Você precisa começar este curso primeiro");
                return;
            }
            res.status(200).json({ xp: studying.xp });
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
}