"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

// Magnetic Link Component
const MagneticLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    const ref = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.1, y: y * 0.1 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            <Link
                href={href}
                ref={ref}
                className="block text-zinc-400 hover:text-white transition-colors duration-200 py-1"
            >
                {children}
            </Link>
        </motion.div>
    );
};

export default function MagneticFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="site-footer" className="relative w-full bg-black/80 backdrop-blur-md border-t border-white/10 overflow-hidden">
            {/* Ink Wash Divider Effect (Subtle top gradient) */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            <div className="container mx-auto px-6 py-10 md:py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">

                    {/* Brand / Intro */}
                    <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href="#top" className="block">
                            <h3 className="text-xl font-bold text-white tracking-tight">InkTrace</h3>
                        </Link>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                            Den kompletta plattformen för regelefterlevnad i din studio. Digitalisera din verksamhet idag.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <MagneticLink href="#"><Twitter size={20} /></MagneticLink>
                            <MagneticLink href="#"><Instagram size={20} /></MagneticLink>
                            <MagneticLink href="#"><Facebook size={20} /></MagneticLink>
                            <MagneticLink href="#"><Linkedin size={20} /></MagneticLink>
                        </div>
                    </div>

                    {/* Column 1: Produkt */}
                    <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Produkt</h4>
                        <nav className="space-y-2 text-sm flex flex-col items-center md:items-start">
                            <MagneticLink href="#funktioner">Funktioner</MagneticLink>
                            <MagneticLink href="#flode">Flöde</MagneticLink>
                            <MagneticLink href="#recensioner">Omdömen</MagneticLink>
                            <MagneticLink href="#">Priser</MagneticLink>
                        </nav>
                    </div>

                    {/* Column 2: Företag */}
                    <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Företag</h4>
                        <nav className="space-y-2 text-sm flex flex-col items-center md:items-start">
                            <MagneticLink href="#">Om oss</MagneticLink>
                            <MagneticLink href="#">Karriär</MagneticLink>
                            <MagneticLink href="#">Blogg</MagneticLink>
                            <MagneticLink href="#kontakt">Kontakt</MagneticLink>
                        </nav>
                    </div>

                    {/* Column 3: Juridik */}
                    <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Juridik</h4>
                        <nav className="space-y-2 text-sm flex flex-col items-center md:items-start">
                            <MagneticLink href="#">Användarvillkor</MagneticLink>
                            <MagneticLink href="#">Integritetspolicy</MagneticLink>
                            <MagneticLink href="#">Cookies</MagneticLink>
                            <MagneticLink href="#">Säkerhet</MagneticLink>
                        </nav>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                    <p>© {currentYear} InkTrace AB. Alla rättigheter förbehållna.</p>
                    <div className="flex gap-8">
                        <span>Byggt i Sverige 🇸🇪</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
