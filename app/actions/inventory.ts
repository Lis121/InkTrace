"use server"

import { createClient } from "@/lib/supabase/server"
import { SupplyInput } from "@/lib/validations/inventory"
import { revalidatePath } from "next/cache"

export async function getInventory(studioId: string, showArchived = false) {
    const supabase = await createClient()

    let query = supabase
        .from("inventory_items")
        .select("*")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: false })

    if (!showArchived) {
        query = query.eq("is_archived", false)
    }

    const { data, error } = await query

    if (error) {
        console.error("Get Inventory Error:", error)
        return { error: "Kunde inte hämta lager." }
    }

    return { data }
}

export async function addSupplyItem(studioId: string, supply: SupplyInput) {
    const supabase = await createClient()

    const { error } = await supabase.from("inventory_items").insert({
        studio_id: studioId,
        type: supply.type,
        brand: supply.brand,
        name: supply.name || `${supply.brand} ${supply.color_name || supply.type}`,
        color_name: supply.color_name,
        batch_number: supply.batch_number,
        expires_at: supply.expires_at,
    })

    if (error) {
        console.error("Add Supply Error:", error)
        return { error: "Kunde inte lägga till förnödenhet." }
    }

    revalidatePath("/inventory")
    return { success: true }
}

export async function archiveItem(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("inventory_items")
        .update({ is_archived: true })
        .eq("id", id)

    if (error) {
        console.error("Archive Error:", error)
        return { error: "Kunde inte arkivera förnödenhet." }
    }

    revalidatePath("/inventory")
    return { success: true }
}

export async function openBottle(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("inventory_items")
        .update({ opened_at: new Date().toISOString().split("T")[0] }) // YYYY-MM-DD format
        .eq("id", id)

    if (error) {
        console.error("Open Bottle Error:", error)
        return { error: "Kunde inte öppna flaska." }
    }

    revalidatePath("/inventory")
    return { success: true }
}
