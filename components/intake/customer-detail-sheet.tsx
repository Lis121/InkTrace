import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import Image from "next/image"

interface Customer {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    pnr: string | null
    health_declaration: any
    signature_url: string | null
    created_at: string
}

interface CustomerDetailSheetProps {
    customer: Customer
    trigger?: React.ReactNode
}

export function CustomerDetailSheet({ customer, trigger }: CustomerDetailSheetProps) {
    const questions = customer.health_declaration || {}
    const formattedDate = format(new Date(customer.created_at), "d MMMM yyyy, HH:mm", { locale: sv })

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Visa Detaljer</Button>}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Hälsodeklaration</SheetTitle>
                    <SheetDescription>
                        Detaljer för {customer.full_name}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] pr-4">
                    <div className="space-y-6 py-6">
                        {/* Personal Info */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Personuppgifter</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium">Namn</p>
                                    <p>{customer.full_name}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Personnummer</p>
                                    <p>{customer.pnr || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p>{customer.email || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Telefon</p>
                                    <p>{customer.phone || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Registrerad</p>
                                    <p>{formattedDate}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Health Questions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Hälsofrågor</h3>
                            {Object.entries(questions).length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Ingen data registrerad.</p>
                            ) : (
                                <ul className="space-y-3 text-sm">
                                    {Object.entries(questions).map(([key, value]) => {
                                        // Skip technical fields or signature/disclaimer if stored in JSON
                                        if (key === "signature" || key === "termsAccepted") return null;

                                        // Format key to be more readable if possible, or assume it's the question text
                                        // For now, capitalize first letter
                                        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

                                        const isYes = String(value).toLowerCase() === "true" || String(value).toLowerCase() === "ja";

                                        return (
                                            <li key={key} className="flex justify-between border-b pb-2 last:border-0 border-dashed">
                                                <span className="text-muted-foreground">{label}</span>
                                                <span className={isYes ? "font-bold text-red-600" : "font-medium"}>
                                                    {String(value)}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        <Separator />

                        {/* Signature */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Signatur</h3>
                            {customer.signature_url ? (
                                <div className="border rounded-md p-4 bg-white">
                                    <Image
                                        src={customer.signature_url}
                                        alt="Kundsignatur"
                                        width={300}
                                        height={150}
                                        className="w-full max-h-[150px] object-contain"
                                        unoptimized // Signatures are data URLs usually, or external storage
                                    />
                                </div>
                            ) : (
                                <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/20">
                                    <span className="text-muted-foreground text-sm italic">Ingen signatur sparad</span>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
