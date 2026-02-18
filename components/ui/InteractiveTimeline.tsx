'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';

const steps = [
    {
        title: "Beskriv din vision",
        description: "Fyll i vårt enkla formulär och berätta om din idé. Välj stil, storlek och önskad placering så att vi får en tydlig bild av vad du vill skapa."
    },
    {
        title: "Vi hittar rätt artister",
        description: "Vi skannar vårt nätverk av verifierade studios och matchar din förfrågan med de tatuerare som är experter på just din valda stil."
    },
    {
        title: "Jämför prisförslag",
        description: "Du får svar med prisförslag och förslag på lediga tider direkt i din inkorg. Titta igenom artisternas portföljer i lugn och ro och välj din favorit."
    },
    {
        title: "Säkra din sittning",
        description: "När du hittat rätt artist bokar du din tid enkelt genom oss. Sedan är det bara att dyka upp på studion och se din vision bli till verklighet."
    }
];

const InteractiveTimeline = () => {
    const [activeStep, setActiveStep] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", () => {
        const viewportCenter = window.innerHeight / 2;

        // Find the last step that is above the center of the viewport
        let lastActiveIndex = -1;

        stepRefs.current.forEach((step, index) => {
            if (step) {
                const rect = step.getBoundingClientRect();
                // If the top of the step is above or at the center line
                if (rect.top <= viewportCenter) {
                    lastActiveIndex = index;
                }
            }
        });

        if (lastActiveIndex !== activeStep) {
            setActiveStep(lastActiveIndex);
        }
    });

    return (
        <section ref={containerRef} className="py-24 md:py-32 relative select-none mix-blend-difference text-white">
            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <div className="flex flex-col items-start gap-4 mb-20 md:pl-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Processen</h2>
                    <p className="text-zinc-200 text-lg">Från första tanke till färdigt konstverk.</p>
                </div>

                <div className="relative md:pl-20">
                    {/* Vertical Line Background (Dark grey inverted -> turns Light grey on white) */}
                    <div className="absolute left-[19px] top-6 bottom-6 w-px bg-zinc-800" />

                    {/* Solid White Line (Inverted -> turns Black on white) */}
                    <motion.div
                        className="absolute left-[19px] top-6 w-px bg-white origin-top"
                        initial={{ height: 0 }}
                        animate={{
                            height: activeStep === -1
                                ? 0
                                : `${(activeStep / (steps.length - 1)) * 100}%`
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        style={{ maxHeight: 'calc(100% - 48px)' }}
                    />

                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                ref={el => { stepRefs.current[index] = el; }}
                                className="relative flex flex-row items-center gap-8 md:gap-12 group"
                            >
                                {/* Node Column (Fixed width to align line) */}
                                <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                    {/* Node Ring */}
                                    <motion.div
                                        className={cn(
                                            "w-4 h-4 rounded-full border-2 border-white z-10 transition-colors duration-500",
                                            index <= activeStep ? "bg-white" : "bg-black"
                                        )}
                                        animate={{
                                            scale: index <= activeStep ? 1.2 : 1
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    />

                                    {/* Ripple Effect on Activation */}
                                    {index <= activeStep && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            className="absolute w-4 h-4 border border-white rounded-full pointer-events-none"
                                        />
                                    )}
                                </div>

                                {/* Text Content Column */}
                                <motion.div
                                    animate={{
                                        opacity: index <= activeStep ? 1 : 0.4,
                                        x: index <= activeStep ? 0 : 0
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col"
                                >
                                    <h3 className="text-xl font-bold tracking-tight text-white">{step.title}</h3>
                                    <p className="text-zinc-200 font-medium leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveTimeline;
