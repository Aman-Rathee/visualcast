import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
})

export const signinSchema = z.object({
    email: z.string(),
    password: z.string(),
})