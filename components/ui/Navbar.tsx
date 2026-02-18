'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/ui/MobileMenu';

const navItems = [
    { label: 'Hem', href: '/#top' },
    { label: 'Funktioner', href: '/#funktioner' },
    { label: 'Processen', href: '/#flode' },
    { label: 'Recensioner', href: '/#recensioner' },
    { label: 'Kontakt', href: '/#kontakt' },
];

const Navbar = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/#top" className="flex items-center gap-2 text-xl font-bold text-black cursor-pointer">
                    <div className="relative h-8 w-8">
                        <Image
                            src="/inktrace_app_icon.png"
                            alt="InkTrace Logo"
                            fill
                            className="object-contain rounded-md"
                        />
                    </div>
                    InkTrace
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden lg:flex items-center gap-4">
                    <Button size="sm" className="bg-black text-white hover:bg-zinc-800 text-sm font-medium cursor-pointer">
                        Kom igång
                    </Button>
                </div>

                {/* Mobile Menu */}
                <MobileMenu />
            </div>
        </header>
    );
};

export default Navbar;
