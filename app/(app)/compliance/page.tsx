import { ShieldCheck, FileText, AlertTriangle, Syringe, FileDown, CheckCircle } from "lucide-react"
import { ComplianceCard } from "@/components/compliance/compliance-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CompliancePage() {
    return (
        <div className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-slate-700">
                    <ShieldCheck className="h-8 w-8" />
                    <h1 className="text-3xl font-bold tracking-tight">Din Egenkontroll</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl">
                    Miljöförvaltningen kräver att du har rutiner för spårbarhet och säkerhet (Miljöbalken).
                    Så här täcker Inktrace ryggen på dig och hjälper dig följa lagen:
                </p>
            </div>

            {/* The 4 Pillars of Compliance */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">

                {/* 1. Spårbarhet */}
                <ComplianceCard
                    title="Spårbarhet"
                    icon={FileText}
                    lawText="Verksamheten ska kunna redovisa vilka färger som använts på vilken kund vid vilket tillfälle."
                    lawReference="SOSFS 2006:4"
                    solutionText="Varje session kopplas automatiskt till de Batchnummer du väljer. Inget faller mellan stolarna."
                    actionText="Gå till Rapporter & Loggar"
                    href="/reports"
                    badgeText="AUTOMATISERAD"
                    badgeColor="green"
                />

                {/* 2. Kemikalieförteckning */}
                <ComplianceCard
                    title="Kemikalieförteckning"
                    icon={Syringe}
                    lawText="En förteckning över alla kemiska produkter (färger, städ, desinfektion) ska finnas tillgänglig."
                    lawReference="Miljöbalken Kap 14"
                    solutionText="Ditt digitala Lager fungerar som din förteckning. Se till att alla flaskor är registrerade med Batchnummer."
                    actionText="Hantera Lager"
                    href="/inventory"
                    tip="Kom ihåg att spara tillverkarens varublad (MSDS) i en fysisk pärm eller digital mapp vid sidan av."
                />

                {/* 3. Utgångsdatum & Öppning */}
                <ComplianceCard
                    title="Sterilitet & Datum"
                    icon={AlertTriangle}
                    lawText="Material får inte användas efter utgångsdatum. Öppnade förpackningar ska hanteras enligt tillverkarens instruktion."
                    lawReference="HSLF-FS 2022:16"
                    solutionText="Systemet håller koll. När du öppnar en flaska, klicka 'Öppna' i lagret så varnar vi när tiden går ut."
                    actionText="Kontrollera Utgångsdatum"
                    href="/inventory"
                />

                {/* 4. Hälsodeklaration */}
                <ComplianceCard
                    title="Hälsodeklaration"
                    icon={CheckCircle}
                    lawText="Kunden ska informeras om risker och ge sitt samtycke innan behandling påbörjas."
                    lawReference="Informationsplikt"
                    solutionText="Alla kunder får signera digitalt via surfplattan. Deklarationerna arkiveras säkert och är sökbara."
                    actionText="Mina Kunder"
                    href="/dashboard" /* Or customers link if exists, defaulting to dashboard for list */
                    badgeText="DIGITAL SIGNATUR"
                    badgeColor="secondary"
                />
            </div>

            {/* Emergency / Inspection Mode */}
            <div className="mt-8">
                <Card className="border-2 border-slate-800 bg-slate-900 text-slate-50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl text-white">
                            <ShieldCheck className="h-8 w-8 text-green-400" />
                            Inspektör på besök?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-slate-300">
                            Ta det lugnt. Du har allt under kontroll. Följ dessa steg för att visa din regelefterlevnad:
                        </p>
                        <ol className="space-y-3 list-decimal list-inside bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <li className="font-medium pl-2">Hälsa välkommen och visa din surfplatta med Inktrace.</li>
                            <li className="font-medium pl-2">Klicka på <span className="text-white font-bold">Rapporter</span> i menyn.</li>
                            <li className="font-medium pl-2">Välj "Senaste 6 månaderna" och klicka <span className="text-white font-bold">Generera PDF</span>.</li>
                            <li className="font-medium pl-2">Visa PDF:en för inspektören. Den innehåller all spårbarhet (kunder, datum, batchnummer) de kräver.</li>
                        </ol>
                        <div className="pt-2">
                            <Link href="/reports">
                                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14">
                                    <FileDown className="mr-2 h-5 w-5" />
                                    Gå till Rapporter nu
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* External Links */}
            <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Vill du läsa lagtexten i original? Besök <a href="https://www.socialstyrelsen.se/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Socialstyrelsen</a> eller <a href="https://www.naturvardsverket.se/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Naturvårdsverket</a>.</p>
            </div>
        </div>
    )
}

export const runtime = 'edge'
