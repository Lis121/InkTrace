"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight, Check, Droplet, ArrowDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import confetti from "canvas-confetti"

const inventorySchema = z.object({
    brand: z.string().min(1, "Märke krävs"),
    color: z.string().min(1, "Färg krävs"),
    batch: z.string().min(1, "Batchnummer är obligatoriskt"),
    isOpened: z.boolean(),
    openedAt: z.string().optional(), // If using date picker later, for now just logic
})

type FormValues = z.infer<typeof inventorySchema>

interface Step2Props {
    onSubmit: (values: any) => Promise<void>
    onBack: () => void
    isSubmitting: boolean
}

export function OnboardingInventoryForm({ onSubmit, onBack, isSubmitting }: Step2Props) {
    const form = useForm<FormValues>({
        resolver: zodResolver(inventorySchema),
        defaultValues: {
            brand: "",
            color: "",
            batch: "",
            isOpened: true, // Default to yes as they are likely picking up a bottle they use
        },
    })

    const handleSubmit = async (values: FormValues) => {
        // Calculate openedAt
        let openedAt: string | null = null
        if (values.isOpened) {
            openedAt = new Date().toISOString()
        }

        // Trigger confetti before/during submit
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#000000', '#333333', '#666666'] // Ink theme
        })

        await onSubmit({ ...values, openedAt })
    }

    return (
        <Card className="w-full max-w-lg border-2 border-primary/10 shadow-lg">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto bg-primary/5 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2">
                    <Droplet className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Lägg till din första färg</CardTitle>
                <CardDescription className="text-base">
                    Hämta en flaska du använder ofta. Leta efter koden som heter <strong>'LOT'</strong> eller <strong>'Batch'</strong>.
                    <br />
                    <span className="text-xs text-muted-foreground mt-2 block">
                        Detta nummer kopplas automatiskt till kunden i framtiden.
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-lg border border-dashed text-center mb-6">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Lot / Batch Number</p>
                            <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground animate-bounce" />
                        </div>

                        <FormField
                            control={form.control}
                            name="batch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold">Batchnummer (LOT)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="T.ex. LOT-2024-BLCK"
                                            {...field}
                                            className="h-12 text-lg"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Märke</FormLabel>
                                        <FormControl>
                                            <Input placeholder="t.ex. Eternal Ink" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Färg</FormLabel>
                                        <FormControl>
                                            <Input placeholder="t.ex. Lining Black" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isOpened"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Öppnar du den nu?
                                        </FormLabel>
                                        <FormDescription>
                                            Om Ja, registreras öppningsdatum som idag.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
                                Tillbaka
                            </Button>
                            <Button type="submit" size="lg" disabled={isSubmitting} className="font-semibold bg-black text-white hover:bg-zinc-800">
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Klar - Ta mig till Studion!
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
