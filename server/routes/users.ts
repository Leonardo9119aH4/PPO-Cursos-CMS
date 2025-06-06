import { PrismaClient } from "@prisma/client";
import { Application, Request, Response } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs/promises";

type User = { // Define o tipo User com os campos necessários
    id: number,
    username: string | null,
    password: string | null,
    realname: string | null,
    email: string | null,
    phone: string | null
}

async function getUsers(prisma: PrismaClient){ // Busca todos os usuários do banco de dados e retorna um array de objetos User
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
export default getUsers;

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
        return {status: 400, message: "A senha precisa ter pelo menos 8 caracteres e ao menos 1 número, 1 maiúscula, 1 minúscula e 1 caractere especial."};
    }
    return {status: 200};
}

function randomString(count: number): string{ //gera a chave de autenticação a ser salva no cookie
    const chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result: string = "";
    for(let i=0; i<count; i++){
        result += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return result;
}

async function getLoggedUser(prisma: PrismaClient, userKey: string){ // Busca o usuário logado com base na chave de autenticação
    const authKeys = await prisma.authKey.findMany({
        select: {
            key: true,
            userId: true,
        }
    });
    const users = await getUsers(prisma);
    for(const authKey of authKeys){
        if(authKey.key == userKey){
            for(const user of users){
                if(user.id == authKey.userId){
                    return user;
                }
            }
            console.error("AuthKey referenciando usuário inexistente");
            return null;
        }
    }
    return null;
}

export async function users(app: Application, prisma: PrismaClient, storage: string){ // Define as rotas relacionadas aos usuários
    app.post("/signup", async (req: Request, res: Response)=>{ // Rota para criar uma nova conta de usuário
        try{
            if(req.body.username == null || req.body.email == null || req.body.password == null){
                res.status(400).json("Informações incompletas");
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
                res.status(passwordSecurity.status).json(passwordSecurity.message);
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
            await fs.mkdir(`${storage}/users/${user.id}`, {recursive: true});
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
                res.status(400).json("Informações incompletas");
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
                            const authKey = randomString(20);
                            await prisma.authKey.create({
                                data: {
                                    key: authKey,
                                    userId: user.id,
                                },
                            });
                            res.cookie('authKey', authKey, {
                                path: '/',
                                secure: false,
                                httpOnly: true,
                                sameSite: "lax",
                            });
                            res.status(200).json("Logado com sucesso!");
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

    app.get("/getinfo", async (req: Request, res: Response)=>{ // Rota para obter informações do usuário logado
        if(req.cookies.authKey == null){
            res.status(204).json("Sem conta logada");
            return;
        }
        const user = await getLoggedUser(prisma, req.cookies.authKey);
        if(user == null){
            res.clearCookie('authKey', {
                path: "/", 
                secure: false,    
                httpOnly: true,   
                sameSite: "lax"
            });
            res.status(404).json("Sem usuário para chave fornecida");
            return;
        }
        res.status(200).json(user);
    });

    app.delete("/logout", async (req: Request, res: Response) => { // Rota para fazer logout do usuário
        const userKey = req.cookies.authKey;
        if (!userKey) {
            res.status(400).json("Chave de autenticação não encontrada.");
            return;
        }
        res.clearCookie("authKey", {
            path: "/", 
            secure: false,    
            httpOnly: true,   
            sameSite: "lax" 
        });
        await prisma.authKey.delete({
            where: {
                key: userKey
            }
        });
        res.status(200).json("Logout realizado com sucesso!");
    });

    app.put("/update", async (req: Request, res: Response) => { // Rota para atualizar as informações do usuário logado
        try{
            if(req.cookies.authKey == null){
                res.status(204).json("Sem conta logada");
                return;
            }
            const user = await getLoggedUser(prisma, req.cookies.authKey);
            if(user == null){
                res.clearCookie('authKey', {
                    path: "/", 
                    secure: false,    
                    httpOnly: true,   
                    sameSite: "lax"
                });
                res.status(404).json("Sem usuário para chave fornecida");
                return;
            }
            const users = await getUsers(prisma);
            const dataConflict = verifyDataConflict(users, req.body.username, req.body.email, user);
            if(dataConflict.status !== 200){ //evita conflitos  
                res.status(dataConflict.status).json(dataConflict.message);
                return;
            }
            const data: any = {}; // evitar que campos nulos altererem o valor
            if(req.body.username !== null && req.body.username !== undefined && req.body.username.trim() !== "") data.username = req.body.username;
            if(req.body.realname !== null && req.body.realname !== undefined && req.body.realname.trim() !== "") data.realname = req.body.realname;
            if (req.body.email !== null && req.body.email !== undefined && req.body.email.trim() !== "") data.email = req.body.email;
            if(req.body.phone !== null && req.body.phone !== undefined && req.body.phone.trim() !== "") data.phone = req.body.phone;
            await prisma.user.update({
                where: {id: user.id},
                data
            });
            res.status(200).json(user);
        }
        catch(er){
            res.status(500).json(er);
        }

    });

    app.post("/updatePassword", async (req: Request, res: Response)=>{ 

    })
}
