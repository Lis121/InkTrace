'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"
import InkFluidBackground from "@/components/ui/InkFluidBackground"
import InkRevealFeatures from "@/components/ui/InkRevealFeatures"
import InteractiveTimeline from "@/components/ui/InteractiveTimeline"
import InkWashTestimonials from "@/components/ui/InkWashTestimonials"
import InkCTA from "@/components/ui/InkCTA"
import MagneticFooter from "@/components/ui/MagneticFooter"
import Navbar from "@/components/ui/Navbar"
import { DragonProvider } from "@/components/ui/DragonContext"

export default function LandingPage() {
    return (
        <DragonProvider>
            <div className="relative isolate min-h-screen flex flex-col overflow-x-hidden bg-white" id="top">
                {/* Navigation */}
                <Navbar />

                {/* Interactive Background */}
                <InkFluidBackground />

                <section className="relative z-10 space-y-6 md:space-y-10 pb-20 pt-32 md:pb-32 md:pt-48 lg:py-64 pointer-events-none mix-blend-difference px-4">
                    <div className="container flex max-w-[64rem] flex-col items-center gap-6 md:gap-10 text-center">
                        <h1 className="font-heading text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl text-balance text-white leading-tight">
                            Från idé till bläck. <br className="md:hidden" /> Enkelt.
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-zinc-200 text-base sm:text-lg md:text-xl sm:leading-8">
                            Vi matchar din vision med Sveriges mest passionerade tatuerare. Berätta för oss vad du vill göra, så hjälper vi dig att hitta rätt artist och få ett prisförslag – helt kostnadsfritt.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pointer-events-auto w-full sm:w-auto">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-semibold bg-white text-black hover:bg-zinc-200 w-full sm:w-auto">
                                    Hitta min tatuerare
                                </Button>
                            </Link>
                            <Link href="#features" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-semibold border-white text-white hover:bg-white hover:text-black bg-transparent w-full sm:w-auto">
                                    Se hur det funkar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 1: Features (Ink Reveal) */}
                <section id="funktioner">
                    <InkRevealFeatures />
                </section>

                {/* Section 2: Timeline (Interactive Needle) */}
                <section id="flode">
                    <InteractiveTimeline />
                </section>

                {/* Section 3: Testimonials (Ink Wash) */}
                <section id="recensioner">
                    <InkWashTestimonials />
                </section>

                {/* Section 4: CTA */}
                <InkCTA />

                {/* Section 5: Magnetic Footer */}
                <section id="kontakt">
                    <MagneticFooter />
                </section>
            </div>
        </DragonProvider>
    )
}
