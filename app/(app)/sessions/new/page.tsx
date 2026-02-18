import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionForm } from "@/components/sessions/session-form"

export const metadata = {
    title: "Ny Session | Inktrace",
}

interface PageProps {
    searchParams: Promise<{ customerId?: string }>
}

export default async function NewSessionPage({ searchParams }: PageProps) {
    const params = await searchParams
    const customerId = params.customerId
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // 2. Studio Check
    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return <div className="p-8">Ingen studio hittades.</div>
    }

    // 3. Validation: Need Customer ID
    if (!customerId) {
        return (
            <div className="p-8 max-w-md mx-auto text-center space-y-4">
                <h1 className="text-xl font-bold">Ingen kund vald</h1>
                <p className="text-muted-foreground">Gå tillbaka till översikten och välj en kund från listan.</p>
                {/* Could add a link/button back to dashboard */}
            </div>
        )
    }

    // 4. Fetch Data (Parallel)
    const [customerRes, inventoryRes] = await Promise.all([
        supabase
            .from("customers")
            .select("id, full_name")
            .eq("id", customerId)
            .eq("studio_id", profile.studio_id)
            .single(),
        supabase
            .from("inventory_items")
            .select("*")
            .eq("studio_id", profile.studio_id)
            .eq("is_archived", false)
            .order("brand", { ascending: true }) // Sort by brand then name
    ])

    if (customerRes.error || !customerRes.data) {
        return <div className="p-8">Kunde inte hitta kunden.</div>
    }

    // Sort inventory client-side or assume order
    // We fetched basic properties, let typescript infer or cast if needed in component
    // Assuming type matches roughly what the form expects
    const inventory = (inventoryRes.data || []) as any[]

    return (
        <div className="p-4 sm:px-6 sm:py-8 min-h-screen bg-muted/10">
            <SessionForm
                customer={customerRes.data}
                inventory={inventory}
            />
        </div>
    )
}

export const runtime = 'edge'
