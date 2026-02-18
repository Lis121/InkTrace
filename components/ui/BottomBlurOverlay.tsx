"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function BottomBlurOverlay() {
    const [isClient, setIsClient] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        setIsClient(true)

        // Find the footer - ensure "site-footer" ID exists on your footer component
        const footer = document.querySelector("footer") || document.getElementById("site-footer")

        if (!footer) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Hide overlay when footer enters viewport (is intersecting)
                setIsVisible(!entry.isIntersecting)
            },
            {
                // rootMargin: '100px' -> Start fading out 100px before footer enters
                rootMargin: "100px",
                threshold: 0
            }
        )

        observer.observe(footer)

        return () => {
            observer.disconnect()
        }
    }, [])

    if (!isClient) return null

    // Configuration for tweaks
    // Height: 90px mobile, 130px desktop (Eden style)
    // Blur levels: 18px (bottom/strong), 10px (middle/soft)
    // Mask stops: Fades out at 95-100%

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[60] pointer-events-none h-[90px] md:h-[130px] transition-opacity duration-300 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
            )}
            aria-hidden="true"
        >
            <div className="absolute inset-0 w-full h-full">

                {/* LAYER A: Stark blur (Bottom heavy) 
                    Backdrop-filter: blur(18px) saturate(160%)
                */}
                <div
                    className="absolute inset-0"
                    style={{
                        backdropFilter: "blur(18px) saturate(160%)",
                        WebkitBackdropFilter: "blur(18px) saturate(160%)",
                        // Light gradient for white background theme
                        background: "linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.28) 55%, rgba(255,255,255,0) 95%)",
                        // Image mask to control intensity
                        maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 95%)",
                        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 95%)",
                    }}
                />

                {/* LAYER B: Mid/Upper Blur (Extension) 
                    Backdrop-filter: blur(10px) saturate(140%)
                */}
                <div
                    className="absolute inset-0"
                    style={{
                        backdropFilter: "blur(10px) saturate(140%)",
                        WebkitBackdropFilter: "blur(10px) saturate(140%)",
                        // Softer gradient extension
                        background: "linear-gradient(to top, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.14) 65%, rgba(255,255,255,0) 100%)",
                        // Mask fading out completely at top
                        maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0) 100%)",
                    }}
                />

                {/* LAYER C: Micro Hairline / Shadow 
                    Subtle edge at the very bottom
                */}
                <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                        height: "1px",
                        background: "rgba(0,0,0,0.06)",
                        opacity: 0.25
                    }}
                />
            </div>
        </div>
    )
}
