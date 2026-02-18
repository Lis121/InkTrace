import { IntakeWizard } from "@/components/intake/intake-wizard"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{
        studioId: string
    }>
    searchParams: Promise<{
        customerId?: string
    }>
}

export default async function IntakePage({ params, searchParams }: PageProps) {
    const { studioId } = await params
    const { customerId } = await searchParams

    let initialData = null

    // If customerId is provided (e.g. from Dashboard "Signera" button), fetch their data
    if (customerId) {
        const supabase = await createClient()
        const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single()

        if (customer) {
            initialData = customer
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-primary selection:text-white">
            <div className="container mx-auto max-w-2xl text-center mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-2 text-slate-900">
                    Inktrace
                </h1>
                <p className="text-muted-foreground">
                    Digital Health Declaration
                </p>
            </div>

            <IntakeWizard studioId={studioId} initialData={initialData} />
        </div>
    )
}
