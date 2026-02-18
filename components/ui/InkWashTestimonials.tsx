'use client';

import React from 'react';
import { motion } from 'framer-motion';
import InkWashBackground from './InkWashBackground';
import { cn } from '@/lib/utils';

const testimonials = [
    {
        quote: "Jag hade en specifik idé om en realism-tatuering men visste inte vem jag skulle gå till. Genom den här tjänsten blev jag matchad med en artist som specialiserade sig på exakt min stil. Resultatet blev bättre än jag någonsin kunnat drömma om!",
        author: "Sara Holm",
        role: "",
        initials: "SH"
    },
    {
        quote: "Det som vann mig var hur snabbt det gick. Jag skickade in min förfrågan på morgonen, fick tre prisförslag innan lunch och kunde boka min tid direkt. Inget mer väntande på svar via Instagram-DM som aldrig kommer.",
        author: "Johan Andersson",
        role: "",
        initials: "JA"
    },
    {
        quote: "Det bästa är tryggheten. Som nybörjare var jag nervös för att hitta en seriös studio, men att veta att alla studios här är verifierade och professionella gjorde att jag kände mig helt lugn. Nu har jag gjort tre tatueringar via sajten!",
        author: "Maria Lindberg",
        role: "",
        initials: "ML"
    }
];

const InkWashTestimonials = () => {
    return (
        <section className="relative w-full py-32 overflow-hidden text-white mix-blend-difference">
            {/* Dark Ink Background Removed to show Global Dragon */}
            {/* <div className="absolute inset-0 z-0 opacity-60">
                <InkWashBackground />
            </div> */}

            {/* Turbulence Filter SVG (Hidden) */}
            <svg style={{ display: 'none' }}>
                <defs>
                    <filter id="ink-turbulence">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.02"
                            numOctaves="3"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="10"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            <div className="container relative z-10 px-4 mx-auto">
                <div className="flex flex-col items-center gap-4 mb-20 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
                        Vad våra användare säger
                    </h2>
                    <p className="text-neutral-300 text-lg max-w-2xl">
                        Hundratals tatueringsälskare har hittat sin drömstudio genom oss.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="relative group p-8 rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden transition-colors duration-500 hover:bg-white/10"
                            style={{
                                // Add subtle turbulence on hover via CSS
                                // Note: Tailwind doesn't have native filter url() utility easily
                            }}
                        >
                            {/* SVG Filter Application via Custom Class or Style */}
                            <style jsx>{`
                                .group:hover .distort-target {
                                    filter: url(#ink-turbulence);
                                }
                            `}</style>

                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />

                            <div className="flex flex-col h-full justify-between gap-8 distort-target transition-all duration-700">
                                <div>
                                    <div className="text-4xl text-neutral-300 mb-4 font-serif">"</div>
                                    <p className="text-xl leading-relaxed text-white font-medium">
                                        {t.quote}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{t.author}</h4>
                                        <p className="text-sm text-neutral-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InkWashTestimonials;
