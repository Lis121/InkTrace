"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signup } from "@/app/actions/signup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const signupSchema = z.object({
    studioName: z.string().min(2, "Studionamn måste vara minst 2 tecken"),
    email: z.string().email("Ogiltig e-postadress"),
    password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Lösenorden matchar inte",
    path: ["confirmPassword"],
})

type FormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            studioName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        try {
            const result = await signup(data)

            if (result.error) {
                toast.error(result.error)
            } else if (result.success && result.redirect) {
                toast.success("Konto skapat! Omdirigerar...")
                router.push(result.redirect)
            }
        } catch (error) {
            toast.error("Ett oväntat fel uppstod.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-1 w-full items-center justify-center bg-muted/40 p-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Registrera din Studio</CardTitle>
                    <CardDescription>
                        Prova Inktrace gratis i 30 dagar. Inget betalkort krävs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="studioName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Studio Namn</FormLabel>
                                        <FormControl>
                                            <Input placeholder="T.ex. Söder Tatuering AB" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-post</FormLabel>
                                        <FormControl>
                                            <Input placeholder="namn@studio.se" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lösenord</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Minst 6 tecken" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bekräfta Lösenord</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Upprepa lösenord" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Skapa Konto
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Redan kund?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Logga in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export const runtime = 'edge'
