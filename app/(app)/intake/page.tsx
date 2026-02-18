import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import QRCode from "react-qr-code"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, TabletSmartphone } from "lucide-react"
import { IntakeListTable } from "@/components/intake/intake-list-table"
import { IntakeLinkCopy } from "@/components/intake/intake-link-copy"

export default async function IntakeDashboardPage() {
    const supabase = await createClient()

    // 1. Get User & Studio
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("studio_id")
        .eq("id", user.id)
        .single()

    if (!profile?.studio_id) {
        return <div className="p-8">Ingen studio hittades. Kontakta support.</div>
    }

    const studioId = profile.studio_id
    // Assume production URL or current host - for simplicity in MVP we use relative or window location logic on client, 
    // but here in server component we construct the path. The QR code needs a full URL.
    // In a real app, use an ENV variable for the BASE_URL. 
    // For now we'll assume localhost or the deployed domain is handled by the user knowing where they are, 
    // but for the QR code we probably want a functioning link.
    // Let's use a relative path for the Link, and for QR code getting the origin is tricky on server without headers.
    // We'll pass the relative path to a Client Component wrapper for the QR code if needed, 
    // OR just display a placeholder note if we can't determine domain.
    // BETTER FIX: Use a Client Component for the QR Code section to access window.location.origin

    // 2. Fetch Customer History
    const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: false })
        .limit(100) // Limit for performance in MVP

    return (
        <div className="flex flex-col gap-6 p-4 sm:px-6 sm:py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Intag & Hälsodeklarationer</h1>
                <p className="text-muted-foreground">Hantera din digitala reception och se historik.</p>
            </div>

            {/* Kiosk Launcher Card */}
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TabletSmartphone className="h-6 w-6 text-primary" />
                        Kiosk-läge
                    </CardTitle>
                    <CardDescription>
                        Detta är formuläret dina kunder använder. Öppna det på en surfplatta i receptionen eller låt kunden scanna QR-koden.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex-1 space-y-4">
                        <IntakeLinkCopy path={`/intake/${studioId}`} />
                        <div className="flex gap-3">
                            <Link href={`/intake/${studioId}`} target="_blank">
                                <Button size="lg" className="h-12 text-base">
                                    <ExternalLink className="mr-2 h-5 w-5" />
                                    Öppna Kundformulär
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Formuläret är anpassat för touch-skärmar och kräver inget inlogg för kunden.
                        </p>
                    </div>

                    {/* QR Code Section - We'll use a client component wrapper or just render it if we accept it might not point to full domain in dev without env vars. 
                        Actually, react-qr-code renders an SVG. 
                        We need the full URL for it to be useful for scanning.
                        Let's try to pass the path and let a small client component handle the origin.
                    */}
                    <KioskQRCode path={`/intake/${studioId}`} />
                </CardContent>
            </Card>

            {/* History Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Historik (Senaste 100)</h2>
                <IntakeListTable customers={customers || []} studioId={studioId} />
            </div>
        </div>
    )
}

// Small Client Component for QR Code to access window.location
import { KioskQRCode } from "@/components/intake/kiosk-qr-code"

export const runtime = 'edge'
