import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "../types";
import { JWT_SECRET } from "../config";
import { prisma } from "@repo/db"

export const signup = async (req: Request, res: Response) => {
    const parsedData = signupSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid input" })
        return
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    });
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return
    }

    bcrypt.hash(parsedData.data.password, 15, async function (err, hashedPassword) {
        try {
            const user = await prisma.user.create({
                data: {
                    name: parsedData.data.name,
                    email: parsedData.data.email,
                    password: hashedPassword,
                }
            })
            const token = jwt.sign({ userId: user.id }, JWT_SECRET);
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};

export const login = async (req: Request, res: Response) => {
    const parsedData = signinSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid input" })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: parsedData.data.email }
        })

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return
        }
        const isValid = await bcrypt.compare(parsedData.data.password, user.password)
        if (!isValid) {
            res.status(401).json({ message: "Invalid email or password" })
            return
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
};