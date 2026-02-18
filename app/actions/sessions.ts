"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type CreateSessionInput = {
    customerId: string
    itemIds: string[]
    bodyPlacement?: string
    notes?: string
    durationMinutes?: number
}

export async function createSession(data: CreateSessionInput) {
    const supabase = await createClient()

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Du måste vara inloggad." }
    }

    // 2. Get Studio
    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return { error: "Ingen studio kopplad." }
    }

    // 3. Validate
    if (!data.customerId) {
        return { error: "Ingen kund vald." }
    }
    if (!data.itemIds || data.itemIds.length === 0) {
        return { error: "Du måste välja minst ett material (färg/nål)." }
    }

    // 4. Create Session
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
            customer_id: data.customerId,
            artist_id: user.id,
            studio_id: profile.studio_id,
            body_placement: data.bodyPlacement,
            notes: data.notes,
            performed_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (sessionError || !session) {
        console.error("Session creation failed:", sessionError)
        return { error: "Kunde inte skapa session." }
    }

    // 5. Link Items (session_items)
    // Prepare rows
    const sessionItems = data.itemIds.map(itemId => ({
        session_id: session.id,
        item_id: itemId,
        studio_id: profile.studio_id
    }))

    const { error: itemsError } = await supabase
        .from("session_items")
        .insert(sessionItems)

    if (itemsError) {
        // Critical error: Session created but items failed.
        // In a real transactional system we'd roll back. 
        // Here we'll log it. Ideally we should delete the session.
        console.error("Session items linking failed:", itemsError)
        await supabase.from("sessions").delete().eq("id", session.id)
        return { error: "Kunde inte spara materialval." }
    }

    // 6. Success
    revalidatePath("/dashboard")
    revalidatePath("/reports")
    redirect("/dashboard?sessionCreated=true")
}
