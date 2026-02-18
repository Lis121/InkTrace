'use client';

import React, { useRef, useEffect } from 'react';

interface Point {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
}

const AntigravityBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let points: Point[] = [];
        let animationFrameId: number;

        // Configuration
        const GRID_SPACING = 35; // Slightly denser
        const MOUSE_RADIUS = 250;
        const REPULSION_STRENGTH = 1200;
        const SPRING_STRENGTH = 0.03; // Viscous pull
        const FRICTION = 0.85; // High damping for liquid feel

        const handleResize = () => {
            // Set canvas size to fill the window/container
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initPoints();
        };

        const initPoints = () => {
            points = [];
            const cols = Math.floor(canvas.width / GRID_SPACING);
            const rows = Math.floor(canvas.height / GRID_SPACING);

            // Center the grid
            const offsetX = (canvas.width - cols * GRID_SPACING) / 2;
            const offsetY = (canvas.height - rows * GRID_SPACING) / 2;

            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    // Add organic randomness to positions
                    const randomOffsetX = (Math.random() - 0.5) * GRID_SPACING * 0.8;
                    const randomOffsetY = (Math.random() - 0.5) * GRID_SPACING * 0.8;

                    const x = offsetX + i * GRID_SPACING + randomOffsetX;
                    const y = offsetY + j * GRID_SPACING + randomOffsetY;

                    points.push({
                        x: x,
                        y: y,
                        originX: x,
                        originY: y,
                        vx: 0,
                        vy: 0,
                        size: Math.random() * 3.5 + 0.5, // Varied ink drop sizes
                        opacity: Math.random() * 0.5 + 0.2 // Varied opacity
                    });
                }
            }
        };

        const updatePhysics = () => {
            // Removed isMobile check to unify animation
            const time = Date.now() * 0.001; // Current time in seconds

            for (let i = 0; i < points.length; i++) {
                const p = points[i];

                // 1. Calculate repulsion from mouse
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                    // const repulsion = force * REPULSION_STRENGTH; // Unused 
                    const angle = Math.atan2(dy, dx);

                    p.vx += Math.cos(angle) * force * 2;
                    p.vy += Math.sin(angle) * force * 2;
                }

                // 2. Spring force (with ambient wave for all)
                // Wave parameters: amplitude 10px, frequency based on X position
                // Slower, more organic wave for ink
                const transformY = Math.sin(p.originX * 0.008 + time * 0.5) * 15;
                const targetY = p.originY + transformY;

                const springX = (p.originX - p.x) * SPRING_STRENGTH;
                const springY = (targetY - p.y) * SPRING_STRENGTH;

                p.vx += springX;
                p.vy += springY;

                // 3. Friction
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                // 4. Update position
                p.x += p.vx;
                p.y += p.vy;
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ink theme colors - distinct droplets
            const r = 148; // Slate-400 base
            const g = 163;
            const b = 184;

            for (let i = 0; i < points.length; i++) {
                const p = points[i];

                ctx.beginPath();
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            updatePhysics();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleTouchMove = (e: TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            if (e.touches.length > 0) {
                mouseRef.current = {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
        };

        const handleTouchEnd = () => {
            mouseRef.current = {
                x: -9999,
                y: -9999
            };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchstart', handleTouchMove); // Treat start like move
        window.addEventListener('touchend', handleTouchEnd);

        // Initial setup
        handleResize();
        loop();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: -10, background: '#ffffff' }}
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ mixBlendMode: 'multiply' }}
            />
        </div>
    );
};

export default AntigravityBackground;
