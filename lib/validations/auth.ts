import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Ogiltig e-postadress" }),
    password: z.string().min(6, { message: "Lösenordet måste vara minst 6 tecken" }),
})

export const signupSchema = z.object({
    firstName: z.string().min(2, { message: "Förnamn krävs" }),
    lastName: z.string().min(2, { message: "Efternamn krävs" }),
    email: z.string().email({ message: "Ogiltig e-postadress" }),
    password: z.string().min(6, { message: "Lösenordet måste vara minst 6 tecken" }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
