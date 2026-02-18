import { createClient } from "@/lib/supabase/server"
import { InventoryClient } from "@/components/inventory/inventory-client"
import { redirect } from "next/navigation"

export default async function InventoryPage() {
    const supabase = await createClient()

    // Get current user's studio
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return <div className="p-8">Ingen studio hittades</div>
    }

    // Fetch inventory
    const { data: items } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("studio_id", profile.studio_id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4 p-4 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lager</h1>
                    <p className="text-muted-foreground">
                        Hantera bläck, nålar och batchnummer
                    </p>
                </div>
            </div>

            <InventoryClient
                initialItems={items || []}
                studioId={profile.studio_id}
            />
        </div>
    )
}
