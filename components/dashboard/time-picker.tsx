"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimePickerProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
    stepMinutes?: number // Default: 30
    minTime?: string // Default: "08:00"
    maxTime?: string // Default: "20:00"
}

export function TimePicker({
    value = "",
    onChange,
    disabled,
    className,
    stepMinutes = 30, // CONFIG: Justera tidsintervall här
    minTime = "08:00", // CONFIG: Starttid för listan
    maxTime = "20:00", // CONFIG: Sluttid för listan
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value)

    // Sync internal state with external value
    React.useEffect(() => {
        setInputValue(value)
    }, [value])

    // Generate time slots
    const timeSlots = React.useMemo(() => {
        const slots: string[] = []
        const [minHour, minMinute] = minTime.split(":").map(Number)
        const [maxHour, maxMinute] = maxTime.split(":").map(Number)

        let current = new Date()
        current.setHours(minHour, minMinute, 0, 0)

        const end = new Date()
        end.setHours(maxHour, maxMinute, 0, 0)

        while (current <= end) {
            const timeString = current.toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
            })
            slots.push(timeString)
            current.setMinutes(current.getMinutes() + stepMinutes)
        }
        return slots
    }, [stepMinutes, minTime, maxTime])

    // Handle manual input change with masking
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newVal = e.target.value.replace(/[^0-9:]/g, "") // Allow digits and colon

        // Auto-insert colon after 2 digits if not present
        if (newVal.length === 2 && !newVal.includes(":")) {
            newVal += ":"
        }

        // Prevent typing more than 5 chars (HH:MM)
        if (newVal.length > 5) {
            newVal = newVal.slice(0, 5)
        }

        setInputValue(newVal)
    }

    // Validate and commit on blur
    const handleBlur = () => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (inputValue && !timeRegex.test(inputValue)) {
            if (inputValue.length > 0) {
                setInputValue(value) // Revert if invalid
            }
        } else {
            if (inputValue !== value) {
                onChange(inputValue)
            }
        }
    }

    const handleSlotSelect = (time: string) => {
        onChange(time)
        setInputValue(time)
        setOpen(false)
    }

    const handleQuickSelect = (type: "now" | "plus30") => {
        const now = new Date()
        if (type === "plus30") {
            now.setMinutes(now.getMinutes() + 30)
        }
        const timeStr = now.toLocaleTimeString("sv-SE", { hour: '2-digit', minute: '2-digit' })
        onChange(timeStr)
        setInputValue(timeStr)
        setOpen(false)
    }

    // Handle keyboard navigation (basic)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleBlur()
            setOpen(false)
        }
        if (e.key === "ArrowDown") {
            setOpen(true)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="08:00"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        className={cn("pr-9", className)} // Make room for icon
                        maxLength={5}
                        disabled={disabled}
                        aria-label="Välj tid"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 pointer-events-none" />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[200px] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* Snabbval - Quick Select */}
                <div className="flex items-center gap-1 p-2 border-b">
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => handleQuickSelect("now")}>
                        Nu
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => handleQuickSelect("plus30")}>
                        +30 min
                    </Button>
                </div>

                {/* Scrollable Time List */}
                <div
                    className="max-h-[260px] overflow-y-auto overflow-x-hidden p-1 overscroll-contain touch-auto pointer-events-auto"
                    style={{ WebkitOverflowScrolling: "touch" }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div className="grid grid-cols-1 gap-1">
                        {timeSlots.map((time) => (
                            <Button
                                type="button"
                                key={time}
                                variant={value === time ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start font-normal h-8",
                                    value === time && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => handleSlotSelect(time)}
                            >
                                {time}
                            </Button>
                        ))}
                        {timeSlots.length === 0 && (
                            <div className="text-sm p-2 text-muted-foreground text-center">Inga tider tillgängliga</div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
