import { Scale } from "lucide-react"

interface LawReferenceProps {
    reference: string
}

export function LawReference({ reference }: LawReferenceProps) {
    return (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded">
            <Scale className="h-3 w-3" />
            <span className="font-medium">{reference}</span>
        </div>
    )
}
