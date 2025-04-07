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
            return {status: 409, message: "Username already exists"};
        }
        if(users[i].email === email){
            return {status: 409, message: "Email already exists"};
        }
    }
    return {status: 200};
}

function verifyPasswordSecurity(password: string){ 
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if(!regex.test(password)){
        return {status: 400, message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"};
    }
    return {status: 200};
}

export async function users(app: Application, prisma: PrismaClient){
    app.post("/signup", async (req: Request, res: Response)=>{
        try{
            if(req.body.username == null || req.body.email == null || req.body.password == null){
                res.status(400).json("Missing data");
            }
            const users: User[] = (await prisma.user.findMany({
                select: {
                    username: true,
                    email: true
                }
            })).map(user => {
                return {
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
            }
            const passwordSecurity = verifyPasswordSecurity(req.body.password);
            if(passwordSecurity.status !== 200){
                res.status(passwordSecurity.status).json(passwordSecurity.message);
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
            res.status(201).json(user);
        }
        catch(er){
            res.status(500).json(er);
        }
    })
    
}


