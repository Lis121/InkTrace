"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { CustomerDetailSheet } from "./customer-detail-sheet"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


interface Customer {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    pnr: string | null
    health_declaration: any
    signature_url: string | null
    created_at: string
}

interface IntakeListTableProps {
    customers: Customer[]
    studioId: string
}


export function IntakeListTable({ customers: initialCustomers, studioId }: IntakeListTableProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    useEffect(() => {
        setCustomers(initialCustomers)
    }, [initialCustomers])

    useEffect(() => {
        const supabase = createClient()
        console.log("Setting up Realtime subscription for studio:", studioId)

        const channel = supabase
            .channel('realtime-intake')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'customers',
                    filter: `studio_id=eq.${studioId}`,
                },
                (payload) => {
                    console.log("Realtime event received:", payload)
                    const newCustomer = payload.new as Customer
                    setCustomers((prev) => [newCustomer, ...prev])
                    toast.success(`Ny hälsodeklaration mottagen: ${newCustomer.full_name}`)
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status)
                if (status === 'SUBSCRIBED') {
                    // toast.info("Ansluten till live-uppdateringar")
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [studioId])

    const handleRefresh = async () => {
        router.refresh()
        toast.info("Uppdaterar listan...")
    }

    const filteredCustomers = customers.filter((customer) => {
        const query = searchQuery.toLowerCase()
        return (
            customer.full_name.toLowerCase().includes(query) ||
            (customer.pnr && customer.pnr.replace(/-/g, "").includes(query.replace(/-/g, "")))
        )
    })

    return (
        <div className="space-y-4">
            {/* Search Bar & Refresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-sm flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Sök på namn eller personnummer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Uppdatera
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Namn</TableHead>
                            <TableHead>Personnummer</TableHead>
                            <TableHead>Registrerad</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Åtgärd</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Inga kunder hittades.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="animate-in fade-in slide-in-from-top-1 duration-300">
                                    <TableCell className="font-medium">{customer.full_name}</TableCell>
                                    <TableCell>{customer.pnr || "-"}</TableCell>
                                    <TableCell>
                                        {format(new Date(customer.created_at), "d MMM yyyy", { locale: sv })}
                                        <span className="text-xs text-muted-foreground block">
                                            {format(new Date(customer.created_at), "HH:mm")}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {customer.signature_url ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Signerad
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                Väntar
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <CustomerDetailSheet customer={customer} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground text-center">
                Visar {filteredCustomers.length} av {customers.length} kunder
            </div>
        </div>
    )
}
