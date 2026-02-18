import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportsPageClient } from "@/components/reports/reports-page-client"

export default async function ReportsPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get user profile with studio
    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return <div className="p-8">Ingen studio hittades</div>
    }

    return <ReportsPageClient studioId={profile.studio_id} />
}

export const runtime = 'edge'
