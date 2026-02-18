"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

export function KioskQRCode({ path }: { path: string }) {
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    if (!origin) return <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg" />

    const fullUrl = `${origin}${path}`

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border shadow-sm">
            <div className="bg-white p-2">
                <QRCode value={fullUrl} size={120} />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Scanna mig</p>
        </div>
    )
}
