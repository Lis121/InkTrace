"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddSupplySheet } from "./add-supply-sheet"
import { archiveItem, openBottle } from "@/app/actions/inventory"
import { toast } from "sonner"
import { MoreVertical, Plus, Search } from "lucide-react"

type InventoryItem = {
    id: string
    brand: string | null
    type: string | null
    color_name: string | null
    batch_number: string | null
    expires_at: string | null
    opened_at: string | null
    name: string
    is_archived: boolean
    created_at: string
}

interface InventoryClientProps {
    initialItems: InventoryItem[]
    studioId: string
}

export function InventoryClient({ initialItems, studioId }: InventoryClientProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [items, setItems] = useState(initialItems)
    const [searchTerm, setSearchTerm] = useState("")
    const [showArchived, setShowArchived] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Avoid hydration mismatch by only rendering on client
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null // or a simplified skeleton if preferred, but null prevents the error cleanly
    }

    // Calculate status
    const getStatus = (expiresAt: string | null, isArchived: boolean) => {
        if (isArchived) return { label: "Arkiverad", color: "secondary" as const }
        if (!expiresAt) return { label: "Aktiv", color: "default" as const }

        const today = new Date()
        const expDate = new Date(expiresAt)
        const daysUntilExpiry = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) return { label: "Utgången", color: "destructive" as const }
        if (daysUntilExpiry < 30) return { label: "Snart utgången", color: "outline" as const }
        return { label: "Aktiv", color: "default" as const }
    }

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesSearch =
            searchTerm === "" ||
            item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.color_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesArchive = showArchived ? true : !item.is_archived

        return matchesSearch && matchesArchive
    })

    const handleArchive = async (id: string) => {
        const result = await archiveItem(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Förnödenhet arkiverad")
            setItems(items.map(item => item.id === id ? { ...item, is_archived: true } : item))
        }
    }

    const handleOpen = async (id: string) => {
        const result = await openBottle(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Flaska öppnad")
            const today = new Date().toISOString().split("T")[0]
            setItems(items.map(item => item.id === id ? { ...item, opened_at: today } : item))
        }
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Sök batch eller märke..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {showArchived ? "Visa arkiverade" : "Visa aktiva"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setShowArchived(false)}>
                            Visa aktiva
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowArchived(true)}>
                            Visa arkiverade
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => setIsSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Märke</TableHead>
                            <TableHead>Färg/Typ</TableHead>
                            <TableHead>Batch #</TableHead>
                            <TableHead>Utgångsdatum</TableHead>
                            <TableHead>Öppnad</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    Inga förnödenheter hittades
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => {
                                const status = getStatus(item.expires_at, item.is_archived)
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.brand || "—"}</TableCell>
                                        <TableCell>
                                            {item.type === "ink" ? item.color_name || "Bläck" : "Nål"}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{item.batch_number || "—"}</TableCell>
                                        <TableCell>{item.expires_at || "—"}</TableCell>
                                        <TableCell>
                                            {item.opened_at ? (
                                                <span className="text-sm">{item.opened_at}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Ej öppnad</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.color}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {!item.opened_at && !item.is_archived && (
                                                        <DropdownMenuItem onClick={() => handleOpen(item.id)}>
                                                            Öppna flaska
                                                        </DropdownMenuItem>
                                                    )}
                                                    {!item.is_archived && (
                                                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                                                            Arkivera
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddSupplySheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                studioId={studioId}
                onSuccess={(newItem) => {
                    setItems([newItem, ...items])
                    setIsSheetOpen(false)
                }}
            />
        </>
    )
}
