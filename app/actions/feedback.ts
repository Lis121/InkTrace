"use server"

import { createClient } from "@/lib/supabase/server"
import { feedbackSchema, type FeedbackInput } from "@/lib/validations/feedback"

export async function submitFeedback(data: FeedbackInput) {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Du måste vara inloggad." }
    }

    // 2. Get Studio ID (Securely from Server)
    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return { error: "Ingen studio kopplad till ditt konto." }
    }

    // 3. Validate Input
    const validation = feedbackSchema.safeParse(data)
    if (!validation.success) {
        return { error: "Ogiltigt format på inmatningen." }
    }

    const { type, message } = validation.data

    // 4. Insert into Database
    // Note: contactConsent implies we can contact them, which we know via their user_id
    const { error: insertError } = await supabase
        .from("feedback")
        .insert({
            user_id: user.id,
            studio_id: profile.studio_id,
            type,
            message,
            status: "new"
        })

    if (insertError) {
        console.error("Feedback Insert Error:", insertError)
        return { error: "Kunde inte spara feedback. Försök igen senare." }
    }

    return { success: true }
}
