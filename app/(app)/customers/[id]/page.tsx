import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Calendar, Clock, History } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch customer details including session count and sessions
    const { data: customer } = await supabase
        .from("customers")
        .select(`
            *,
            sessions (
                id,
                performed_at,
                duration_minutes,
                notes,
                body_placement,
                session_items (
                    inventory_items (
                        brand,
                        name,
                        type
                    )
                )
            )
        `)
        .eq("id", id)
        .single()

    if (!customer) {
        notFound()
    }

    // Sort sessions descending
    const sessions = (customer.sessions || []).sort((a: any, b: any) =>
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    )

    const totalSessions = sessions.length
    const totalMinutes = sessions.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const totalTimeFormatted = `${hours}h ${minutes}m`
    const lastVisit = sessions[0]?.performed_at ? format(new Date(sessions[0].performed_at), "d MMM yyyy", { locale: sv }) : "-"

    return (
        <div className="flex flex-col gap-8 p-4 sm:px-8 sm:py-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/customers" className="w-fit">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Tillbaka till registret
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{customer.full_name}</h1>
                        <div className="flex gap-4 text-muted-foreground mt-1">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vital Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
                        <CardTitle className="text-sm font-medium">Totalt Antal Sessioner</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSessions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
                        <CardTitle className="text-sm font-medium">Total Tid Tatuerad</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTimeFormatted}</div>
                        <p className="text-xs text-muted-foreground">Baserat på loggad tid</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
                        <CardTitle className="text-sm font-medium">Senaste Besök</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lastVisit}</div>
                    </CardContent>
                </Card>
            </div>

            {/* History Timeline */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Historik</h2>
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <p className="text-muted-foreground">Ingen historik än.</p>
                    ) : (
                        sessions.map((session: any) => (
                            <Card key={session.id} className="overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b py-3 px-6">
                                    <div className="flex justify-between items-center">
                                        <div className="font-semibold text-lg flex items-center gap-2">
                                            {format(new Date(session.performed_at), "d MMMM yyyy", { locale: sv })}
                                        </div>
                                        {session.duration_minutes > 0 && (
                                            <Badge variant="secondary" className="font-mono">
                                                {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Placering & Noteringar</h3>
                                        <p className="font-medium text-md">{session.body_placement || "Ingen placering angiven"}</p>
                                        {session.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{session.notes}"</p>}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Använt Material</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {session.session_items?.map((itemLink: any, idx: number) => {
                                                const item = itemLink.inventory_items
                                                return (
                                                    <Badge key={idx} variant="outline" className="bg-white">
                                                        {item?.brand} - {item?.name}
                                                    </Badge>
                                                )
                                            })}
                                            {(!session.session_items || session.session_items.length === 0) && (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export const runtime = 'edge'
