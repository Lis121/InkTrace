"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Package } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
    studioId: string
}

export function QuickActions({ studioId }: QuickActionsProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex gap-3">
                    <Link href={`/intake/${studioId}`} className="flex-1">
                        <Button variant="outline" className="w-full h-14" size="lg">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Ny walk-in
                        </Button>
                    </Link>
                    <Link href="/inventory" className="flex-1">
                        <Button variant="outline" className="w-full h-14" size="lg">
                            <Package className="mr-2 h-5 w-5" />
                            Lager
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
