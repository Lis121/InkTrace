"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

interface IntakeLinkCopyProps {
    path: string
}

export function IntakeLinkCopy({ path }: IntakeLinkCopyProps) {
    const [origin, setOrigin] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const fullUrl = origin ? `${origin}${path}` : path

    const handleCopy = () => {
        if (!origin) return
        navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        toast.success("Länk kopierad till urklipp!")

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow-sm">
            <span className="text-sm font-semibold text-muted-foreground pl-2 whitespace-nowrap">URL:</span>
            <code className="flex-1 text-sm font-mono text-slate-700 truncate bg-slate-50 px-2 py-1 rounded">
                {origin ? fullUrl : "Laddar..."}
            </code>
            <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                disabled={!origin}
                className="h-8 w-8 p-0"
                title="Kopiera länk"
            >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    )
}
