"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intakeSchema, type IntakeInput } from "@/lib/validations/intake"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { submitIntake } from "@/app/actions/intake"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle2, ChevronLeft, ChevronRight, Eraser, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntakeWizardProps {
    studioId: string
    initialData?: any // DB Customer type
}

export function IntakeWizard({ studioId, initialData }: IntakeWizardProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const sigCanvas = useRef<SignatureCanvas>(null)

    const form = useForm({
        resolver: zodResolver(intakeSchema),
        mode: "onBlur", // Validate on blur for better UX step gating
        defaultValues: {
            fullName: initialData?.full_name || "",
            personId: initialData?.person_id || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            health: {
                bloodBorne: false,
                pregnant: false,
                diabetes: false,
                influence: false,
                allergies: false,
                allergiesDetail: "",
            },
            signature: "",
        },
    })

    // Watch fields to determine if we can proceed
    const { watch, trigger, setValue, handleSubmit, formState: { errors } } = form
    const healthValues = watch("health")

    // Step Navigation Logic
    const nextStep = async () => {
        let isValid = false
        if (step === 1) {
            isValid = await trigger(["fullName", "personId", "email", "phone"])
        } else if (step === 2) {
            isValid = await trigger("health")
        }

        if (isValid) setStep((s) => s + 1)
    }

    const prevStep = () => setStep((s) => s - 1)

    // Signature Handling
    const clearSignature = () => {
        sigCanvas.current?.clear()
        setValue("signature", "")
    }

    const saveSignature = () => {
        if (sigCanvas.current?.isEmpty()) {
            setValue("signature", "")
            return
        }
        // Get Base64
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png")
        if (dataUrl) setValue("signature", dataUrl)
    }

    // Final Submission
    const onSubmit = async (data: IntakeInput) => {
        // Ensure signature logic captured current state if user didn't specificially trigger save (though we bind it)
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            data.signature = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        }

        if (!data.signature) {
            toast.error("Signatur krävs.")
            return
        }

        setIsSubmitting(true)
        try {
            const supabase = createClient()

            // If we have initialData with an ID, we update that record instead of creating a new one
            if (initialData?.id) {
                const { error } = await supabase
                    .from("customers")
                    .update({
                        full_name: data.fullName,
                        person_id: data.personId,
                        email: data.email,
                        phone: data.phone,
                        health_declaration: {
                            bloodBorne: data.health.bloodBorne,
                            pregnant: data.health.pregnant,
                            diabetes: data.health.diabetes,
                            influence: data.health.influence,
                            allergies: data.health.allergies,
                            allergiesDetail: data.health.allergiesDetail,
                        },
                        signature_url: data.signature,
                    })
                    .eq("id", initialData.id)

                if (error) throw error
            } else {
                // Original Logic: Create New
                const result = await submitIntake(studioId, data)
                if (result.error) throw new Error(result.error)
            }

            setIsSuccess(true)
            toast.success("Hälsodeklaration sparad!")
        } catch (error) {
            console.error(error)
            toast.error("Ett fel uppstod. Försök igen.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset for next customer
    const handleReset = () => {
        form.reset()
        setStep(1)
        setIsSuccess(false)
        sigCanvas.current?.clear()
    }

    const formatPersonnummer = (value: string) => {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, "")

        // Limit to 12 digits
        const truncated = cleaned.slice(0, 12)

        // If 8 digits or less, return as is
        if (truncated.length <= 8) return truncated

        // If more than 8, insert hyphen
        return `${truncated.slice(0, 8)}-${truncated.slice(8)}`
    }

    if (isSuccess) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <CheckCircle2 className="mx-auto mb-6 h-24 w-24 text-green-500 animate-in zoom-in duration-300" />
                <h2 className="mb-2 text-3xl font-bold tracking-tight">Klart!</h2>
                <p className="mb-8 text-muted-foreground text-lg">
                    Lämna tillbaka enheten till din tatuerare.
                </p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Button size="lg" onClick={handleReset} className="font-semibold w-full">
                        Ny kund
                    </Button>
                    <Button variant="outline" size="lg" asChild className="w-full">
                        <a href="/dashboard">
                            Tillbaka till panelen
                        </a>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto relative">
            {/* Close Button for Artist */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -top-16 right-0 text-muted-foreground hover:text-foreground md:-top-10 md:-right-28"
                asChild
            >
                <a href="/dashboard" aria-label="Avbryt och gå till panelen">
                    <X className="h-6 w-6" />
                </a>
            </Button>

            {/* Progress Indicator */}
            <div className="mb-8 flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span className={cn(step >= 1 && "text-primary font-bold")}>1. Uppgifter</span>
                <div className="h-px flex-1 bg-border mx-4" />
                <span className={cn(step >= 2 && "text-primary font-bold")}>2. Hälsa</span>
                <div className="h-px flex-1 bg-border mx-4" />
                <span className={cn(step >= 3 && "text-primary font-bold")}>3. Signera</span>
            </div>

            <Card className="border-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {step === 1 && "Personuppgifter"}
                        {step === 2 && "Hälsodeklaration"}
                        {step === 3 && "Juridisk ansvarsfriskrivning"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form id="intake-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* STEP 1: Personal Details */}
                        {step === 1 && (
                            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName" className="text-lg">Namn</Label>
                                    <Input
                                        id="fullName"
                                        className="h-14 text-lg"
                                        placeholder="Förnamn Efternamn"
                                        {...form.register("fullName")}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="personId" className="text-lg">Personnummer (ÅÅÅÅMMDD-XXXX)</Label>
                                    <Input
                                        id="personId"
                                        className="h-14 text-lg"
                                        placeholder="19900101-1234"
                                        {...form.register("personId", {
                                            onChange: (e) => {
                                                const formatted = formatPersonnummer(e.target.value)
                                                setValue("personId", formatted)
                                            }
                                        })}
                                    />
                                    {errors.personId && <p className="text-red-500 text-sm">{errors.personId.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-lg">E-post (Valfritt)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-14 text-lg"
                                        placeholder="namn@example.com"
                                        {...form.register("email")}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-lg">Telefon (Valfritt)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="h-14 text-lg" // Shadcn Inputs are usually h-10, h-14 is custom for "touch"
                                        placeholder="070 123 45 67"
                                        {...form.register("phone")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Health Declaration */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {[
                                    { id: "bloodBorne", label: "Har du någon blodburensjukdom (HIV, Hepatit)?" },
                                    { id: "pregnant", label: "Är du gravid eller ammar?" },
                                    { id: "diabetes", label: "Har du diabetes?" },
                                    { id: "influence", label: "Är du påverkad av alkohol eller droger?" },
                                ].map((item) => (
                                    <div key={item.id} className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <Label htmlFor={item.id} className="text-lg font-medium cursor-pointer flex-1 mr-4">
                                            {item.label}
                                        </Label>
                                        <Switch
                                            id={item.id}
                                            checked={(healthValues as any)[item.id]}
                                            onCheckedChange={(checked) => setValue(`health.${item.id}` as any, checked)}
                                            className="scale-125"
                                        />
                                    </div>
                                ))}

                                {/* Allergies Special Case */}
                                <div className="rounded-lg border p-4 shadow-sm space-y-4">
                                    <div className="flex flex-row items-center justify-between">
                                        <Label htmlFor="allergies" className="text-lg font-medium cursor-pointer flex-1 mr-4">
                                            Har du några kända allergier (Latex, pigment, etc.)?
                                        </Label>
                                        <Switch
                                            id="allergies"
                                            checked={healthValues.allergies}
                                            onCheckedChange={(checked) => setValue("health.allergies", checked)}
                                            className="scale-125"
                                        />
                                    </div>
                                    {healthValues.allergies && (
                                        <div className="animate-in slide-in-from-top-2 fade-in">
                                            <Input
                                                placeholder="Vänligen specificera t.ex. Rött bläck, Latex..."
                                                className="h-12 text-lg"
                                                {...form.register("health.allergiesDetail")}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Signature */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-slate-50 p-6 rounded-lg border text-sm text-slate-700 leading-relaxed">
                                    <strong>Juridisk friskrivning:</strong> Jag intygar att informationen jag lämnat är korrekt.
                                    Jag förstår att tatuering innebär hudpenetr ation och medför risker för infektion eller allergisk reaktion.
                                    Jag samtycker till att följa eftervårdsinstruktionerna från tatueraren.
                                </div>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden h-64 w-full touch-none">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{ className: "w-full h-full block" }}
                                        onEnd={saveSignature}
                                        backgroundColor="rgba(248, 250, 252, 1)" // slate-50
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={clearSignature}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                    >
                                        <Eraser className="w-5 h-5 mr-1" />
                                        Rensa
                                    </Button>
                                </div>
                                {form.getFieldState("signature").invalid && (
                                    <p className="text-red-500 text-center font-medium">Vänligen signera ovan för att fortsätta.</p>
                                )}
                            </div>
                        )}
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between p-6">
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={prevStep}
                            className="text-lg px-8"
                        >
                            <ChevronLeft className="mr-2 h-5 w-5" />
                            Tillbaka
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <Button
                            type="button"
                            size="lg"
                            onClick={nextStep}
                            className="text-lg px-8"
                        >
                            Nästa
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            size="lg"
                            disabled={isSubmitting}
                            className="text-lg px-8 min-w-[140px]"
                        >
                            {isSubmitting ? "Skickar..." : "Skicka in"}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Help / Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Inktrace Studio Compliance &copy; {new Date().getFullYear()}</p>
            </div>
        </div>
    )
}
