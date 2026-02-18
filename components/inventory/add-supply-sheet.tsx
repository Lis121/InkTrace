"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supplySchema, type SupplyInput } from "@/lib/validations/inventory"
import { addSupplyItem } from "@/app/actions/inventory"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface AddSupplySheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    studioId: string
    onSuccess: (item: any) => void
}

export function AddSupplySheet({ open, onOpenChange, studioId, onSuccess }: AddSupplySheetProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [lastBrand, setLastBrand] = useState("")

    const form = useForm<SupplyInput>({
        resolver: zodResolver(supplySchema),
        defaultValues: {
            type: "ink",
            brand: lastBrand,
            color_name: "",
            batch_number: "",
            expires_at: "",
            name: "",
        },
    })

    const watchType = form.watch("type")

    const onSubmit = async (data: SupplyInput) => {
        setIsSubmitting(true)
        try {
            const result = await addSupplyItem(studioId, data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Förnödenhet tillagd!")
                setLastBrand(data.brand) // Remember brand for next time
                form.reset({
                    type: data.type,
                    brand: data.brand, // Keep the same brand
                    color_name: "",
                    batch_number: "",
                    expires_at: "",
                    name: "",
                })
                // Optimistically add to list
                onSuccess({
                    id: crypto.randomUUID(),
                    ...data,
                    is_archived: false,
                    opened_at: null,
                    created_at: new Date().toISOString(),
                })
            }
        } catch {
            toast.error("Ett oväntat fel uppstod")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Lägg till förnödenhet</SheetTitle>
                    <SheetDescription>
                        Fyll i information om det nya bläcket eller nålen
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Typ</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="ink" id="ink" />
                                                <Label htmlFor="ink" className="cursor-pointer">Bläck</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="needle" id="needle" />
                                                <Label htmlFor="needle" className="cursor-pointer">Nål</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Märke</FormLabel>
                                    <FormControl>
                                        <Input placeholder="t.ex. Dynamic, Eternal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchType === "ink" && (
                            <FormField
                                control={form.control}
                                name="color_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Färg</FormLabel>
                                        <FormControl>
                                            <Input placeholder="t.ex. Triple Black, Crimson Red" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="batch_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch-nummer *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Batch #" className="font-mono" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expires_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Utgångsdatum *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Avbryt
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Sparar..." : "Lägg till"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
