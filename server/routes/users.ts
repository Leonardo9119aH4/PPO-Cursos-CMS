import { PrismaClient } from "@prisma/client";
import { Application, Request, Response } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs/promises";
import session from "express-session"

export type User = { // Define o tipo User com os campos necessários
    id: number,
    username: string | null,
    password: string | null,
    realname: string | null,
    email: string | null,
    phone: string | null
}

export async function getUsers(prisma: PrismaClient){ // Busca todos os usuários do banco de dados e retorna um array de objetos User
    const users: User[] = (await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            realname: true,
            email: true,
            phone: true
        }
    })).map(user => {
        return { //esse return é do map, e não para interromper a função
            id: user.id, 
            username: user.username,
            password: null,
            realname: user.realname, 
            email: user.email,
            phone: user.phone
        }
    })
    return users;
}

function verifyDataConflict(users: User[], username: string | null, email: string | null, ignoreUser?: User){ // Verifica se há conflito de dados com os usuários existentes
    for(let i = 0; i < users.length; i++){
        if(ignoreUser != undefined && users[i].id === ignoreUser.id) continue; //pula o usuário atual
        if(username != null && users[i].username === username){
            return {status: 409, message: "Nome de usuário já existente"};
        }
        if(email != null && users[i].email === email){
            return {status: 409, message: "Email já existente"};
        }
    }
    return {status: 200};
}

function verifyPasswordSecurity(password: string){ // Verifica se a senha atende aos requisitos de segurança
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/;
    if(!regex.test(password)){
        return {status: 400, message: "A senha precisa ter pelo menos 8 caracteres e ao menos 1 número, 1 maiúscula, 1 minúscula e 1 caractere especial.", error: 3};
    }
    return {status: 200};
}

export function requireLogin(prisma: PrismaClient){ // função fábrica que cria o middleware requireLogin
    return async (req: Request, res: Response, next: Function) => { // middleware para verificar se a sessão existe e se é válida
        let userExists: Boolean = false;
        if(!req.session.user){
            res.status(401).json("Não autenticado");
            return;
        }
        const users = await prisma.user.findMany({
            select: {
                id: true
            }
        })
        for(const user of users){ // evita sessões com usuário fantasma
            if(user.id == req.session.user.id){
                userExists = true;
                break;
            }
        }
        if(!userExists){
            req.session.destroy(er => {
                if(er){
                    res.status(500).json("Erro com sessão inválida");
                    return;
                }
                res.clearCookie("connect.sid");
                res.status(401).json("Não autenticado");
                return;
            });
        }
        next();
    }  
}

export async function users(app: Application, prisma: PrismaClient, storage: string): Promise<void> { // Define as rotas relacionadas aos usuários
    app.post("/signup", async (req: Request, res: Response)=>{ // Rota para criar uma nova conta de usuário
        try{
            if(req.body.username == null || req.body.email == null || req.body.password == null){
                res.status(400).json({message: "Informações incompletas", error: 2});
                return; // interrompe a execução do código ao devolver a resposta ao servidor
            }
            const users: User[] = (await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            })).map(user => {
                return { //esse return é do map, e não para interromper a função
                    id: user.id, 
                    username: user.username,
                    password: null, 
                    realname: null, 
                    email: user.email,
                    phone: null 
                }
            })
            const dataConflict = verifyDataConflict(users, req.body.username, req.body.email);
            if(dataConflict.status !== 200){
                res.status(dataConflict.status).json(dataConflict.message);
                return; // interrompe a execução do código ao devolver a resposta ao servidor
            }
            const passwordSecurity = verifyPasswordSecurity(req.body.password);
            if(passwordSecurity.status !== 200){
                res.status(passwordSecurity.status).json({message: passwordSecurity.message, error: 3});
                return; // interrompe a execução do código ao devolver a resposta ao servidor
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = await prisma.user.create({
                data: {
                    username: req.body.username,
                    password: hashedPassword,
                    realname: req.body.realname,
                    email: req.body.email,
                    phone: req.body.phone
                }
            });
            await fs.mkdir(`${storage}/users/${user.id}/courses`, {recursive: true});
            res.status(201).json("Conta criada com sucesso"); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
        catch(er){
            console.log(er)
            res.status(500).json(er); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
    });

    app.post("/signin", async (req: Request, res: Response)=>{ // Rota para fazer login de um usuário existente
        try{
            if(req.body.login == null || req.body.password == null){
                res.status(400).json({message: "Informações incompletas", error: 2});
                return; // interrompe a execução do código ao devolver a resposta ao servidor
            }
            const users: User[] = (await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    password: true
                }
            })).map(user => {
                return { //esse return é do map, e não para interromper a função
                    id: user.id, 
                    username: user.username,
                    password: user.password, 
                    realname: null, 
                    email: user.email,
                    phone: null 
                }
            })
            for(const user of users){
                if(req.body.login === user.email || req.body.login === user.username){
                    if(user.password == null){
                        res.status(500).json("Erro no banco de dados!");
                        return;
                    }
                    else{
                        if(await bcrypt.compare(req.body.password, user.password)){
                            req.session.user = user;
                            res.status(200).json("Login realizado com êxito.")
                            return;
                        }
                        else{
                            res.status(401).json("Usuário, email e/ou senha incorreto(s)");
                            return;
                        }
                    }
                }
            }
            res.status(401).json("Usuário, email e/ou senha incorreto(s)"); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
        catch(er){
            console.log(er)
            res.status(500).json(er); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
    });

    app.get("/getinfo", requireLogin(prisma), async (req: Request, res: Response)=>{
        res.status(200).json(req.session.user);
    });

    app.delete("/logout", async (req: Request, res: Response) => { // Rota para fazer logout do usuário
        req.session.destroy(er => {
            if(er){
                return res.status(500).json("Erro ao realizar logout");
            }
            res.clearCookie("connect.sid");
            return res.status(200).json("Logout realizado com êxito!");
        });
    });

    app.put("/update", requireLogin(prisma), async (req: Request, res: Response) => { // Rota para atualizar as informações do usuário logado
        try{    
            const users = await getUsers(prisma);
            const dataConflict = verifyDataConflict(users, req.body.username, req.body.email, req.session.user);
            if(dataConflict.status !== 200){ //evita conflitos  
                res.status(dataConflict.status).json(dataConflict.message);
                return;
            }
            const data: any = {}; // evitar que campos nulos altererem o valor
            if(req.body.username !== null && req.body.username !== undefined && req.body.username.trim() !== "") data.username = req.body.username;
            if(req.body.realname !== null && req.body.realname !== undefined && req.body.realname.trim() !== "") data.realname = req.body.realname;
            if (req.body.email !== null && req.body.email !== undefined && req.body.email.trim() !== "") data.email = req.body.email;
            if(req.body.phone !== null && req.body.phone !== undefined && req.body.phone.trim() !== "") data.phone = req.body.phone;
            const user = await prisma.user.update({
                where: {id: req.session.user!.id},
                data
            });
            req.session.user = user;
            res.status(200).json(user);
        }
        catch(er){
            res.status(500).json(er);
        }
    });

    app.post("/updatePassword", async (req: Request, res: Response)=>{ 
        
    });

    app.get("/getUserPublicInfo/:userId", async(req: Request, res: Response)=>{
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: Number(req.params.userId)
                }
            });
            if(user==null){
                res.status(404).json("Usuário não encontrado");
                return;
            }
            res.status(200).json(user);
        }
        catch(er){
            console.log(er);
            res.status(500).json(er);
        }
    });
}
