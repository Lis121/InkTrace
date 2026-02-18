import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomerQueueCard } from "@/components/dashboard/customer-queue-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { BookingDialog } from "@/components/dashboard/booking-dialog"
import { CalendarDays, Users, CalendarClock, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return <div className="p-8">Ingen studio hittades</div>
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Fetch today's customers
    const { data: todaysCustomers } = await supabase
        .from("customers")
        .select("*")
        .eq("studio_id", profile.studio_id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .order("created_at", { ascending: true })

    // Fetch future bookings (Tomorrow onwards)
    // We simple fetch everything > Today end
    const { data: futureBookings } = await supabase
        .from("customers")
        .select("*")
        .eq("studio_id", profile.studio_id)
        .gt("created_at", `${today}T23:59:59`)
        .order("created_at", { ascending: true })
        .limit(10) // Limit just in case

    // Separate today's customers into Signed (Ready) and Unsigned (To Do)
    const unsignedCustomers = todaysCustomers?.filter(c => !c.signature_url) || []
    const signedCustomers = todaysCustomers?.filter(c => c.signature_url) || []

    // Fetch recent sessions
    const { data: recentSessions } = await supabase
        .from("sessions")
        .select(`
      id,
      performed_at,
      notes,
      customer_id,
      customers (
        full_name
      )
    `)
        .eq("studio_id", profile.studio_id)
        .order("performed_at", { ascending: false })
        .limit(5)

    // Get greeting based on time
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "God morgon" : hour < 18 ? "God eftermiddag" : "God kväll"

    // Format date
    const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const formattedDate = dateFormatter.format(new Date())

    return (
        <div className="flex flex-col gap-6 p-4 sm:px-6 sm:py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span className="capitalize">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{todaysCustomers?.length || 0} kunder idag</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <BookingDialog />
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions studioId={profile.studio_id} />

            {/* Today's Intake - Split View */}
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Unsigned / To Do */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <h2 className="text-xl font-semibold">Att Signera <span className="text-muted-foreground text-base font-normal">({unsignedCustomers.length})</span></h2>
                        </div>
                        {unsignedCustomers.length === 0 ? (
                            <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                                Inga väntande signeringar
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {unsignedCustomers.map(customer => (
                                    <div key={customer.id} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{customer.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Bokad: {format(new Date(customer.created_at), "HH:mm")}
                                            </p>
                                        </div>
                                        <Button size="sm" variant="outline" className="border-amber-200 hover:bg-amber-100 hover:text-amber-900" asChild>
                                            <Link href={`/intake/${profile.studio_id}?customerId=${customer.id}`}>
                                                Signera
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Signed / Ready */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-semibold">Klara för Session <span className="text-muted-foreground text-base font-normal">({signedCustomers.length})</span></h2>
                        </div>
                        {signedCustomers.length === 0 ? (
                            <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                                Inga signerade kunder redo
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {signedCustomers.map(customer => (
                                    <CustomerQueueCard key={customer.id} customer={customer} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Future Bookings */}
            {futureBookings && futureBookings.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Kommande Bokningar</h2>
                    </div>

                    <div className="bg-white rounded-lg border divide-y">
                        {futureBookings.map(booking => (
                            <div key={booking.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center bg-slate-100 rounded w-12 h-12">
                                        <span className="text-xs font-bold uppercase text-slate-500">
                                            {format(new Date(booking.created_at), "MMM", { locale: sv })}
                                        </span>
                                        <span className="text-lg font-bold leading-none">
                                            {format(new Date(booking.created_at), "d")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{booking.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.person_id || "Ej angivet personnummer"}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary">Ej Signerad</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Sessions */}
            <div className="space-y-4 pt-4 border-t">
                <h2 className="text-2xl font-semibold">Senaste sessioner</h2>
                <RecentSessions sessions={recentSessions || []} />
            </div>
        </div>
    )
}
