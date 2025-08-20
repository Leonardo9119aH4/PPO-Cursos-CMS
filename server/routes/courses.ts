import { PrismaClient, Course, Level } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { getUsers, requireLogin, users }  from "./users";
import fs from "fs/promises";
import path from "path";

function createUploader(storage: string, allowedTypes: string[], name: string){ // Cria um middleware de upload de arquivos com multer
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storage)
        },
        filename: (req, file, cb) => {
            cb(null, name+path.extname(file.originalname));
        }
    });
    return multer({
        storage: multerStorage,
        fileFilter: (req, file, cb) => {
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
}

async function verifyCourseAccess(req: Request, res: Response, prisma: PrismaClient): Promise<Course | null>{
    const course = await prisma.course.findUnique({
        where: {
            id: Number(req.params.courseId)
        },
        select:{
            id: true,
            title: true,
            maxLifes: true,
            description: true,
            secondsRecoveryLife: true,
            practiceRecoveryLife: true,
            thubnail: true,
            state: true,
            userId: true,
        }
    });
    if(!course){
        res.status(404).json("Curso não existe"); 
        return null;
    }
    if(course.userId != req.session.user!.id){
        res.status(403).json("Acesso negado");
        return null;
    }
    return course;
}

async function verifyLevelAccess(req: Request, res: Response, prisma: PrismaClient): Promise<Level | null>{
    const course = await verifyCourseAccess(req, res, prisma); // Se o usuário não possuir acesso, essa função já devolve a resposta de erro ao cliente
    if(!course){
        return null;
    }
    const level = await prisma.level.findFirst({
        select: {
            id: true,
            content: true,
            courseId: true,
            recoveryLifes: true,
            type: true,
            order: true
        },
        where: {
            order: Number(req.params.order),
            courseId: course.id
        }
    });
    if(level == null){
        res.status(404).json("Nível não encontrado");
    }
    return level;
}

export async function courses(app: Application, prisma: PrismaClient, storage: string) { 
    const imageExtensions = ["image/png", "image/jpg", "image/jpeg"];
    app.post("/newcourse", requireLogin(prisma), async (req, res)=>{ //rota para criar um novo minicurso
        try{
            const courseStorage: string = `${storage}/users/${req.session.user!.id}/courses/new`; //cria a pasta como new pois não se sabe o id do curso
            await fs.mkdir(courseStorage, {recursive: true});
            const uploader = createUploader(courseStorage, imageExtensions, "thubnail");
            uploader.single("thumbnail")(req, res, async function (err: any) {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({message: "Erro no upload", error: 4});
                }
                else if (err) {
                    return res.status(500).json("Erro interno");
                }
                if (!req.file) {
                    return res.status(415).json("Tipo não suportado");
                }
                try{ // é necessário outro try pra não crashar o servidor
                    const course = await prisma.course.create({
                    data: {
                        title: req.body.title,
                        maxLifes: Number(req.body.maxLifes),
                        description: req.body.description,
                        secondsRecoveryLife: 1000, //só para teste
                        practiceRecoveryLife: Number(req.body.practiceRecoveryLife),
                        thubnail: `/users/${req.session.user!.id}/courses/new/${req.file.filename}`, //salva o caminho como new pois não se sabe o id do curso
                        state: 0,
                        userId: req.session.user!.id
                        }
                    });
                    await fs.rename(courseStorage, `${storage}/users/${req.session.user!.id}/courses/${course.id}`); //altera o nome pasta de new para o id do curso
                    await prisma.course.update({
                        where: {id: course.id},
                        data: {thubnail: `/users/${req.session.user!.id}/courses/${course.id}/${req.file.filename}`} //altera o caminho no banco de dados, sincronizando com o disco
                    })
                    res.status(200).json("Enviado com sucesso");
                }
                catch(er){
                    await fs.rm(courseStorage, { recursive: true, force: true });
                    res.status(500).json("Algum erro ao salvar no banco de dados");
                }
            });
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    })
    app.get("/accountCourses", requireLogin(prisma), async (req: Request, res: Response) => { //rota para obter os cursos de um jogador
        try{
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    thubnail: true,
                    description: true,
                    maxLifes: true,
                    practiceRecoveryLife: true,
                    state: true,
                },
                where: {
                    userId: req.session.user!.id
                }
            });
            res.status(200).json(courses);
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
    app.post("/updateCourse/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        const course = await verifyCourseAccess(req, res, prisma);
        if(course==null){
            return;
        }
        await prisma.course.update({
            where: {
                id: course.id
            },
            data: {
                title: req.body.title,
                maxLifes: Number(req.body.maxLifes),
                description: req.body.description,
                secondsRecoveryLife: 1000, //só para teste
                practiceRecoveryLife: Number(req.body.practiceRecoveryLife),
            }
        })
    })
    app.get("/getFile/*", async (req: Request, res: Response) => {
        try{
            const relativePath = req.params[0]; // pega tudo após /getFile/
            const absolutePath = path.join(__dirname, "..", storage, relativePath);
            res.sendFile(absolutePath);
        }
        catch(er){
            res.send(500).json(er);
        }
    })
    app.get("/getCourseToEdit/:courseId", requireLogin(prisma), async (req: Request, res: Response) => { //rota para obter os níveis para a edição do minicurso
        try{
            const course = await verifyCourseAccess(req, res, prisma);
            if(course == null || course == undefined){
                if(!res.headersSent){
                    res.status(500).json("Erro crítico no servidor!");
                }
                return;
            }
            const levels = await prisma.level.findMany({ //é normal obter valor nulo
                select: {
                    type: true,
                    content: true,
                    recoveryLifes: true,
                    order: true,
                    courseId: true,
                },
                where: {
                    courseId: course.id,
                }
            })
            res.status(200).json({course, levels});
        }
        catch(er){
            res.status(500).json("Erro interno no servidor");
        }
    });
    app.post("/createLevel/:type/:courseId/:recoveryLifes", requireLogin(prisma), async (req: Request, res: Response) => {
        try{
            const course = await verifyCourseAccess(req, res, prisma);
            if(course == null || course == undefined){
                if(!res.headersSent){
                    res.status(500).json("Erro crítico no servidor!");
                }
                return;
            }
            const lastLevel = await prisma.level.findFirst({
                orderBy: {
                    order: 'desc'
                },
                where: {
                    courseId: Number(req.params.courseId)
                }
            });
            const level = await prisma.level.create({
                data: {
                    type: Number(req.params.type),
                    recoveryLifes: 0,
                    order: lastLevel ? lastLevel.order+1 : 0,
                    courseId: course.id
                }
            });
            res.status(200).json(level);
        }
        catch(er){
            res.status(500).json(er);
        }
    });
    app.get("/getleveltoedit/:courseId/:order", requireLogin(prisma), async (req: Request, res: Response)=>{
        try{
            const level = await verifyLevelAccess(req, res, prisma);
            if(level == null || level == undefined){
                if(!res.headersSent){ //se entrar aqui...
                    res.status(500).json("Erro crítico no servidor!");
                }
                return;
            }
            res.status(200).json(level);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
        
    });
    app.post("/saveLevel/:courseId/:order", requireLogin(prisma), async (req: Request, res: Response)=>{
        try{
            const level = await verifyLevelAccess(req, res, prisma); // Se não tiver, já envia a resposta de erro
            await prisma.level.update({
                where: {
                    id: level!.id
                },
                data: {
                    content: req.body
                }
            });
            res.sendStatus(200);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.delete("/deleteLevel/:courseId/:order", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const level = await verifyLevelAccess(req, res, prisma);
            if(level == null){
                return;
            }
            await prisma.level.updateMany({
                where: {
                    courseId: Number(req.params.courseId),
                    order: { gt: Number(req.params.order )}
                },
                data: {
                    order: { decrement: 1}
                }
            });
            await prisma.level.delete({
                where: {
                    id: level.id
                }
            });
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.post("/updateLevel/:courseId/:order", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const level = await verifyLevelAccess(req, res, prisma);
            if(level == null){
                return;
            }
            await prisma.level.update({
                data: {
                    recoveryLifes: Number(req.body.recoveryLifes)
                },
                where: {
                    id: level.id
                }
            });
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
    app.post("/publishCourse/:courseId", requireLogin(prisma), async(req: Request, res: Response)=>{
        try{
            const course = await verifyCourseAccess(req, res, prisma);
            if(course==null){
                return;
            }
            const levels = await prisma.level.findMany({ // O Prisma já retorna tudo por padrão
                where: {
                    courseId: course.id
                }
            });
            let theoricLevelExistance: boolean = false;
            let quizLevelExistance: boolean = false;
            for(const level of levels){
                if(level.type == 0 && level.content != null){
                    theoricLevelExistance = true;
                }
                if(level.type == 1 && level.content != null){
                    quizLevelExistance = true;
                }
            }
            if(theoricLevelExistance && quizLevelExistance){
                await prisma.course.update({
                    where: {
                        id: course.id
                    },
                    data: {
                        state: 1
                    }
                });
                res.status(200).json(course);
            }
            else{
                res.status(400).json("O curso está incompleto");
            }
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
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
}