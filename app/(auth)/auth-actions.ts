"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginInput, SignupInput } from "@/lib/validations/auth"
import { headers } from "next/headers"

export async function login(data: LoginInput) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    })

    if (error) {
        return { error: error.message }
    }

    // Refresh component
    redirect("/dashboard")
}

export async function signup(data: SignupInput) {
    const supabase = await createClient()
    const origin = (await headers()).get("origin")

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: `${data.firstName} ${data.lastName}`,
            },
            // For MVP, simplify email verification flow or keep it default.
            // If needed, we can set up email redirects here.
        },
    })

    if (error) {
        return { error: error.message }
    }

    // For MVP: Auto-login is not default in Supabase if confirm email is on. 
    // But our DB trigger relies on user creation. 
    // If email confirmation is OFF, they are logged in.
    // If ON, they need to check email.

    return { success: true, message: "Kolla din e-post för att bekräfta ditt konto." }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}
