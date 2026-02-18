import { z } from "zod"

// Swedish personal number regex (simple validation YYYYMMDD-XXXX)
const personIdRegex = /^\d{8}-\d{4}$/

export const intakeSchema = z.object({
    // Step 1: Personal Details
    fullName: z.string().min(2, { message: "Name is required" }),
    personId: z.string().regex(personIdRegex, { message: "Måste vara 12 siffror (ÅÅÅÅMMDD-XXXX)" }),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),

    // Step 2: Health Declaration
    health: z.object({
        bloodBorne: z.boolean().default(false),
        pregnant: z.boolean().default(false),
        diabetes: z.boolean().default(false),
        influence: z.boolean().default(false),
        allergies: z.boolean().default(false),
        allergiesDetail: z.string().optional(),
    }),

    // Step 3: Signature (Base64 data URL)
    signature: z.string().min(10, { message: "Signature is required" }),
})

export type IntakeInput = z.infer<typeof intakeSchema>
