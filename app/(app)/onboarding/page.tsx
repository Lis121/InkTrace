"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { completeOnboarding } from "@/app/actions/onboarding"
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
import { Loader2, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { OnboardingInventoryForm } from "@/components/onboarding/onboarding-inventory-form"
import { useRouter } from "next/navigation"

const step1Schema = z.object({
    orgNumber: z.string().min(1, "Organisationsnummer krävs"),
    city: z.string().min(1, "Ort krävs"),
})

const step2Schema = z.object({
    brand: z.string().min(1, "Märke krävs"),
    color: z.string().min(1, "Färg krävs"),
    batch: z.string().min(1, "Batchnummer krävs"),
})

const fullSchema = step1Schema.merge(step2Schema)
type FormValues = z.infer<typeof fullSchema>

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form for Step 1 Only
    const form = useForm<z.infer<typeof step1Schema>>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            orgNumber: "",
            city: "",
        },
    })

    const handleNext = async () => {
        const isValid = await form.trigger(["orgNumber", "city"])
        if (isValid) {
            setStep(2)
        }
    }

    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <OnboardingInventoryForm
                    onSubmit={async (values) => {
                        try {
                            setIsSubmitting(true)
                            // Merge Step 1 (form state) and Step 2 (values)
                            const fullData = {
                                ...form.getValues(),
                                ...values,
                            }
                            const result = await completeOnboarding(fullData)

                            if (result.error) {
                                toast.error(result.error)
                                setIsSubmitting(false)
                            } else {
                                toast.success("Snyggt! Din första flaska är registrerad.")
                                // Force a hard navigation to ensure middleware and server state are perfectly synced
                                // and to avoid client-side router getting stuck if revalidation takes time.
                                window.location.href = "/inventory"
                            }
                        } catch (error) {
                            console.error("Submission failed", error)
                            toast.error("Ett oväntat fel uppstod.")
                            setIsSubmitting(false)
                        }
                    }}
                    onBack={() => setStep(1)}
                    isSubmitting={isSubmitting}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Välkommen till Inktrace!
                    </CardTitle>
                    <CardDescription>
                        Låt oss ställa in grunderna för din studio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="orgNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organisationsnummer</FormLabel>
                                            <FormControl>
                                                <Input placeholder="556677-8899" {...field} />
                                            </FormControl>
                                            <FormDescription>Krävs för PDF-rapporter.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stad / Ort</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Stockholm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleNext} disabled={isSubmitting} className="ml-auto w-full">
                        Nästa <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
