"use server"

import { createClient } from "@/lib/supabase/server"
import { IntakeInput } from "@/lib/validations/intake"
import { v4 as uuidv4 } from "uuid"

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string) {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "")
    return Buffer.from(base64Data, "base64")
}

export async function submitIntake(studioId: string, data: IntakeInput) {
    const supabase = await createClient()

    // 1. Upload Signature
    const signatureBuffer = base64ToBuffer(data.signature)
    const signatureFileName = `${studioId}/${uuidv4()}.png`

    const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(signatureFileName, signatureBuffer, {
            contentType: "image/png",
            upsert: false,
        })

    if (uploadError) {
        console.error("Upload Error:", uploadError)
        return { error: "Failed to upload signature." }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from("signatures")
        .getPublicUrl(signatureFileName)

    // 2. Insert Customer Record
    const { error: dbError } = await supabase.from("customers").insert({
        studio_id: studioId,
        full_name: data.fullName,
        person_id: data.personId,
        email: data.email || null,
        phone: data.phone || null,
        health_declaration: data.health, // supbase handles jsonb automatically
        signature_url: publicUrl,
        // Add additional fields if necessary from health data
        notes: data.health.allergies ? `Allergies: ${data.health.allergiesDetail}` : null
    })

    if (dbError) {
        console.error("DB Error:", dbError)
        return { error: "Failed to save customer data." }
    }

    return { success: true }
}
