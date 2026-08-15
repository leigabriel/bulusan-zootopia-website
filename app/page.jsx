'use client';

import SvgSymbols from '@/components/SvgSymbols';
import Navbar from '@/components/Navbar';
import AssetCache from '@/components/AssetCache';
import VimeoHero from '@/components/VimeoHero';
import MotionCards from '@/components/MotionCards';
import Footer from '@/components/Footer';
import TransitionScribble from '@/components/TransitionScribble';
import CursorBubble from '@/components/CursorBubble';
import SmoothScroll from '@/components/SmoothScroll';

import HorizontalWords from '@/components/HorizontalWords';

export default function Home() {
    return (
        <>
            <SvgSymbols />
            <AssetCache />
            <SmoothScroll />
            <CursorBubble />
            <header className="main-header">
                <Navbar />
                <VimeoHero />
            </header>
            <HorizontalWords />
            <main>
                <div className="content-section motion-cards-wrapper">
                    <MotionCards />
                </div>
            </main>
            <footer className="main-footer">
                <Footer />
            </footer>
            <TransitionScribble />
        </>
    );
}
