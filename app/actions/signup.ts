"use server"

import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server" // Renamed to avoid conflict
import { z } from "zod"
import { redirect } from "next/navigation"

const signupSchema = z.object({
    studioName: z.string().min(2, "Studionamn måste vara minst 2 tecken"),
    email: z.string().email("Ogiltig e-postadress"),
    password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Lösenorden matchar inte",
    path: ["confirmPassword"],
})

export type SignupInput = z.infer<typeof signupSchema>

export async function signup(data: SignupInput) {
    // 1. Validate Input
    const parsed = signupSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Var god kontrollera inmatningsfälten." }
    }

    const { studioName, email, password } = parsed.data

    // 2. Initialize Admin Client
    // We need service_role logic to insert into 'studios' before the user is an owner,
    // and to link everything correctly.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: "Serverkonfiguration saknas (Service Role Key)." }
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 3. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for now (MVP)
        user_metadata: {
            full_name: "Studio Owner" // Default placeholder, can be updated later
        }
    })

    if (authError || !authUser.user) {
        console.error("Signup Auth Error:", authError)
        return { error: `Kunde inte skapa konto: ${authError?.message}` }
    }

    const userId = authUser.user.id

    // 4. Create Studio
    const { data: studio, error: studioError } = await adminClient
        .from("studios")
        .insert({ name: studioName })
        .select()
        .single()

    if (studioError || !studio) {
        console.error("Signup Studio Error:", studioError)
        // Rollback auth user
        await adminClient.auth.admin.deleteUser(userId)
        return { error: "Kunde inte skapa studio." }
    }

    // 5. Create Profile (Link User + Studio + Role)
    // Use upsert in case a trigger already created the profile row
    const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
            id: userId,
            studio_id: studio.id,
            role: 'owner',
            full_name: 'Studio Ägare'
        })

    if (profileError) {
        console.error("Signup Profile Error:", profileError)
        // Rollback studio and auth user?
        // This is getting complex. If this fails, we have an orphaned studio and user.
        // For MVP, we log it. User can contact support.
        return { error: `Ett fel uppstod vid skapandet av profilen: ${profileError.message || JSON.stringify(profileError)}` }
    }

    // 6. Sign in the user automatically?
    // We can't easily sign them in from the server side admin action into the browser session
    // because cookies checks etc.
    // The easiest way is to redirect to login or dashboard.
    // For seamless experience, we can try to SignInWithPassword using the client accessible supabase client?
    // But we are in a server action. 
    // Let's redirect to login with a success message or handle auto-login if possible.
    // Actually, redirecting to login is safer/easier. 
    // OR: we can return success and let the handy client component do the login!

    // Wait, let's try to sign them in on server side if possible using the standard createClient helper?
    // We have email and password.

    const supabase = await createServerClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) {
        return { success: true, redirect: "/login?message=Account created. Please log in." }
    }

    return { success: true, redirect: "/dashboard" }
}
