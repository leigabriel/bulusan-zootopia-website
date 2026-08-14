'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Dynamic Tab Title Change (all devices)
        const originalTitle = document.title;
        const handleVisibility = () => {
            document.title = document.hidden ? "Hey, over here!👋 - Truus" : originalTitle;
        };
        document.addEventListener('visibilitychange', handleVisibility);

        // Touch devices (phones/tablets): skip Lenis and use native scrolling.
        // Native scroll is smoother with GSAP pinned sections on iOS/Android,
        // avoids the touchMultiplier speed-up, and prevents rubber-band jank.
        const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
        if (isTouch) {
            return () => document.removeEventListener('visibilitychange', handleVisibility);
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);

        // Store lenis on window so other components can access it
        window.__lenis = lenis;

        return () => {
            lenis.destroy();
            document.removeEventListener('visibilitychange', handleVisibility);
            delete window.__lenis;
        };
    }, []);

    return null;
}
