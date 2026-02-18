"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { feedbackSchema, type FeedbackInput } from "@/lib/validations/feedback"
import { submitFeedback } from "@/app/actions/feedback"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bug, Lightbulb, MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function FeedbackPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FeedbackInput>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            type: "bug",
            message: "",
            contactConsent: true,
        },
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form
    const currentType = watch("type")

    const onSubmit = async (data: FeedbackInput) => {
        setIsSubmitting(true)
        try {
            const result = await submitFeedback(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Tack! Vi läser allt.")
                reset()
            }
        } catch {
            toast.error("Ett oväntat fel uppstod.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Hjälp oss bli bättre</CardTitle>
                    <CardDescription>
                        Hittat en bugg eller har du en idé? Vi lyssnar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Typ av ärende</Label>
                            <RadioGroup
                                defaultValue="bug"
                                value={currentType}
                                onValueChange={(val) => setValue("type", val as any)}
                                className="grid grid-cols-3 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                                    <Label
                                        htmlFor="bug"
                                        className={cn(
                                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all",
                                            currentType === "bug" && "border-primary bg-primary/5 text-primary"
                                        )}
                                    >
                                        <Bug className="mb-2 h-6 w-6" />
                                        Bug
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="feature" id="feature" className="peer sr-only" />
                                    <Label
                                        htmlFor="feature"
                                        className={cn(
                                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all",
                                            currentType === "feature" && "border-primary bg-primary/5 text-primary"
                                        )}
                                    >
                                        <Lightbulb className="mb-2 h-6 w-6" />
                                        Möjlighet
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="other" id="other" className="peer sr-only" />
                                    <Label
                                        htmlFor="other"
                                        className={cn(
                                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all",
                                            currentType === "other" && "border-primary bg-primary/5 text-primary"
                                        )}
                                    >
                                        <MessageSquare className="mb-2 h-6 w-6" />
                                        Övrigt
                                    </Label>
                                </div>
                            </RadioGroup>
                            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-base font-semibold">Meddelande</Label>
                            <Textarea
                                id="message"
                                placeholder="Beskriv vad som hände eller vad du saknar..."
                                className="min-h-[150px] text-base resize-none"
                                {...register("message")}
                            />
                            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
                        </div>

                        {/* Contact Consent */}
                        <div className="flex items-start space-x-2 rounded-md border p-4 bg-muted/20">
                            <Checkbox
                                id="contactConsent"
                                checked={watch("contactConsent")}
                                onCheckedChange={(c) => setValue("contactConsent", c as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="contactConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Kontakta mig
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Det går bra att ni hör av er om ni behöver mer detaljer.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full text-lg h-12"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Skickar...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Skicka Feedback
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
