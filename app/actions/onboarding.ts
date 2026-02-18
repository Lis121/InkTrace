"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const onboardingSchema = z.object({
    orgNumber: z.string().min(1, "Organisationsnummer krävs"),
    city: z.string().min(1, "Ort måste anges"),
    brand: z.string().min(1, "Märke krävs"),
    color: z.string().min(1, "Färg krävs"),
    batch: z.string().min(1, "Batchnummer krävs"),
    openedAt: z.string().nullable().optional(), // ISO date string or null
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

// Helper to get admin client
function getAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY")
        return null
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function completeOnboarding(data: OnboardingInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Du måste vara inloggad." }
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile || !profile.studio_id) {
        return { error: "Ingen studio kopplad till användaren." }
    }

    const parsed = onboardingSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Ogiltig data: " + parsed.error.issues.map(e => e.message).join(", ") }
    }
    const { orgNumber, city, brand, color, batch, openedAt } = parsed.data

    // Use Admin Client if available to bypass RLS, otherwise fallback to normal client
    const adminSupabase = getAdminClient()
    const db = adminSupabase || supabase

    // 2. Update Studio (Org No, City, onboarding_completed = true)
    const { data: updatedStudio, error: studioError } = await db
        .from("studios")
        .update({
            city: city,
            org_number: orgNumber,
            onboarding_completed: true
        })
        .eq("id", profile.studio_id)
        .select()

    if (studioError) {
        console.error("Studio Update Error:", studioError)
        return { error: "Kunde inte uppdatera studiouppgifter." }
    }

    // 3. Insert First Inventory Item
    // Also use privileged client if available
    const { error: inventoryError } = await db
        .from("inventory_items")
        .insert({
            studio_id: profile.studio_id,
            name: `${brand} - ${color}`,
            brand,
            color_name: color,
            batch_number: batch,
            type: "ink",
            opened_at: openedAt || null,

            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })

    if (inventoryError) {
        console.error("Inventory Error:", inventoryError)
        return { error: `Kunde inte lägga till din första färg: ${inventoryError.message || JSON.stringify(inventoryError)}` }
    }

    revalidatePath("/inventory")
    return { success: true }
}
