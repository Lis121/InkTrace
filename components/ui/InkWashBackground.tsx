'use client';

import React, { useRef, useEffect } from 'react';

/* 
 * InkWashBackground.tsx
 * A variation of the fluid simulation for the "Ink Wash" section.
 * Features:
 * - Dark Mode (Dark Grey ink on Black background)
 * - Higher Viscosity / Sluggish movement
 * - No Dragon entity
 */

const InkWashBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Configuration for "Viscous Oil / Heavy Ink"
        const config = {
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 512,
            DENSITY_DISSIPATION: 0.99, // Fades very slowly
            VELOCITY_DISSIPATION: 0.98, // Flows for longer (less friction)
            PRESSURE: 0.6,
            PRESSURE_ITERATIONS: 20,
            CURL: 5, // Low curl = less swirling, more laminar/thick flow
            SPLAT_RADIUS: 0.5, // Larger splats for "heavy" feel
            INK_OPACITY: 0.8, // More opaque
            COLOR: [0.12, 0.12, 0.12] // #1f1f1f (Dark Grey)
        };

        const gl = canvas.getContext('webgl2', { alpha: true, depth: false, antialias: false });
        if (!gl) return;

        const ext = {
            colorFloat: gl.getExtension('EXT_color_buffer_float'),
            linearFloat: gl.getExtension('OES_texture_float_linear'),
        };

        if (!ext.colorFloat) return;

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
        uniform vec3 uColor;
        void main () {
            vec3 c = texture(uTexture, vUv).rgb;
            float density = max(c.r, max(c.g, c.b));
            
            // Output customized Ink Color
            // Background is transparent (so parent div color shows through)
            FragColor = vec4(uColor, density * uOpacity); 
        }
        `;

        // --- GL HELPERS ---
        // (Identical to InkFluidBackground, could detach to utility but inline for standalone reliability)

        const createProgram = (vert: string, frag: string) => {
            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, vert);
            gl.compileShader(vs);
            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs, frag);
            gl.compileShader(fs);
            const p = gl.createProgram()!;
            gl.attachShader(p, vs);
            gl.attachShader(p, fs);
            gl.linkProgram(p);
            return { program: p, uniforms: getUniforms(p) };
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
                fbo, texture: tex, width: w, height: h, attach: (id: number) => {
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
                width: w, height: h, texelSize: { x: 1.0 / w, y: 1.0 / h },
                get read() { return fbo1; }, set read(val) { fbo1 = val; },
                get write() { return fbo2; }, set write(val) { fbo2 = val; },
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

        let density = createDoubleFBO(config.DYE_RESOLUTION, config.DYE_RESOLUTION);
        let velocity = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let divergence = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let curl = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);
        let pressure = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION);

        // --- SIMULATION STEP ---

        const splat = (x: number, y: number, dx: number, dy: number, color: number[]) => {
            gl.viewport(0, 0, velocity.width, velocity.height);
            gl.useProgram(programs.splat.program);
            gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
            gl.uniform1f(programs.splat.uniforms.uAspectRatio, canvas.width / canvas.height);
            gl.uniform2f(programs.splat.uniforms.uPoint, x, y);
            gl.uniform3f(programs.splat.uniforms.uColor, dx, dy, 0.0);
            gl.uniform1f(programs.splat.uniforms.uRadius, config.SPLAT_RADIUS / 100.0);
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
            gl.uniform3f(programs.display.uniforms.uColor, config.COLOR[0], config.COLOR[1], config.COLOR[2]);
            blit(null);
        };

        let lastTime = Date.now();
        let animationFrame: number;
        let pointers: { id: number, x: number, y: number, dx: number, dy: number, down: boolean }[] = [];

        const getPointer = (e: MouseEvent | Touch) => {
            // Correct for canvas position (it might not be full screen)
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) / rect.width,
                y: 1.0 - ((e.clientY - rect.top) / rect.height)
            };
        };

        const onMouseMove = (e: MouseEvent) => {
            const p = getPointer(e);
            // Check if mouse is actually inside canvas rect to avoid firing when scrolling elsewhere
            const rect = canvas.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;

            const lastP = pointers[0] || p;
            const dx = p.x - lastP.x;
            const dy = p.y - lastP.y;

            if (dx !== 0 || dy !== 0) {
                // Slower splats for "heavy" oil feel
                splat(p.x, p.y, dx * 300 * (config.SIM_RESOLUTION / 128), dy * 300 * (config.SIM_RESOLUTION / 128), [0.5, 0.5, 0.5]);
            }
            pointers[0] = { ...p, id: -1, dx, dy, down: true };
        };

        const onTouchMove = (e: TouchEvent) => {
            // e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (t.clientX < rect.left || t.clientX > rect.right || t.clientY < rect.top || t.clientY > rect.bottom) continue;

                const p = getPointer(t);
                const dx = (Math.random() - 0.5) * 0.01;
                const dy = (Math.random() - 0.5) * 0.01;
                splat(p.x, p.y, dx * 3000, dy * 3000, [0.5, 0.5, 0.5]);
            }
        };

        // Listen on Window to capture broad moves, but filter inside
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });

        const loop = () => {
            animationFrame = requestAnimationFrame(loop);
            const now = Date.now();
            if (now - lastTime < 16) return;
            lastTime = now;
            update();
        };

        loop();

        const resize = () => {
            // Use parent dimensions
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
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
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

export default InkWashBackground;
