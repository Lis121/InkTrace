'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import Link from 'next/link';

const navItems = [
    { label: 'Hem', href: '/#top' },
    { label: 'Funktioner', href: '/#funktioner' },
    { label: 'Processen', href: '/#flode' },
    { label: 'Recensioner', href: '/#recensioner' },
    { label: 'Kontakt', href: '/#kontakt' },
];

const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 text-black hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Öppna meny"
            >
                <Menu size={24} strokeWidth={2} />
            </button>

            {/* Fullscreen Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col"
                    >
                        {/* Close Button */}
                        <div className="flex justify-end p-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-black hover:bg-black/5 rounded-lg transition-colors"
                                aria-label="Stäng meny"
                            >
                                <X size={28} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 flex flex-col items-center justify-center gap-8">
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-3xl font-bold text-black hover:text-zinc-600 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="mt-8"
                            >
                                <Link
                                    href="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-full hover:bg-zinc-800 transition-colors"
                                >
                                    Kom igång
                                </Link>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileMenu;
