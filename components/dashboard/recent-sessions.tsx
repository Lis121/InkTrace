"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Session = {
    id: string
    performed_at: string
    customers: {
        full_name: string
    }[] | null
}

interface RecentSessionsProps {
    sessions: Session[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
    if (sessions.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">Inga tidigare sessioner</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kund</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => {
                            const date = new Date(session.performed_at).toLocaleDateString('sv-SE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })

                            return (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">
                                        {session.customers?.[0]?.full_name || "Okänd"}
                                    </TableCell>
                                    <TableCell>{date}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">Slutförd</Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
