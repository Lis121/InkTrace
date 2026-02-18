"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createTeamMember } from "@/app/actions/team"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    fullName: z.string().min(2, "Namn måste vara minst 2 tecken"),
    email: z.string().email("Ogiltig e-postadress"),
    password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
    role: z.enum(["artist", "apprentice", "owner"]),
})

type FormValues = z.infer<typeof formSchema>

export function AddMemberDialog() {
    const [open, setOpen] = useState(false)
    const [createdUser, setCreatedUser] = useState<{ email: string, password: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "artist",
        },
    })

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let retVal = ""
        for (let i = 0, n = charset.length; i < 12; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n))
        }
        form.setValue("password", retVal)
    }

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        const result = await createTeamMember(data)
        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Användare skapad!")
            setCreatedUser({ email: data.email, password: data.password })
            form.reset()
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Kopierat till urklipp")
    }

    if (createdUser) {
        return (
            <Dialog open={open} onOpenChange={(val) => {
                if (!val) setCreatedUser(null)
                setOpen(val)
            }}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Lägg till medlem
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Användare skapad!</DialogTitle>
                        <DialogDescription>
                            Ge dessa uppgifter till den anställda. De kan byta lösenord senare.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <div className="flex gap-2">
                                <Input value={createdUser.email} readOnly />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdUser.email)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lösenord</label>
                            <div className="flex gap-2">
                                <Input value={createdUser.password} readOnly />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdUser.password)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            setCreatedUser(null)
                            setOpen(false)
                        }}>Klart</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Lägg till medlem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Lägg till Teammedlem</DialogTitle>
                    <DialogDescription>
                        Skapa ett konto för en ny tatuerare eller lärling.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Roll</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Välj roll" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="artist">Artist</SelectItem>
                                            <SelectItem value="apprentice">Apprentice (Lärling)</SelectItem>
                                            <SelectItem value="owner">Owner (Ägare)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Lösenord</FormLabel>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="h-auto p-0 text-xs"
                                                onClick={generatePassword}
                                            >
                                                Generera
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <Input type="text" placeholder="Minst 6 tecken" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Skapa Användare
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
