import { z } from "zod"

export const bookingSchema = z.object({
    fullName: z.string().min(2, { message: "Namn måste anges." }),
    bookingDate: z.date(),
    bookingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Ogiltigt tidsformat." }),
    personId: z.string().optional(), // Optional for pre-booking
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
