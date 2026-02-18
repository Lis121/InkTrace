import { z } from "zod"

export const supplySchema = z.object({
    type: z.enum(["ink", "needle"], { message: "Typ måste vara 'ink' eller 'needle'" }),
    brand: z.string().min(1, { message: "Märke krävs" }),
    color_name: z.string().optional(),
    batch_number: z.string().min(1, { message: "Batch-nummer krävs" }),
    expires_at: z.string().min(1, { message: "Utgångsdatum krävs" }), // Will be date string from form
    name: z.string().optional(), // General name/description
})

export type SupplyInput = z.infer<typeof supplySchema>
