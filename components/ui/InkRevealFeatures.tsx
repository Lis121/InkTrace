'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "Beskriv din vision",
        description: "Berätta för oss vad du vill tatuera. Välj stil, storlek och placering så att vi kan göra en så träffsäker matchning som möjligt med rätt artist.",
        icon: FileText
    },
    {
        title: "Verifierade studios",
        description: "Vi samarbetar enbart med seriösa och professionella tatuerare. Du kan känna dig trygg med att både din hälsa och ditt framtida konstverk är i säkra händer.",
        icon: ShieldCheck
    },
    {
        title: "Snabba prisförslag",
        description: "Slipp vänta veckor på svar. Du får prisförslag och tillgängliga tider från intresserade artister inom kort, så att du kan planera din nästa sittning direkt.",
        icon: History
    }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
    return (
        <div className="relative group p-8 flex flex-col items-center text-center gap-4 rounded-2xl backdrop-blur-sm transition-colors duration-500 hover:bg-white/10">
            {/* SVG Border Drawing Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="16"
                        ry="16"
                        fill="transparent"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        variants={{
                            hidden: { pathLength: 0, opacity: 0 },
                            visible: {
                                pathLength: 1,
                                opacity: 1,
                                transition: {
                                    duration: 1.2,
                                    ease: "easeInOut",
                                    delay: index * 0.2
                                }
                            }
                        }}
                    />
                </motion.svg>
            </div>

            {/* Ink Bleed Shadow (Hover) - Removed or Inverted? Inverted Shadow is tricky. Let's keep it subtle or remove.
                If lighter, it might not show well in difference mode. Let's remove for clean contrast. */}
            {/* <div className="absolute inset-4 rounded-xl bg-black/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" /> */}

            {/* Icon "Drawing" */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative z-10 p-4 rounded-full"
            >
                <feature.icon size={48} strokeWidth={1.5} className="text-white" />
                {/* We could animate stroke-dasharray on the icon too if we render it as custom SVG, 
                    but lucide icons work well with simple fade or scale for now to keep it clean. 
                    Let's scale it up. */}
                <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full -z-10" // White bg for difference
                    variants={{
                        hidden: { scale: 0, opacity: 0 },
                        visible: {
                            scale: 1,
                            opacity: 1,
                            transition: {
                                delay: index * 0.2 + 0.5,
                                type: "spring",
                                stiffness: 200
                            }
                        }
                    }}
                />
            </motion.div>

            {/* Content Reveal */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2 + 0.8, duration: 0.5 }}
                className="z-10"
            >
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-neutral-200 leading-relaxed text-sm">
                    {feature.description}
                </p>
            </motion.div>
        </div>
    );
};

const InkRevealFeatures = () => {
    return (
        <section className="py-24 relative overflow-hidden mix-blend-difference text-white">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InkRevealFeatures;
