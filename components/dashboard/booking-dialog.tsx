"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { CalendarIcon, CalendarPlus, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { bookingSchema, type BookingInput } from "@/lib/validations/booking"
import { preBookCustomer } from "@/app/actions/booking"
import { TimePicker } from "@/components/dashboard/time-picker"

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"

// Generate time slots (08:00 - 20:00) every 30 mins
// const timeSlots = Array.from({ length: 25 }).map((_, i) => {
//     const hour = Math.floor(i / 2) + 8
//     const minute = i % 2 === 0 ? "00" : "30"
//     return `${hour.toString().padStart(2, "0")}:${minute}`
// })

export function BookingDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<BookingInput>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            fullName: "",
            bookingDate: new Date(),
            bookingTime: "08:00",
            personId: "",
            email: "",
            phone: "",
        },
    })

    const onSubmit = async (data: BookingInput) => {
        setIsSubmitting(true)
        try {
            const result = await preBookCustomer(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Kund bokad!")
                setOpen(false)
                form.reset({
                    fullName: "",
                    bookingDate: new Date(),
                    bookingTime: "08:00",
                    personId: "",
                    email: "",
                    phone: "",
                })
            }
        } catch {
            toast.error("Ett oväntat fel uppstod.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Boka Kund
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Förregistrera Kund</DialogTitle>
                    <DialogDescription>
                        Boka in en kund i förtid. Kunden kommer synas på dashboarden det valda datumet.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* ... Name field ... */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Namn</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Förnamn Efternamn" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bookingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Datum</FormLabel>
                                        <Popover>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        placeholder="ÅÅÅÅ-MM-DD"
                                                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                                        onChange={(e) => {
                                                            const date = new Date(e.target.value)
                                                            if (!isNaN(date.getTime())) {
                                                                field.onChange(date)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                                    >
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </div>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    classNames={{
                                                        day_hidden: "invisible",
                                                        row: "flex w-full mt-2",
                                                        head_row: "flex",
                                                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                                        cell: "h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: cn(
                                                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md"
                                                        ),
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bookingTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tid</FormLabel>
                                        <FormControl>
                                            <TimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                stepMinutes={30} // CONFIG: 15 eller 30
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* ... rest of the form ... */}
                        <FormField
                            control={form.control}
                            name="personId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personnummer (Valfritt)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ÅÅÅÅMMDD-XXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-post (Valfritt)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="namn@exempel.se" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefon (Valfritt)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="070..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Boka Kund
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
