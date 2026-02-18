import { z } from "zod"

export const feedbackSchema = z.object({
    type: z.enum(["bug", "feature", "other"]),
    message: z.string().min(10, {
        message: "Meddelandet måste vara minst 10 tecken långt.",
    }),
    contactConsent: z.boolean().optional(),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
