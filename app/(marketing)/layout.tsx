import { Button } from "@/components/ui/button"
import { BottomBlurOverlay } from "@/components/ui/BottomBlurOverlay"


export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header removed - handled by Navbar.tsx in page.tsx */}
            <main className="flex-1">{children}</main>
            <BottomBlurOverlay />
        </div>
    )
}
