import Navbar from "@/components/ui/Navbar"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}
