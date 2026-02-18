"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createSession } from "@/app/actions/sessions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { Loader2, Save, AlertTriangle, Syringe, Palette, Box } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import Shadcn Form components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

// Schema
const formSchema = z.object({
    itemIds: z.array(z.string()).min(1, "Du måste välja minst ett material (färg/nål)."),
    bodyPlacement: z.string().optional(),
    notes: z.string().optional(),
    durationMinutes: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface InventoryItem {
    id: string
    brand: string
    name: string
    batch_number: string
    type: "ink" | "needle" | "other"
    expires_at: string | null
    opened_at: string | null
}

interface Customer {
    id: string
    full_name: string
}

interface SessionFormProps {
    customer: Customer
    inventory: InventoryItem[]
}

import { SessionTimer } from "./session-timer"

// ... (previous imports)

export function SessionForm({ customer, inventory }: SessionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemIds: [],
            bodyPlacement: "",
            notes: "",
            durationMinutes: 0,
        },
    })

    const { control, handleSubmit, watch, setValue } = form
    // Monitor items count for the sticky footer
    const selectedItemCount = watch("itemIds").length

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        try {
            const res = await createSession({
                customerId: customer.id,
                itemIds: data.itemIds,
                bodyPlacement: data.bodyPlacement,
                notes: data.notes,
                durationMinutes: data.durationMinutes
            })

            if (res?.error) {
                toast.error(res.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            toast.error("Ett fel uppstod. Försök igen.")
            setIsSubmitting(false)
        }
    }

    // Helper to render a group of items using the Shadcn Multi-Checkbox pattern
    const renderInventoryGroup = (items: InventoryItem[]) => {
        return (
            <FormField
                control={control}
                name="itemIds"
                render={() => (
                    <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0">
                        {items.map((item) => (
                            <FormField
                                key={item.id}
                                control={control}
                                name="itemIds"
                                render={({ field }) => {
                                    const isExpiringSoon = item.expires_at ? differenceInDays(new Date(item.expires_at), new Date()) < 30 : false
                                    const isSelected = field.value?.includes(item.id)

                                    return (
                                        <FormItem
                                            key={item.id}
                                            className={cn(
                                                "flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                                                isSelected ? "bg-primary/5 border-primary" : "bg-card hover:bg-slate-50"
                                            )}
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none w-full">
                                                <FormLabel className="font-semibold cursor-pointer text-base">
                                                    {item.brand} - {item.name}
                                                </FormLabel>
                                                {/* Batch Badge */}
                                                <div className="block pt-1">
                                                    <span className="text-xs text-muted-foreground font-mono bg-slate-100 px-1 py-0.5 rounded w-fit">
                                                        Batch: {item.batch_number}
                                                    </span>
                                                    {isExpiringSoon && (
                                                        <Badge variant="destructive" className="ml-2 h-6 text-xs whitespace-nowrap inline-flex">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            Går ut snart
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </FormItem>
                                    )
                                }}
                            />
                        ))}
                    </FormItem>
                )}
            />
        )
    }

    // Group inventory by type
    const inks = inventory.filter(i => i.type === "ink")
    const needles = inventory.filter(i => i.type === "needle")
    const others = inventory.filter(i => i.type === "other")

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
                {/* Header / Context */}
                <div className="flex flex-col gap-2 border-b pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Ny Session</h1>
                            <p className="text-lg text-muted-foreground">Logga material för <span className="font-semibold text-foreground">{customer.full_name}</span></p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>{format(new Date(), "d MMMM yyyy")}</p>
                        </div>
                    </div>
                </div>

                {/* Session Timer */}
                <SessionTimer onDurationChange={(minutes) => setValue("durationMinutes", minutes)} />

                {/* Step 1: Material Selection */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold border-b pb-2">
                        <Palette className="h-5 w-5" />
                        <h2>Välj Färger</h2>
                    </div>
                    {inks.length > 0 ? renderInventoryGroup(inks) : <p className="text-muted-foreground italic">Inga färger i lager.</p>}

                    <div className="flex items-center gap-2 text-xl font-semibold border-b pb-2 mt-8">
                        <Syringe className="h-5 w-5" />
                        <h2>Välj Nålar</h2>
                    </div>
                    {needles.length > 0 ? renderInventoryGroup(needles) : <p className="text-muted-foreground italic">Inga nålar i lager.</p>}

                    {others.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 text-xl font-semibold border-b pb-2 mt-8">
                                <Box className="h-5 w-5" />
                                <h2>Övrigt</h2>
                            </div>
                            {renderInventoryGroup(others)}
                        </>
                    )}

                    {/* Main helper text / error for items */}
                    <div className="text-center">
                        {form.formState.errors.itemIds && (
                            <p className="text-sm font-medium text-destructive">
                                {form.formState.errors.itemIds.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Step 2: Placement & Notes */}
                <Card className="mt-8 bg-slate-50/50">
                    <CardHeader>
                        <CardTitle>Placering & Noteringar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={control}
                            name="bodyPlacement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kroppsplacering (T.ex. Vänster underarm)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ange placering..."
                                            className="bg-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Egna noteringar (Ej synligt för kund)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Annat som är värt att logga..."
                                            className="bg-white min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Sticky Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-center z-50 sm:pl-64">
                    <div className="w-full max-w-4xl flex items-center justify-between gap-4">
                        <div className="hidden sm:block text-sm text-muted-foreground">
                            {selectedItemCount} artiklar valda
                        </div>
                        <Button
                            size="lg"
                            type="submit"
                            disabled={isSubmitting || selectedItemCount === 0}
                            className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-bold shadow-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sparar...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    SPARA SESSION
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
