"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Play } from "lucide-react"
import { useRouter } from "next/navigation"

type Customer = {
    id: string
    full_name: string
    created_at: string
    health_declaration: Record<string, any> | null
}

interface CustomerQueueCardProps {
    customer: Customer
}

export function CustomerQueueCard({ customer }: CustomerQueueCardProps) {
    const router = useRouter()

    // Check if customer has any health risks
    const hasHealthRisks = customer.health_declaration
        ? Object.values(customer.health_declaration).some((value) => value === true)
        : false

    // Format time
    const time = new Date(customer.created_at).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const handleStartSession = () => {
        router.push(`/sessions/new?customerId=${customer.id}`)
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold leading-none">{customer.full_name}</h3>
                        <p className="text-sm text-muted-foreground">Registrerad {time}</p>
                    </div>
                    {hasHealthRisks ? (
                        <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Risk
                        </Badge>
                    ) : (
                        <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle className="h-3 w-3" />
                            OK
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleStartSession}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                >
                    <Play className="mr-2 h-5 w-5" />
                    STARTA SESSION
                </Button>
            </CardContent>
        </Card>
    )
}
