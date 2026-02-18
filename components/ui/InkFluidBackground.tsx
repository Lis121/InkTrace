'use client';

import React, { useRef, useEffect } from 'react';
import { useDragon } from './DragonContext';

/* 
 * InkFluidBackground.tsx
 * A standalone WebGL fluid simulation for "Ink in Water" effect.
 * Adapted from Stable Fluids (Jos Stam) and various WebGL implementations.
 * No external heavy libraries used.
 */

const InkFluidBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { target, isAbsorbed, setIsAbsorbed } = useDragon();

    // Refs to bridge React state -> Animation Loop
    const targetRef = useRef<{ x: number, y: number } | null>(null);
    const isAbsorbedRef = useRef(false);
    const setIsAbsorbedRef = useRef(setIsAbsorbed);

    useEffect(() => {
        targetRef.current = target;
        isAbsorbedRef.current = isAbsorbed;
        setIsAbsorbedRef.current = setIsAbsorbed;
    }, [target, isAbsorbed, setIsAbsorbed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Configuration
        // Increasing resolution gives cleaner ink but costs performance.
        // Downscaling the simulation grid vs display resolution is key.

        // Responsive scaling based on screen width
        // Mutable state for dynamic resizing
        let dragonScale = 1.0;

        // Initial check for config
        const isMobile = window.innerWidth < 770;

        const updateScale = () => {
            const width = window.innerWidth;
            const mobile = width < 770; // User requested < 770
            const isTablet = width >= 770 && width < 1024;
            dragonScale = mobile ? 0.5 : isTablet ? 0.7 : 1.0;
        };
        updateScale();

        const config = {
            SIM_RESOLUTION: isMobile ? 64 : 128,  // Lower resolution on mobile
            DYE_RESOLUTION: isMobile ? 256 : 512,  // Lower resolution on mobile
            DENSITY_DISSIPATION: 0.98, // How fast ink fades (0.9 ~ 1.0)
            VELOCITY_DISSIPATION: 0.96, // Reduced from 0.99 to prevent energy buildup
            PRESSURE: 0.8, // Pressure solver iterations (0.8 is loose but fast)
            PRESSURE_ITERATIONS: isMobile ? 10 : 20, // Fewer iterations on mobile
            CURL: 20, // Reduced from 30 to reduce chaotic swirling
            SPLAT_RADIUS: 0.35, // Base radius, will multiply by dragonScale
            INK_OPACITY: 0.15, // Max alpha of ink
            // DRAGON_SCALE is now dynamic, removed from static config
        };

        // WebGL Context
        const gl = canvas.getContext('webgl2', { alpha: true, depth: false, antialias: false });
        if (!gl) return;

        // Extension check (mostly standard in WebGL2 but good to be safe)
        const ext = {
            colorFloat: gl.getExtension('EXT_color_buffer_float'), // Need float textures for physics
            linearFloat: gl.getExtension('OES_texture_float_linear'), // Need linear filtering for smooth smoke
        };

        if (!ext.colorFloat) {
            console.warn("WebGL2 Fluid: EXT_color_buffer_float not supported");
            return;
        }

        // --- SHADERS ---

        const baseVertexShader = `#version 300 es
        in vec2 aPosition;
        out vec2 vUv;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
        `;

        const copyShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uTexture;
        void main () {
            FragColor = texture(uTexture, vUv);
        }
        `;

        const splatShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uTarget;
        uniform float uAspectRatio;
        uniform vec3 uColor;
        uniform vec2 uPoint;
        uniform float uRadius;
        void main () {
            vec2 p = vUv - uPoint.xy;
            p.x *= uAspectRatio;
            vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
            vec3 base = texture(uTarget, vUv).xyz;
            FragColor = vec4(base + splat, 1.0);
        }
        `;

        const advectionShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 uTexelSize;
        uniform float uDt;
        uniform float uDissipation;
        void main () {
            vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
            vec4 result = texture(uSource, coord);
            float decay = 1.0 + uDissipation * uDt;
            FragColor = result * uDissipation;
        }
        `;

        const divergenceShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main () {
            float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
            float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
            float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
            float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
            
            float C = texture(uVelocity, vUv).x;
            if (vUv.x < 0.0) L = -C;
            if (vUv.x > 1.0) R = -C;
            if (vUv.y > 1.0) T = -C;
            if (vUv.y < 0.0) B = -C;

            float div = 0.5 * (R - L + T - B);
            FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
        `;

        const curlShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main () {
            float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
            float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
            float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
            float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
            float vorticity = R - L - T + B;
            FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
        `;

        const vorticityShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float uCurlScale;
        uniform float uDt;
        uniform vec2 uTexelSize;
        void main () {
            float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
            float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
            float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
            float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
            float C = texture(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= uCurlScale * C;
            force.y *= -1.0;
            
            vec2 vel = texture(uVelocity, vUv).xy;
            FragColor = vec4(vel + force * uDt, 0.0, 1.0);
        }
        `;

        const pressureShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        uniform vec2 uTexelSize;
        void main () {
            float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
            float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
            float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
            float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
            float C = texture(uPressure, vUv).x;
            float divergence = texture(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
        `;

        const gradientSubtractShader = `#version 300 es
        precision mediump float;
        precision mediump sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main () {
            float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
            float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
            float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
            float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
            vec2 velocity = texture(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            FragColor = vec4(velocity, 0.0, 1.0);
        }
        `;

        const displayShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;
        in vec2 vUv;
        out vec4 FragColor;
        uniform sampler2D uTexture;
        uniform float uOpacity;
        void main () {
            vec3 c = texture(uTexture, vUv).rgb;
            float a = max(c.r, max(c.g, c.b));
            // Output pure black ink with alpha based on density
            // Background is technically handled by CSS or container color (white)
            // But here we can simulate: White background - Black Ink
            // c is density (white on black internally).
            // We want Black Ink on Transparent background (to overlay on white div)
            FragColor = vec4(0.0, 0.0, 0.0, a * uOpacity); 
        }
        `;

        // --- GL HELPERS ---

        const createProgram = (vert: string, frag: string) => {
            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, vert);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(vs));

            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs, frag);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(fs));

            const p = gl.createProgram()!;
            gl.attachShader(p, vs);
            gl.attachShader(p, fs);
            gl.linkProgram(p);

            return {
                program: p,
                uniforms: getUniforms(p)
            };
        };

        const getUniforms = (p: WebGLProgram) => {
            const uniforms: any = {};
            const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < count; i++) {
                const name = gl.getActiveUniform(p, i)!.name;
                uniforms[name] = gl.getUniformLocation(p, name);
            }
            return uniforms;
        };

        const createTexture = (w: number, h: number) => {
            const t = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, t);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, null);
            return t;
        };

        const createFBO = (w: number, h: number) => {
            const tex = createTexture(w, h);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            return {
                fbo,
                texture: tex,
                width: w,
                height: h,
                attach: (id: number) => {
                    gl.activeTexture(gl.TEXTURE0 + id);
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    return id;
                }
            };
        };

        const createDoubleFBO = (w: number, h: number) => {
            let fbo1 = createFBO(w, h);
            let fbo2 = createFBO(w, h);
            return {
                width: w,
                height: h,
                texelSize: { x: 1.0 / w, y: 1.0 / h },
                get read() { return fbo1; },
                set read(val) { fbo1 = val; },
                get write() { return fbo2; },
                set write(val) { fbo2 = val; },
                swap: () => { const temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
            };
        };

        // --- SETUP ---

        const programs = {
            copy: createProgram(baseVertexShader, copyShader),
            splat: createProgram(baseVertexShader, splatShader),
            advection: createProgram(baseVertexShader, advectionShader),
            divergence: createProgram(baseVertexShader, divergenceShader),
            curl: createProgram(baseVertexShader, curlShader),
            vorticity: createProgram(baseVertexShader, vorticityShader),
            pressure: createProgram(baseVertexShader, pressureShader),
            gradientSubtract: createProgram(baseVertexShader, gradientSubtractShader),
            display: createProgram(baseVertexShader, displayShader),
        };

        // Quad for rendering
        const blit = (() => {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);
            return (dest: any) => {
                gl.bindFramebuffer(gl.FRAMEBUFFER, dest ? dest.fbo : null);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
        })();

        // State Init
        let density = createDoubleFBO(config.DYE_RESOLUTION, config.DYE_RESOLUTION);
        let velocity = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let divergence = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let curl = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let pressure = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);

        // --- SIMULATION STEP ---

        const splat = (x: number, y: number, dx: number, dy: number, color: number[], radiusScale: number = 1.0) => {
            gl.viewport(0, 0, velocity.width, velocity.height);
            gl.useProgram(programs.splat.program);
            gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
            gl.uniform1f(programs.splat.uniforms.uAspectRatio, canvas.width / canvas.height);
            gl.uniform2f(programs.splat.uniforms.uPoint, x, y);
            gl.uniform3f(programs.splat.uniforms.uColor, dx, dy, 0.0);
            gl.uniform1f(programs.splat.uniforms.uRadius, (config.SPLAT_RADIUS / 100.0) * radiusScale * dragonScale);
            blit(velocity.write);
            velocity.swap();

            gl.viewport(0, 0, density.width, density.height);
            gl.useProgram(programs.splat.program);
            gl.uniform1i(programs.splat.uniforms.uTarget, density.read.attach(0));
            gl.uniform3f(programs.splat.uniforms.uColor, color[0], color[1], color[2]);
            blit(density.write);
            density.swap();
        };

        const update = () => {
            // 1. Curl
            gl.viewport(0, 0, velocity.width, velocity.height);
            gl.useProgram(programs.curl.program);
            gl.uniform2f(programs.curl.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
            blit(curl);

            // 2. Vorticity
            gl.useProgram(programs.vorticity.program);
            gl.uniform2f(programs.vorticity.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
            gl.uniform1f(programs.vorticity.uniforms.uCurlScale, config.CURL);
            gl.uniform1f(programs.vorticity.uniforms.uDt, 0.016);
            blit(velocity.write);
            velocity.swap();

            // 3. Divergence
            gl.useProgram(programs.divergence.program);
            gl.uniform2f(programs.divergence.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
            blit(divergence);

            // 4. Clear Pressure
            gl.useProgram(programs.copy.program);
            gl.uniform1i(programs.copy.uniforms.uTexture, pressure.read.attach(0));
            blit(pressure.write);
            pressure.swap();

            // 5. Pressure Solver
            gl.useProgram(programs.pressure.program);
            gl.uniform2f(programs.pressure.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
            for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
                blit(pressure.write);
                pressure.swap();
            }

            // 6. Subtract Gradient
            gl.useProgram(programs.gradientSubtract.program);
            gl.uniform2f(programs.gradientSubtract.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
            gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
            blit(velocity.write);
            velocity.swap();

            // 7. Advection (Velocity)
            gl.useProgram(programs.advection.program);
            gl.uniform2f(programs.advection.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            if (!ext.linearFloat) gl.uniform2f(programs.advection.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach(0));
            gl.uniform1f(programs.advection.uniforms.uDt, 0.016);
            gl.uniform1f(programs.advection.uniforms.uDissipation, config.VELOCITY_DISSIPATION);
            blit(velocity.write);
            velocity.swap();

            // 8. Advection (Density)
            gl.viewport(0, 0, density.width, density.height);
            gl.useProgram(programs.advection.program);
            gl.uniform2f(programs.advection.uniforms.uTexelSize, velocity.texelSize.x, velocity.texelSize.y);
            gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(programs.advection.uniforms.uSource, density.read.attach(1));
            gl.uniform1f(programs.advection.uniforms.uDt, 0.016);
            gl.uniform1f(programs.advection.uniforms.uDissipation, config.DENSITY_DISSIPATION);
            blit(density.write);
            density.swap();

            // 9. Display
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(programs.display.program);
            gl.uniform1i(programs.display.uniforms.uTexture, density.read.attach(0));
            gl.uniform1f(programs.display.uniforms.uOpacity, config.INK_OPACITY);
            blit(null); // Draw to screen (null fbo)
        };

        let lastTime = Date.now();
        let animationFrame: number;

        // Inputs
        let pointers: { id: number, x: number, y: number, dx: number, dy: number, down: boolean }[] = [];

        // Mouse/Touch Events
        const getPointer = (e: MouseEvent | Touch) => {
            // Use window size since we're listening on window and canvas is full screen
            return {
                x: e.clientX / window.innerWidth,
                y: 1.0 - (e.clientY / window.innerHeight)
            };
        };

        const onMouseMove = (e: MouseEvent) => {
            const p = getPointer(e);
            const lastP = pointers[0] || p;

            const dx = p.x - lastP.x;
            const dy = p.y - lastP.y;

            if (dx !== 0 || dy !== 0) {
                splat(p.x, p.y, dx * 500 * (config.SIM_RESOLUTION / 128), dy * 500 * (config.SIM_RESOLUTION / 128), [0.8, 0.8, 0.8]);
            }

            pointers[0] = { ...p, id: -1, dx, dy, down: true };
        };

        const onTouchMove = (e: TouchEvent) => {
            // e.preventDefault(); // Don't block scroll on window
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                const p = getPointer(t);
                const dx = (Math.random() - 0.5) * 0.01;
                const dy = (Math.random() - 0.5) * 0.01;
                splat(p.x, p.y, dx * 5000, dy * 5000, [0.6, 0.6, 0.6]);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });

        // --- DRAGON IMPLEMENTATION (STRICT SPINE) ---

        const DRAGON_NODES = 50;
        // Init nodes in a straight line or coiled
        const dragonNodes = new Array(DRAGON_NODES).fill(0).map((_, i) => ({ x: 0.5, y: 0.5 + i * 0.005 }));

        // Head Physics State
        let headPos = { x: 0.5, y: 0.5 };
        let headVel = { x: 0.0, y: 0.0 };
        let headAngle = 0;

        const updateDragon = () => {
            // 1. Move Head (Steering Behavior)

            // Check for Magnetic Target (Black Hole)
            const magTarget = targetRef.current;

            if (magTarget && !isAbsorbedRef.current) {
                // --- Orbital Mode: Same movement as wandering, but orbit around button ---
                const speed = 0.003; // Same speed as normal wandering

                // Same random turn as normal
                const turn = (Math.random() - 0.5) * 0.2;
                headAngle += turn;

                // Steer towards orbit path around button (not towards button itself)
                const tx = magTarget.x;
                const ty = magTarget.y;
                const dx = tx - headPos.x;
                const dy = ty - headPos.y;
                const distToButton = Math.sqrt(dx * dx + dy * dy);

                // Target orbit radius (large enough to circle text + button)
                const orbitRadius = 0.18;

                if (distToButton > orbitRadius * 1.3) {
                    // Too far: steer towards button
                    const angleToButton = Math.atan2(dy, dx);
                    let angleDiff = angleToButton - headAngle;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    headAngle += angleDiff * 0.1;
                } else if (distToButton < orbitRadius * 0.7) {
                    // Too close: steer away from button
                    const angleAwayFromButton = Math.atan2(-dy, -dx);
                    let angleDiff = angleAwayFromButton - headAngle;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    headAngle += angleDiff * 0.1;
                } else {
                    // In orbit zone: add slight tangent bias to keep circling
                    const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2; // Perpendicular
                    let angleDiff = tangentAngle - headAngle;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    headAngle += angleDiff * 0.05; // Gentle nudge to keep circling
                }

                // Apply velocity (same as normal wandering)
                headVel.x = Math.cos(headAngle) * speed;
                headVel.y = Math.sin(headAngle) * speed;
                headPos.x += headVel.x;
                headPos.y += headVel.y;
            } else if (isAbsorbedRef.current && magTarget) {
                // --- Absorbed State (Being Sucked In) ---
                // All nodes rapidly lerp to center
                const tx = magTarget.x;
                const ty = magTarget.y;

                // Move head very fast to center
                headPos.x += (tx - headPos.x) * 0.2;
                headPos.y += (ty - headPos.y) * 0.2;
            } else {
                // --- Normal Wandering Mode ---
                const speed = 0.003;

                // Base random wandering
                const turn = (Math.random() - 0.5) * 0.2;
                headAngle += turn;

                // --- Center Seeking Steering (Boundary Avoidance) ---
                // Calculate vector to center (0.5, 0.5)
                const cx = 0.5 - headPos.x;
                const cy = 0.5 - headPos.y;
                const distToCenter = Math.sqrt(cx * cx + cy * cy);
                const angleToCenter = Math.atan2(cy, cx);

                // Calculate difference between current angle and angle to center
                // Normalize to -PI..PI
                let angleDiff = angleToCenter - headAngle;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

                // Turn towards center based on distance
                // If near center (0.0), influence is 0. If near edge (dist > 0.4), influence is strong
                const edgeThreshold = 0.3;
                if (distToCenter > edgeThreshold) {
                    const urgency = (distToCenter - edgeThreshold) * 0.2; // Ramps up as we go further out
                    headAngle += angleDiff * urgency;
                }

                // Update Velocity 
                headVel.x = Math.cos(headAngle) * speed;
                headVel.y = Math.sin(headAngle) * speed;

                // Apply Velocity
                headPos.x += headVel.x;
                headPos.y += headVel.y;

                // Hard Clamp Failsafe (prevent escaping universe)
                headPos.x = Math.max(0.01, Math.min(0.99, headPos.x));
                headPos.y = Math.max(0.01, Math.min(0.99, headPos.y));
            }

            // Update Head Node
            dragonNodes[0].x = headPos.x;
            dragonNodes[0].y = headPos.y;

            // 2. Resolve Spine (Strict Constraints)
            // Each node must be exactly 'dist' from the previous one
            const constraintDist = 0.012 * dragonScale; // Scale constraint distance

            for (let i = 1; i < DRAGON_NODES; i++) {
                const prev = dragonNodes[i - 1]; // The node pulling us
                const curr = dragonNodes[i];

                const dx = curr.x - prev.x;
                const dy = curr.y - prev.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // If dist is 0 (on top of each other), push out randomly to start chain
                if (dist === 0) {
                    curr.x += 0.001;
                    continue;
                }

                // Normalize vector (direction from prev to curr)
                const nx = dx / dist;
                const ny = dy / dist;

                // Place current node EXACTLY 'constraintDist' away from prev
                // This pulls 'curr' towards 'prev' to satisfy the rigid link
                if (isAbsorbedRef.current && magTarget) {
                    // Collapsing Mode: Reduce constraint distance to 0 essentially
                    // Or simply Lerp towards head/previous node heavily
                    curr.x += (prev.x - curr.x) * 0.2;
                    curr.y += (prev.y - curr.y) * 0.2;
                } else {
                    curr.x = prev.x + nx * constraintDist;
                    curr.y = prev.y + ny * constraintDist;
                }
            }

            // 3. Render Dragon to Fluid
            for (let i = 0; i < DRAGON_NODES; i++) {
                const n = dragonNodes[i];

                // Calculate mock velocity for the fluid interaction
                // (Roughly the direction of the spine at this point)
                let vx = 0, vy = 0;
                if (i > 0) {
                    vx = (dragonNodes[i - 1].x - n.x) * 50;
                    vy = (dragonNodes[i - 1].y - n.y) * 50;
                }

                // Tapering Size (Head=20px equiv, Tail=2px)
                // Map 0..1 to Radii
                const t = i / (DRAGON_NODES - 1);
                let radius = (0.5 * (1.0 - t) + 0.05) * dragonScale; // Scale radius

                // If absorbed, shrink everything
                if (isAbsorbedRef.current) {
                    radius *= 0.1; // Shrink to almost nothing
                }

                // Opacity (Head darker)
                let opacity = 0.15 * (1.0 - t * 0.5);
                if (isAbsorbedRef.current) opacity *= 0.1; // Fade out

                // Whiskers (Optional visual flair on head)
                if (i === 0 && !isAbsorbedRef.current) {
                    // Just add extra splatter around head for "mane"
                    splat(n.x + (Math.random() - 0.5) * 0.02, n.y + (Math.random() - 0.5) * 0.02, vx, vy, [0.1, 0.1, 0.1]);
                }

                splat(n.x, n.y, vx, vy, [opacity, opacity, opacity], radius);
            }
        };

        const loop = () => {
            animationFrame = requestAnimationFrame(loop);
            const now = Date.now();
            if (now - lastTime < 16) return;
            lastTime = now;

            updateDragon(); // Update dragon physics & visuals every frame
            update(); // Update fluid physics
        };

        loop();

        // Resize
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            updateScale(); // Update scale on resize
        };
        window.addEventListener('resize', resize);
        resize();

        return () => {
            cancelAnimationFrame(animationFrame);

            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{
                zIndex: -10,
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff'
            }}
        />
    );
};

export default InkFluidBackground;
