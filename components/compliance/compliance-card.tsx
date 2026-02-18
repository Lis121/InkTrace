import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LucideIcon, ArrowRight, ExternalLink } from "lucide-react"
import { LawReference } from "./law-reference"

interface ComplianceCardProps {
    title: string
    icon: LucideIcon
    lawText: string
    lawReference?: string
    solutionText: string
    actionText: string
    href: string
    badgeText?: string
    badgeColor?: "default" | "secondary" | "destructive" | "outline" | "green" // Added custom green
    tip?: string
}

export function ComplianceCard({
    title,
    icon: Icon,
    lawText,
    lawReference,
    solutionText,
    actionText,
    href,
    badgeText,
    badgeColor = "default",
    tip
}: ComplianceCardProps) {
    return (
        <Card className="flex flex-col h-full border-l-4 border-l-slate-400">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Icon className="h-5 w-5 text-slate-700" />
                        </div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                    </div>
                    {badgeText && (
                        <Badge variant={badgeColor === "green" ? "default" : badgeColor} className={badgeColor === "green" ? "bg-green-600 hover:bg-green-700" : ""}>
                            {badgeText}
                        </Badge>
                    )}
                </div>
                {lawReference && <LawReference reference={lawReference} />}
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm text-slate-600 italic">
                    "{lawText}"
                </div>
                <div className="text-sm">
                    <p className="font-medium text-slate-900 mb-1">Inktrace Lösning:</p>
                    <p className="text-muted-foreground">{solutionText}</p>
                </div>
                {tip && (
                    <div className="flex gap-2 items-start text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-100">
                        <span className="font-bold">Tips:</span>
                        {tip}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Link href={href} className="w-full">
                    <Button variant="outline" className="w-full justify-between group">
                        {actionText}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
