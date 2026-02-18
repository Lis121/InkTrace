import { z } from "zod"

export const sessionSchema = z.object({
    customer_id: z.string().uuid({ message: "Ogiltigt kund-ID" }),
    body_placement: z.string().optional(),
    used_supplies: z.array(z.string().uuid()).min(1, {
        message: "Du måste välja minst en förnödenhet"
    }),
    notes: z.string().optional(),
    performed_at: z.string().optional(), // ISO datetime string
})

export type SessionInput = z.infer<typeof sessionSchema>
