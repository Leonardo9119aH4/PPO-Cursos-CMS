import { PrismaClient } from "@prisma/client";
import { Application, Request, Response } from "express";
import bcrypt from "bcrypt";

type User = {
    id: number | null,
    username: string | null,
    password: string | null,
    realname: string | null,
    email: string | null,
    phone: string | null
}

function verifyDataConflict(users: User[], username: string, email: string){
    for(let i = 0; i < users.length; i++){
        if(users[i].username === username){
            return {status: 409, message: "Nome de usuário já existente"};
        }
        if(users[i].email === email){
            return {status: 409, message: "Email já existente"};
        }
    }
    return {status: 200};
}

function verifyPasswordSecurity(password: string){ 
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if(!regex.test(password)){
        return {status: 400, message: "A senha precisa ter pelo menos 8 caracteres e ao menos 1 número, 1 maiúscula, 1 minúscula e 1 caractere especial."};
    }
    return {status: 200};
}

export async function users(app: Application, prisma: PrismaClient){
    app.post("/signup", async (req: Request, res: Response)=>{
        try{
            if(req.body.username == null || req.body.email == null || req.body.password == null){
                res.status(400).json("Informações incompletas");
                return; // interrompe a execução do código ao devolver a resposta ao servidor
            }
            const users: User[] = (await prisma.user.findMany({
                select: {
                    username: true,
                    email: true
                }
            })).map(user => {
                return { //esse return é do map, e não para interromper a função
                    id: null, 
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
            res.status(201).json(user); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
        catch(er){
            console.log(er)
            res.status(500).json(er); // não há necessidade de return porque não há codigo a ser executado depois disso
        }
    })
    
}


