"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sessionSchema, type SessionInput } from "@/lib/validations/session"
import { createSession } from "@/app/actions/sessions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Package2 } from "lucide-react"

type InventoryItem = {
    id: string
    brand: string | null
    type: string | null
    color_name: string | null
    batch_number: string | null
    name: string
}

interface SessionLogFormProps {
    customerId: string
    inventory: InventoryItem[]
}

export function SessionLogForm({ customerId, inventory }: SessionLogFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSupplies, setSelectedSupplies] = useState<string[]>([])

    const form = useForm<SessionInput>({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            customer_id: customerId,
            body_placement: "",
            used_supplies: [],
            notes: "",
            performed_at: new Date().toISOString(),
        },
    })

    // Group inventory by type
    const inks = inventory.filter(item => item.type === "ink")
    const needles = inventory.filter(item => item.type === "needle")

    const toggleSupply = (id: string) => {
        const newSelection = selectedSupplies.includes(id)
            ? selectedSupplies.filter(s => s !== id)
            : [...selectedSupplies, id]

        setSelectedSupplies(newSelection)
        form.setValue("used_supplies", newSelection)
    }

    const onSubmit = async (data: SessionInput) => {
        setIsSubmitting(true)
        try {
            await createSession({
                customerId: data.customer_id,
                itemIds: data.used_supplies,
                bodyPlacement: data.body_placement,
                notes: data.notes
            })
            // Redirect happens in server action
        } catch (error) {
            toast.error("Något gick fel")
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Session Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sessionsinformation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="body_placement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kroppsdel (valfritt)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="t.ex. Vänster arm, Rygg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Anteckningar (valfritt)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nåldjup, maskininställningar, etc..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Supply Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Använda förnödenheter *</CardTitle>
                        {selectedSupplies.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {selectedSupplies.length} vald{selectedSupplies.length > 1 ? "a" : ""}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Inks */}
                        {inks.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Bläck</h3>
                                <div className="grid gap-3">
                                    {inks.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSupply(item.id)}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent ${selectedSupplies.includes(item.id)
                                                ? "border-primary bg-accent"
                                                : "border-border"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={selectedSupplies.includes(item.id)}
                                                onCheckedChange={() => toggleSupply(item.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium">
                                                    {item.brand} - {item.color_name || "Bläck"}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-mono">
                                                    Batch: {item.batch_number || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Needles */}
                        {needles.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Nålar</h3>
                                <div className="grid gap-3">
                                    {needles.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSupply(item.id)}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent ${selectedSupplies.includes(item.id)
                                                ? "border-primary bg-accent"
                                                : "border-border"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={selectedSupplies.includes(item.id)}
                                                onCheckedChange={() => toggleSupply(item.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium">
                                                    {item.brand} - {item.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-mono">
                                                    Batch: {item.batch_number || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {inventory.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Inga förnödenheter i lagret. Lägg till bläck eller nålar först.
                                </p>
                            </div>
                        )}

                        <FormMessage>
                            {form.formState.errors.used_supplies?.message}
                        </FormMessage>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.history.back()}
                        disabled={isSubmitting}
                    >
                        Avbryt
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting || selectedSupplies.length === 0}
                    >
                        {isSubmitting ? "Sparar..." : "Spara session"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
