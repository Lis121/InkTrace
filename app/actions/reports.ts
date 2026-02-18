"use server"

import { createClient } from "@/lib/supabase/server"

export type ReportSession = {
    id: string
    performed_at: string
    customer_name: string
    customer_person_id: string
    artist_name: string
    materials: {
        brand: string
        color_name: string | null
        batch_number: string
    }[]
}

export type ReportData = {
    studio_name: string
    org_number: string | null
    sessions: ReportSession[]
    start_date: string
    end_date: string
}

export async function getReportData(
    studioId: string,
    startDate: string,
    endDate: string
): Promise<ReportData | null> {
    const supabase = await createClient()

    // Get studio details
    const { data: studio } = await supabase
        .from("studios")
        .select("name, org_number")
        .eq("id", studioId)
        .single()

    if (!studio) return null

    // Get sessions in date range
    const { data: sessions } = await supabase
        .from("sessions")
        .select(`
      id,
      performed_at,
      used_supplies,
      customers (
        full_name,
        person_id
      ),
      profiles (
        full_name
      )
    `)
        .eq("studio_id", studioId)
        .gte("performed_at", `${startDate}T00:00:00`)
        .lte("performed_at", `${endDate}T23:59:59`)
        .order("performed_at", { ascending: true })

    if (!sessions || sessions.length === 0) {
        return {
            studio_name: studio.name,
            org_number: studio.org_number,
            sessions: [],
            start_date: startDate,
            end_date: endDate,
        }
    }

    // Extract all unique supply IDs from all sessions
    const allSupplyIds = new Set<string>()
    sessions.forEach((session: any) => {
        if (Array.isArray(session.used_supplies)) {
            session.used_supplies.forEach((id: string) => allSupplyIds.add(id))
        }
    })

    // Fetch all inventory items in one query
    const { data: inventoryItems } = await supabase
        .from("inventory_items")
        .select("id, brand, color_name, batch_number, name")
        .in("id", Array.from(allSupplyIds))

    // Create lookup map
    const inventoryMap = new Map(
        inventoryItems?.map(item => [item.id, item]) || []
    )

    // Transform sessions
    const reportSessions: ReportSession[] = sessions.map((session: any) => {
        const materials = (session.used_supplies || [])
            .map((supplyId: string) => {
                const item = inventoryMap.get(supplyId)
                if (!item) return null
                return {
                    brand: item.brand || "Okänd",
                    color_name: item.color_name,
                    batch_number: item.batch_number || "—",
                }
            })
            .filter((m: any) => m !== null)

        return {
            id: session.id,
            performed_at: session.performed_at,
            customer_name: session.customers?.[0]?.full_name || "Okänd",
            customer_person_id: session.customers?.[0]?.person_id || "—",
            artist_name: session.profiles?.[0]?.full_name || "Okänd",
            materials,
        }
    })

    return {
        studio_name: studio.name,
        org_number: studio.org_number,
        sessions: reportSessions,
        start_date: startDate,
        end_date: endDate,
    }
}
