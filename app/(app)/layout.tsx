import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, FileText, ClipboardList, Box, ShieldCheck, MessageSquare, Users, UserCog } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let studioName = "Inktrace"

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("studio_id")
            .eq("id", user.id)
            .single()

        if (profile?.studio_id) {
            const { data: studio } = await supabase
                .from("studios")
                .select("name")
                .eq("id", profile.studio_id)
                .single()

            if (studio?.name) {
                studioName = studio.name
            }
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex sm:w-64">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <div className="relative h-6 w-6">
                            <Image
                                src="/inktrace_app_icon.png"
                                alt="InkTrace Logo"
                                fill
                                className="object-contain rounded-md"
                            />
                        </div>
                        <span>{studioName}</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-4 px-2 py-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Översikt
                    </Link>
                    <Link
                        href="/customers"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Users className="h-4 w-4" />
                        Kunder
                    </Link>
                    <Link
                        href="/team"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <UserCog className="h-4 w-4" />
                        Mitt Team
                    </Link>
                    <Link
                        href="/inventory"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Box className="h-4 w-4" />
                        Lager
                    </Link>
                    <Link
                        href="/reports"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <FileText className="h-4 w-4" />
                        Rapporter
                    </Link>
                    <Link
                        href="/intake"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <ClipboardList className="h-4 w-4" />
                        Intag
                    </Link>
                    <Link
                        href="/compliance"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Egenkontroll
                    </Link>
                    <Link
                        href="/feedback"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Feedback
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs">
                            <SheetTitle className="sr-only">Navigationsmeny</SheetTitle>
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Översikt
                                </Link>
                                <Link
                                    href="/customers"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="h-5 w-5" />
                                    Kunder
                                </Link>
                                <Link
                                    href="/team"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <UserCog className="h-5 w-5" />
                                    Mitt Team
                                </Link>
                                <Link
                                    href="/inventory"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Box className="h-5 w-5" />
                                    Lager
                                </Link>
                                <Link
                                    href="/reports"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <FileText className="h-5 w-5" />
                                    Rapporter
                                </Link>
                                <Link
                                    href="/intake"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <ClipboardList className="h-5 w-5" />
                                    Intag
                                </Link>
                                <Link
                                    href="/compliance"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <ShieldCheck className="h-5 w-5" />
                                    Egenkontroll
                                </Link>
                                <Link
                                    href="/feedback"
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Feedback
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                        <div className="ml-auto flex-1 sm:flex-initial">
                        </div>
                        <SignOutButton />
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
