"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Search, User, ArrowRight } from "lucide-react"

interface Customer {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    sessions: { count: number }[]
    last_visit: string | null
}

interface CustomerListTableProps {
    customers: Customer[]
}

export function CustomerListTable({ customers: initialCustomers }: CustomerListTableProps) {
    const router = useRouter()
    const [search, setSearch] = useState("")

    const filteredCustomers = initialCustomers.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Sök på namn eller e-post..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Namn</TableHead>
                            <TableHead>Kontakt</TableHead>
                            <TableHead>Antal Sessioner</TableHead>
                            <TableHead>Senaste Besök</TableHead>
                            <TableHead className="text-right">Åtgärd</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Inga kunder hittades.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map(customer => (
                                <TableRow
                                    key={customer.id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => router.push(`/customers/${customer.id}`)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            {customer.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            <span>{customer.email || "-"}</span>
                                            <span>{customer.phone || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{customer.sessions?.[0]?.count || 0}</span>
                                    </TableCell>
                                    <TableCell>
                                        {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
