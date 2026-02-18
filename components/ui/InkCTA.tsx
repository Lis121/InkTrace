"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InkCTA() {
    return (
        <section className="relative w-full py-20 bg-transparent text-white mix-blend-difference overflow-hidden">
            <div className="container mx-auto px-4 z-10 relative">
                <div className="flex flex-col items-center justify-center text-center gap-8">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Redo att förverkliga din tatueringsdröm?
                    </h2>
                    <p className="text-xl text-neutral-400 max-w-2xl">
                        Beskriv din idé idag och låt oss matcha dig med de bästa studiosen i ditt område. Det tar bara två minuter, är helt kostnadsfritt och du binder dig inte till något.
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-white text-black hover:bg-neutral-200 cursor-pointer">
                            Få prisförslag nu
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
