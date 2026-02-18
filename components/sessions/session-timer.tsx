"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SessionTimerProps {
    onDurationChange: (durationMinutes: number) => void
    initialDuration?: number
}

export function SessionTimer({ onDurationChange, initialDuration = 0 }: SessionTimerProps) {
    const [seconds, setSeconds] = useState(initialDuration * 60)
    const [isActive, setIsActive] = useState(true) // Start active by default
    const [isVisible, setIsVisible] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1)
            }, 1000)
        } else if (!isActive && intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isActive])

    // Update parent component periodically (e.g. every minute) or on pause
    useEffect(() => {
        // Calculate minutes (rounded up if > 30s for invoicing, or just raw minutes)
        // Let's settle for integer minutes (floor or round). 
        // Logic: If you work 10 min 5 sec, it's 10 min. 
        const minutes = Math.floor(seconds / 60)
        onDurationChange(minutes)
    }, [seconds, onDurationChange])

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setSeconds(0)
    }

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60

        // Format HH:MM:SS
        const pad = (num: number) => num.toString().padStart(2, "0")
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    }

    if (!isVisible) {
        return (
            <div className="flex items-center gap-2 mb-6">
                <Switch
                    id="show-timer"
                    checked={isVisible}
                    onCheckedChange={setIsVisible}
                />
                <Label htmlFor="show-timer" className="text-muted-foreground">Visa Timer</Label>
            </div>
        )
    }

    return (
        <Card className={cn(
            "mb-8 p-6 transition-all border-l-4",
            isActive ? "border-l-primary bg-primary/5" : "border-l-slate-300 bg-slate-50"
        )}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Time Display */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-background rounded-full shadow-sm border">
                        <Clock className={cn("w-6 h-6", isActive && "text-primary animate-pulse")} />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                            Sessionstid
                        </Label>
                        <div className="text-4xl font-mono font-bold tracking-tight tabular-nums">
                            {formatTime(seconds)}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        variant={isActive ? "secondary" : "default"}
                        size="lg"
                        className="w-32"
                        onClick={toggleTimer}
                        type="button" // Prevent form submission
                    >
                        {isActive ? (
                            <>
                                <Pause className="w-4 h-4 mr-2" /> Pausa
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" /> Starta
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetTimer}
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Visibility Toggle (Bottom right or integrated) */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t w-full justify-end">
                <Label htmlFor="hide-timer" className="text-xs text-muted-foreground cursor-pointer">Dölj timer</Label>
                <Switch
                    id="hide-timer"
                    checked={isVisible}
                    onCheckedChange={setIsVisible}
                    className="scale-75"
                />
            </div>
        </Card>
    )
}
