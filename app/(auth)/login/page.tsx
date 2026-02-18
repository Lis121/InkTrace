"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "../auth-actions"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginInput) {
        setIsPending(true)
        try {
            const result = await login(data)
            if (result?.error) {
                toast.error(result.error)
            } else {
                // Should redirect on server, but just in case
                toast.success("Inloggad")
            }
        } catch (error) {
            toast.error("Något gick fel")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex flex-1 w-full items-center justify-center px-4 py-10">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Logga in</CardTitle>
                    <CardDescription>
                        Ange din e-post för att logga in på ditt konto
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} />
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
                                        <div className="flex items-center">
                                            <FormLabel>Lösenord</FormLabel>
                                            <Link
                                                href="#"
                                                className="ml-auto inline-block text-sm underline"
                                            >
                                                Glömt lösenordet?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Loggar in..." : "Logga in"}
                            </Button>

                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Har du inget konto?{" "}
                        <Link href="/signup" className="underline">
                            Skapa konto
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
