"use server"

import { createClient } from "@/lib/supabase/server"
import { bookingSchema, type BookingInput } from "@/lib/validations/booking"
import { revalidatePath } from "next/cache"
import { formatISO } from "date-fns"

export async function preBookCustomer(formData: BookingInput) {
    const supabase = await createClient()

    // 1. Validate Input
    const result = bookingSchema.safeParse(formData)
    if (!result.success) {
        return { error: "Ogiltig data: " + result.error.issues[0].message }
    }
    const data = result.data

    // 2. Get User/Studio Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Du måste vara inloggad." }
    }

    // 3. Get Studio ID
    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return { error: "Ingen studio hittades för din användare." }
    }

    // 4. Insert Customer
    // NOTE: We use data.bookingDate as created_at to simulate "Booking Date".
    // In a real system you might want a separate booking_date column.

    // We construct the timestamp using the provided Date and Time
    const bookingDate = new Date(data.bookingDate)
    const [hours, minutes] = data.bookingTime.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)

    const { error: insertError } = await supabase
        .from("customers")
        .insert({
            studio_id: profile.studio_id,
            full_name: data.fullName,
            person_id: data.personId || null, // Allow null
            email: data.email || null,
            phone: data.phone || null,
            created_at: bookingDate.toISOString(), // Future date!
            health_declaration: {}, // Empty JSON for now
            signature_url: null, // Explicitly null -> "Unsigned"
        })

    if (insertError) {
        console.error("Booking Error:", insertError)
        return { error: "Kunde inte boka kunden. Försök igen." }
    }

    revalidatePath("/dashboard")
    return { success: true }
}
