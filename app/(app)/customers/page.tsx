import { createClient } from "@/lib/supabase/server"
import { CustomerListTable } from "@/components/customers/customer-list-table"
import { Users } from "lucide-react"

export default async function CustomersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Du måste vara inloggad.</div>
    }

    // Fetch customers with session counts
    const { data: customers } = await supabase
        .from("customers")
        .select(`
            id,
            full_name,
            email,
            phone,
            sessions (count)
        `)
        .order("full_name", { ascending: true })

    // Also fetch last visit date for each customer is a bit complex in one query without a view or rpc, 
    // but for now we can fetch the list and maybe we don't show last visit immediately 
    // OR we fetch sessions separately.
    // Let's improve the query: 
    // Actually Supabase JS client handles nested selects well.
    // We can select sessions limited to 1 order by date desc to get last visit.

    const { data: customersWithLastVisit } = await supabase
        .from("customers")
        .select(`
            id,
            full_name,
            email,
            phone,
            sessions (
                performed_at
            )
        `)
        .order("full_name")

    // Process data to match CustomerListTable interface
    const processedCustomers = customersWithLastVisit?.map((c: any) => {
        // Sort sessions to find last visit
        const sortedSessions = c.sessions?.sort((a: any, b: any) =>
            new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
        )
        const lastVisit = sortedSessions?.[0]?.performed_at || null

        return {
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            phone: c.phone,
            sessions: [{ count: c.sessions?.length || 0 }], // Mock structure to match interface expecting count array/obj
            last_visit: lastVisit
        }
    }) || []

    return (
        <div className="flex flex-col gap-6 p-4 sm:px-6 sm:py-8 container mx-auto">
            <div className="flex items-center gap-3 border-b pb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kundregister</h1>
                    <p className="text-muted-foreground">Hantera dina kunder och se deras historik.</p>
                </div>
            </div>

            <CustomerListTable customers={processedCustomers} />
        </div>
    )
}

export const runtime = 'edge'
