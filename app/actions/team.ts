"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for adding a member
const addMemberSchema = z.object({
    fullName: z.string().min(2, "Namn måste vara minst 2 tecken"),
    email: z.string().email("Ogiltig e-postadress"),
    password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
    role: z.enum(["artist", "apprentice", "owner"]),
})

export type AddMemberInput = z.infer<typeof addMemberSchema>

export async function createTeamMember(data: AddMemberInput) {
    // 1. Validate Input
    const parsed = addMemberSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Ogiltig data i formuläret." }
    }

    // 2. Auth Check (Must be Owner)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Du måste vara inloggad." }

    const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("studio_id, role")
        .eq("id", user.id)
        .single()

    if (!requesterProfile || requesterProfile.role !== 'owner') {
        return { error: "Endast ägare kan lägga till medlemmar." }
    }

    // 3. Initialize Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: "Serverkonfiguration saknas (Service Role Key)." }
    }

    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 4. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
            full_name: data.fullName
        }
    })

    if (authError || !authUser.user) {
        console.error("Auth Create Error:", authError)
        return { error: `Kunde inte skapa användare: ${authError?.message}` }
    }

    // 5. Create Profile Entry
    // Note: Trigger might handle this, but explicit insert ensures role/studio are correct immediately
    // If you have a trigger that creates profile on user creation, you might get a duplicate key error here.
    // Assuming NO trigger for now based on "Create a Server Action... Step 2: Insert a row".

    // Check if profile exists (in case trigger created it)
    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authUser.user.id)
        .single()

    if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                studio_id: requesterProfile.studio_id,
                full_name: data.fullName,
                role: data.role
            })
            .eq("id", authUser.user.id)

        if (updateError) {
            console.error("Profile Update Error:", updateError)
            return { error: "Användare skapad men profil kunde inte uppdateras." }
        }
    } else {
        // Insert new profile
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: authUser.user.id,
                studio_id: requesterProfile.studio_id,
                full_name: data.fullName,
                role: data.role
            })

        if (profileError) {
            console.error("Profile Insert Error:", profileError)
            // Rollback auth user? Ideally yes, but complex. 
            // For MVP, we instruct user to check list.
            await adminClient.auth.admin.deleteUser(authUser.user.id)
            return { error: "Kunde inte skapa profil. Användaren togs bort." }
        }
    }

    revalidatePath("/team")
    return { success: true }
}
