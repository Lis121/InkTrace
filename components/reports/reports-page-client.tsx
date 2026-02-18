"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"
import { getReportData, type ReportData } from "@/app/actions/reports"
import { TraceabilityDocument } from "@/components/reports/traceability-document"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { toast } from "sonner"

interface ReportsPageClientProps {
    studioId: string
}

export function ReportsPageClient({ studioId }: ReportsPageClientProps) {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Set default dates (current month)
    useEffect(() => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        setStartDate(firstDay.toISOString().split("T")[0])
        setEndDate(lastDay.toISOString().split("T")[0])
        setIsClient(true) // Enable PDF download after hydration
    }, [])

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            toast.error("Välj start- och slutdatum")
            return
        }

        setIsLoading(true)
        try {
            const data = await getReportData(studioId, startDate, endDate)
            if (data) {
                setReportData(data)
                toast.success(`Rapport genererad med ${data.sessions.length} sessioner`)
            } else {
                toast.error("Kunde inte hämta data")
            }
        } catch (error) {
            toast.error("Ett fel uppstod")
        } finally {
            setIsLoading(false)
        }
    }

    const fileName = `Inktrace_Rapport_${startDate}_${endDate}.pdf`

    return (
        <div className="flex flex-col gap-6 p-4 sm:px-6 sm:py-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Miljörapporter</h1>
                <p className="text-muted-foreground mt-1">
                    Generera spårbarhetsdokumentation för Miljöförvaltningen
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Skapa rapport</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Startdatum</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Slutdatum</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Genererar...
                                </>
                            ) : (
                                <>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Generera rapport
                                </>
                            )}
                        </Button>

                        {isClient && reportData && (
                            <PDFDownloadLink
                                document={<TraceabilityDocument data={reportData} />}
                                fileName={fileName}
                                className="flex-1"
                            >
                                {({ loading }) => (
                                    <Button variant="outline" disabled={loading} className="w-full">
                                        {loading ? "Förbereder PDF..." : "Ladda ner PDF"}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>

                    {reportData && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm">
                                <strong>Förhandsgranskning:</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {reportData.sessions.length} sessioner från {reportData.start_date} till{" "}
                                {reportData.end_date}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
