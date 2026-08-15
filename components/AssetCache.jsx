'use client';

import { useEffect } from 'react';

const CACHE_NAME = 'bulusan-assets-v1';
const CACHE_RECORD_KEY = 'bulusan-assets-cache';
const SIGNATURE_FONT_KEY = 'bulusan-font-signature';

const SIGNATURE_FONT = {
    family: 'Signature Philosophy',
    url: '/fonts/SignaturePhilosophy.ttf',
};

const ASSETS = [
    '/fonts/SignaturePhilosophy.ttf',
    '/fonts/Epilogue-VariableFont_wght.ttf',
    '/fonts/DMSans-VariableFont_opsz,wght.ttf',
    '/bz-url-logo.png',
    '/bulusan-mz.mp4',
    '/assets/wa_qr_code.png',
    '/assets/Navbar SVG/nav-work-blob.svg',
    '/assets/Navbar SVG/nav-download.svg',
    '/assets/Navbar SVG/logo-bz.svg',
    '/assets/VimeoHero SVG/smiley-face.svg',
    '/assets/VimeoHero SVG/pink-star.svg',
    '/assets/VimeoHero SVG/oval-underline.svg',
    '/assets/VimeoHero SVG/mute-bubble-blob.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-smiley.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-heart.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-hands.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-camera.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-boom.svg',
    '/assets/Footer-Sticker SVG/footer-sticker-100.svg',
    '/assets/Card-Sticker SVG/sticker-smiley.svg',
    '/assets/Card-Sticker SVG/sticker-phone.svg',
    '/assets/Card-Sticker SVG/sticker-heart.svg',
    '/assets/Card-Sticker SVG/sticker-hand.svg',
    '/assets/Card-Sticker SVG/sticker-camera.svg',
    '/assets/Brand Logos SVG/swapfiets_logo.svg',
    '/assets/Brand Logos SVG/oxxio_logo.svg',
    '/assets/Brand Logos SVG/netflix_logo.svg',
    '/assets/Brand Logos SVG/kfc_logo.svg',
    '/assets/Brand Logos SVG/hema_logo.svg',
    '/assets/Brand Logos SVG/getir_logo.svg',
    '/assets/Brand Logos SVG/anwb_logo.svg',
    '/assets/Brand Logos SVG/ace_tate_logo.svg',
    '/assets/MotionCard SVG/motion-card-underline.svg',
    '/assets/MotionCard SVG/motion-card-blob.svg',
    '/assets/Marquee-blob SVG/marquee-hand.svg',
    '/assets/Marquee-blob SVG/marquee-blob.svg',
    '/assets/HorizontalWords SVG/horizontal-words-sticker-cursor.svg',
    '/assets/HorizontalWords SVG/horizontal-words-arrow.svg',
    '/assets/HorizontalWords SVG/horizontal-words-arrow-end.svg',
    '/assets/HorizontalWords SVG/horizontal-words-sticker-phone.svg',
    '/assets/HorizontalWords SVG/horizontal-words-sticker-thumps-up.svg',
    '/assets/Cursor SVG/cursor-text.svg',
    '/assets/Cursor SVG/cursor-pointer.svg',
    '/assets/Cursor SVG/cursor-default.svg',
];

function injectFontFace(dataUri) {
    let style = document.getElementById('signature-font-face');
    if (!style) {
        style = document.createElement('style');
        style.id = 'signature-font-face';
        document.head.appendChild(style);
    }
    style.textContent = `@font-face{font-family:'${SIGNATURE_FONT.family}';src:url(${dataUri}) format('truetype');font-weight:400;font-style:normal;font-display:swap;}`;
}

async function cacheSignatureFont() {
    try {
        const stored = localStorage.getItem(SIGNATURE_FONT_KEY);
        if (stored) {
            injectFontFace(stored);
            return;
        }
        const res = await fetch(SIGNATURE_FONT.url);
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUri = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        localStorage.setItem(SIGNATURE_FONT_KEY, dataUri);
        injectFontFace(dataUri);
    } catch (e) { /* storage full or unavailable */ }
}

export default function AssetCache() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (typeof caches === 'undefined') return;
        let cancelled = false;

        const run = async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                const missing = [];
                for (const url of ASSETS) {
                    if (!(await cache.match(url))) missing.push(url);
                }
                if (cancelled || missing.length === 0) return;

                await Promise.allSettled(missing.map(url =>
                    fetch(url).then(res => {
                        if (res.ok) cache.put(url, res.clone());
                    }).catch(() => {})
                ));

                if (!cancelled) {
                    try {
                        localStorage.setItem(CACHE_RECORD_KEY, JSON.stringify({
                            cachedAt: Date.now(),
                            count: ASSETS.length,
                            urls: ASSETS,
                        }));
                    } catch (e) { /* storage full or unavailable */ }
                }
            } catch (e) { /* Cache API unavailable */ }
        };

        const id = window.setTimeout(() => {
            run().catch(() => {});
            cacheSignatureFont().catch(() => {});
        }, 1200);
        return () => { cancelled = true; window.clearTimeout(id); };
    }, []);

    return null;
}
