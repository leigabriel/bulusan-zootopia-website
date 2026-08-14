'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { WIGGLE_CONFIG } from '@/lib/data';

function initWiggle(element, intensity) {
    const target = element.querySelector('[data-wiggle-target]') || element;
    gsap.set(target, { transformOrigin: 'center center' });
    let tween;
    const onEnter = () => {
        tween = gsap.to(target, { rotation: intensity, duration: 0.17, repeat: -1, yoyo: true, ease: 'steps(1)' });
    };
    const onLeave = () => {
        if (tween) { tween.kill(); gsap.to(target, { rotation: 0, duration: 0.3, ease: 'power2.out' }); }
    };
    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);
    return () => {
        element.removeEventListener('mouseenter', onEnter);
        element.removeEventListener('mouseleave', onLeave);
    };
}

export default function Navbar() {
    useEffect(() => {
        const navbar = document.querySelector('.navbar');
        const contentSection = document.querySelector('.content-section');
        const footerEl = document.querySelector('.main-footer');

        // Touch devices can't hover — popouts open on tap instead
        const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

        // ② Start white (on-dark) — video is dark background
        if (navbar) { navbar.classList.add('on-dark'); navbar.classList.remove('on-light'); }

        const updateNavbarColor = () => {
            if (!navbar || !contentSection || !footerEl) return;
            const scrollPos = window.scrollY + navbar.offsetHeight / 2;
            const contentTop = contentSection.getBoundingClientRect().top + window.scrollY;
            const footerTop = footerEl.getBoundingClientRect().top + window.scrollY;

            // Hero video is dark → light navbar text. Everything below it
            // (horizontal words, motion cards, footer) has a light background
            // → dark navbar text.
            if (scrollPos >= contentTop || scrollPos >= footerTop) {
                navbar.classList.add('on-light'); navbar.classList.remove('on-dark');
            } else {
                navbar.classList.add('on-dark'); navbar.classList.remove('on-light');
            }
        };

        window.addEventListener('scroll', updateNavbarColor);
        updateNavbarColor();

        // Wiggle on logo
        const cleanups = [];
        const logoBz = document.querySelector('.logo-bz');
        if (logoBz) cleanups.push(initWiggle(logoBz, WIGGLE_CONFIG.logoBz));

        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            gsap.set(overlay, { opacity: 0, visibility: 'hidden' });
        }
        const showOverlay = () => {
            if (overlay) {
                gsap.set(overlay, { visibility: 'visible' });
                gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.out' });
            }
        };
        const hideOverlay = () => {
            if (overlay) {
                gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => gsap.set(overlay, { visibility: 'hidden' }) });
            }
        };

        // ─── Navbar Left (Work) Hover ───
        const navLeft = document.querySelector('.nav-left');
        const workBox = document.querySelector('.nav-work-box');
        const workBlob = document.querySelector('.nav-bar__work-blob-svg');

        if (navLeft && workBox && workBlob) {
            const workInner = workBox.querySelector('.nav-popout-inner');
            const workItems = workInner ? Array.from(workInner.children) : [];

            // Temporarily show to measure both the box AND the blob icon center
            gsap.set(workBox, { visibility: 'visible', scale: 1, opacity: 1 });
            const boxRect = workBox.getBoundingClientRect();
            const blobRect = workBlob.getBoundingClientRect();
            // Icon center relative to the box's own top-left
            const originX = (blobRect.left + blobRect.width / 2) - boxRect.left;
            const originY = (blobRect.top + blobRect.height / 2) - boxRect.top;
            const workOrigin = `${originX}px ${originY}px`;

            // Start collapsed, scaling FROM the icon center
            gsap.set(workBox, {
                visibility: 'hidden',
                scale: 0,
                opacity: 0,
                transformOrigin: workOrigin
            });
            gsap.set(workItems, { y: 10, opacity: 0 });
            gsap.set(workBlob, { transformOrigin: 'center center' });

            const onEnterLeft = () => {
                gsap.killTweensOf(workBox);
                gsap.killTweensOf(workItems);
                gsap.killTweensOf(workBlob);
                showOverlay();
                if (isTouch) gsap.set(workBox, { pointerEvents: 'auto' });

                // Fast 360 blob spin — like it's spinning then releasing the box
                gsap.to(workBlob, { rotation: '+=360', duration: 0.7, ease: 'power3.inOut' });

                gsap.set(workBox, { visibility: 'visible' });
                // Box grows out smoothly from the icon center
                gsap.fromTo(workBox,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' }
                );
                // Items emerge while box is growing
                gsap.to(workItems, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out', delay: 0.18 });
            };

            const onLeaveLeft = () => {
                gsap.killTweensOf(workBox);
                gsap.killTweensOf(workItems);
                gsap.killTweensOf(workBlob);
                hideOverlay();
                if (isTouch) gsap.set(workBox, { pointerEvents: 'none' });

                gsap.to(workBlob, { rotation: 0, duration: 0.5, ease: 'power2.out' });

                // Items fade quickly
                gsap.to(workItems, { y: 10, opacity: 0, duration: 0.15, ease: 'power2.in' });
                // Box shrinks back into icon smoothly
                gsap.to(workBox, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'expo.in',
                    delay: 0.05,
                    onComplete: () => gsap.set(workBox, { visibility: 'hidden' })
                });
            };

            if (isTouch) {
                let leftOpen = false;
                const onLeftTap = (e) => {
                    e.stopPropagation();
                    if (e.target.closest('.nav-popout')) return;
                    if (leftOpen) { onLeaveLeft(); } else { onEnterLeft(); }
                    leftOpen = !leftOpen;
                };
                const onDocTap = (e) => {
                    if (leftOpen && !navLeft.contains(e.target)) {
                        onLeaveLeft();
                        leftOpen = false;
                    }
                };
                navLeft.addEventListener('click', onLeftTap);
                document.addEventListener('click', onDocTap);
                cleanups.push(() => {
                    navLeft.removeEventListener('click', onLeftTap);
                    document.removeEventListener('click', onDocTap);
                });
            } else {
                navLeft.addEventListener('mouseenter', onEnterLeft);
                navLeft.addEventListener('mouseleave', onLeaveLeft);
                cleanups.push(() => {
                    navLeft.removeEventListener('mouseenter', onEnterLeft);
                    navLeft.removeEventListener('mouseleave', onLeaveLeft);
                });
            }
        }

        // ─── Navbar Right (Download) Hover ───
        const navRight = document.querySelector('.nav-right');
        const waBox = document.querySelector('.nav-download-box');
        const waSvgPath = document.querySelector('.nav-bar__download-svg path');

        if (navRight && waBox) {
            const waInner = waBox.querySelector('.nav-popout-inner');
            const waItems = waInner ? Array.from(waInner.children) : [];
            const waIcon = document.querySelector('.nav-bar__download-svg');

            // Temporarily show to measure both the box AND the download icon center
            gsap.set(waBox, { visibility: 'visible', scale: 1, opacity: 1 });
            const waBoxRect = waBox.getBoundingClientRect();
            const waIconRect = waIcon ? waIcon.getBoundingClientRect() : waBoxRect;
            // Icon center relative to the box's own top-left
            const waOriginX = (waIconRect.left + waIconRect.width / 2) - waBoxRect.left;
            const waOriginY = (waIconRect.top + waIconRect.height / 2) - waBoxRect.top;
            const waOrigin = `${waOriginX}px ${waOriginY}px`;

            // Start collapsed, scaling FROM the download icon center
            gsap.set(waBox, {
                visibility: 'hidden',
                scale: 0,
                opacity: 0,
                transformOrigin: waOrigin
            });
            gsap.set(waItems, { y: 10, opacity: 0 });

            const onEnterRight = () => {
                gsap.killTweensOf(waBox);
                gsap.killTweensOf(waItems);
                showOverlay();
                if (isTouch) gsap.set(waBox, { pointerEvents: 'auto' });
                if (waSvgPath) gsap.to(waSvgPath, { fill: '#4b69f0', duration: 0.3 }); // Darker blue

                gsap.set(waBox, { visibility: 'visible' });
                // Box grows out smoothly from the download icon center
                gsap.fromTo(waBox,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' }
                );
                // Items emerge while box is growing
                gsap.to(waItems, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out', delay: 0.18 });
            };

            const onLeaveRight = () => {
                gsap.killTweensOf(waBox);
                gsap.killTweensOf(waItems);
                hideOverlay();
                if (isTouch) gsap.set(waBox, { pointerEvents: 'none' });
                if (waSvgPath) gsap.to(waSvgPath, { fill: 'currentColor', duration: 0.3 });

                // Items fade quickly
                gsap.to(waItems, { y: 10, opacity: 0, duration: 0.15, ease: 'power2.in' });
                // Box shrinks back into download icon smoothly
                gsap.to(waBox, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'expo.in',
                    delay: 0.05,
                    onComplete: () => gsap.set(waBox, { visibility: 'hidden' })
                });
            };

            if (isTouch) {
                let rightOpen = false;
                const onRightTap = (e) => {
                    e.stopPropagation();
                    if (e.target.closest('.nav-popout')) return;
                    if (rightOpen) { onLeaveRight(); } else { onEnterRight(); }
                    rightOpen = !rightOpen;
                };
                const onDocTap = (e) => {
                    if (rightOpen && !navRight.contains(e.target)) {
                        onLeaveRight();
                        rightOpen = false;
                    }
                };
                navRight.addEventListener('click', onRightTap);
                document.addEventListener('click', onDocTap);
                cleanups.push(() => {
                    navRight.removeEventListener('click', onRightTap);
                    document.removeEventListener('click', onDocTap);
                });
            } else {
                navRight.addEventListener('mouseenter', onEnterRight);
                navRight.addEventListener('mouseleave', onLeaveRight);
                cleanups.push(() => {
                    navRight.removeEventListener('mouseenter', onEnterRight);
                    navRight.removeEventListener('mouseleave', onLeaveRight);
                });
            }
        }

        // ─── Work Item: badge wiggle + image tilt on hover ───
        const workItems = document.querySelectorAll('.nav-work-item');
        workItems.forEach(item => {
            const badge = item.querySelector('.nav-work-badge');
            const img = item.querySelector('.nav-work-item__img');
            let wiggleTween;

            const onItemEnter = () => {
                // Wiggle badge intensity 2
                if (badge) {
                    gsap.set(badge, { transformOrigin: 'center center' });
                    wiggleTween = gsap.to(badge, { rotation: 5, duration: 0.15, repeat: -1, yoyo: true, ease: 'steps(1)' });
                }
                // Tilt image slightly right
                if (img) gsap.to(img, { rotation: 16, scale: 1.15, duration: 0.25, ease: 'power2.out' });
            };
            const onItemLeave = () => {
                if (wiggleTween) { wiggleTween.kill(); }
                if (badge) gsap.to(badge, { rotation: 0, duration: 0.3, ease: 'power2.out' });
                if (img) gsap.to(img, { rotation: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
            };
            item.addEventListener('mouseenter', onItemEnter);
            item.addEventListener('mouseleave', onItemLeave);
            cleanups.push(() => {
                item.removeEventListener('mouseenter', onItemEnter);
                item.removeEventListener('mouseleave', onItemLeave);
            });
        });

        // ─── All Our Work btn: wiggle intensity 4 (bubble handled by CursorBubble) ───
        const workBtn = document.querySelector('.nav-work-btn');
        if (workBtn) {
            let btnWiggle;
            const onBtnEnter = () => {
                const btnText = workBtn.querySelector('.nav-work-btn__text');
                if (btnText) {
                    gsap.set(btnText, { transformOrigin: 'center center', display: 'inline-block' });
                    btnWiggle = gsap.to(btnText, { rotation: 4, duration: 0.12, repeat: -1, yoyo: true, ease: 'steps(1)' });
                }
            };
            const onBtnLeave = () => {
                const btnText = workBtn.querySelector('.nav-work-btn__text');
                if (btnWiggle) { btnWiggle.kill(); }
                if (btnText) gsap.to(btnText, { rotation: 0, duration: 0.3, ease: 'power2.out' });
            };
            workBtn.addEventListener('mouseenter', onBtnEnter);
            workBtn.addEventListener('mouseleave', onBtnLeave);
            cleanups.push(() => {
                workBtn.removeEventListener('mouseenter', onBtnEnter);
                workBtn.removeEventListener('mouseleave', onBtnLeave);
            });
        }

        return () => {
            window.removeEventListener('scroll', updateNavbarColor);
            cleanups.forEach(fn => fn && fn());
        };
    }, []);

    return (
        <>
            <div className="nav-overlay"></div>
            <nav className="navbar">
                <div className="nav-left" style={{ cursor: "url('/assets/Cursor SVG/cursor-pointer.svg') 12 12, pointer" }}>
                    <div className="nav-hover-trigger">
                        <div className="logo-work-container">
                            <img src="/assets/Navbar SVG/nav-work-blob.svg" width="60" height="55" className="nav-bar__work-blob-svg" alt="" aria-hidden="true" />
                            <span className="logo-work-text">work</span>
                        </div>

                        {/* Pop-out Box for Left Side */}
                        <div className="nav-popout nav-work-box">
                            <div className="nav-popout-inner">
                                <div className="nav-work-item">
                                    <div className="nav-work-item__img-wrap">
                                        <img src="https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/68a46f25779a71fac3a11903_SnapInsta.jpg" loading="eager" alt="Feestje bouwe? App Douwe" className="nav-work-item__img" />
                                    </div>
                                    <div className="nav-work-item__text">
                                        <span className="nav-work-badge badge-maroon">douwe egberts</span>
                                        <h4 className="nav-work-title">feestje bouwe? app douwe</h4>
                                    </div>
                                </div>
                                <div className="nav-work-item">
                                    <div className="nav-work-item__img-wrap">
                                        <img src="https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/6880a344675f3a6144ed04df_01_HEMA_Back2School.avif" loading="eager" alt="Skibidi school" sizes="100vw" srcSet="https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/6880a344675f3a6144ed04df_01_HEMA_Back2School-p-500.avif 500w, https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/6880a344675f3a6144ed04df_01_HEMA_Back2School.avif 1080w" className="nav-work-item__img" />
                                    </div>
                                    <div className="nav-work-item__text">
                                        <span className="nav-work-badge badge-pink">hema</span>
                                        <h4 className="nav-work-title">skibidi school</h4>
                                    </div>
                                </div>
                                <div className="nav-work-item">
                                    <div className="nav-work-item__img-wrap">
                                        <img src="https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/686b7e0ed3ab3045b28a2012_3.avif" loading="eager" alt="Hema socials" sizes="100vw" srcSet="https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/686b7e0ed3ab3045b28a2012_3-p-500.avif 500w, https://cdn.prod.website-files.com/683863cbe1f5a81b667b9939/686b7e0ed3ab3045b28a2012_3.avif 1080w" className="nav-work-item__img" />
                                    </div>
                                    <div className="nav-work-item__text">
                                        <span className="nav-work-badge badge-pink">hema</span>
                                        <h4 className="nav-work-title">hema socials</h4>
                                    </div>
                                </div>
                                <a href="#" className="nav-work-btn"><span className="nav-work-btn__text">All our work</span></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="nav-center" style={{ cursor: "url('/assets/Cursor SVG/cursor-pointer.svg') 12 12, pointer" }}>
                    <svg className="logo-bz" width="150" viewBox="0 0 1600 619" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
    <g transform="matrix(1,0,0,1,-960.683427,-975.264902)">
        <g transform="matrix(0.861375,0,0,0.861375,652.040015,268.372295)">
            <text x="385.005px" y="1128.179px" style={{ fontFamily: "'SignaturePhilosophy', 'Signature Philosophy'", fontSize: '483.723px' }}>bulusan</text>
            <text x="477.356px" y="1437.762px" style={{ fontFamily: "'SignaturePhilosophy', 'Signature Philosophy'", fontSize: '483.723px' }}>zootopia</text>
        </g>
    </g>
</svg>
                </div>
                <div className="nav-right" style={{ cursor: "url('/assets/Cursor SVG/cursor-pointer.svg') 12 12, pointer" }}>
                    <div className="nav-hover-trigger">
                        <div className="logo-download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 17 17" fill="none" className="nav-bar__download-svg">
                                <path d="M6.096 1.85c-9.586 2.996-5.316 9.618-4.059 10.272 2.131 1.105-1.152 3.574-1.152 3.574s2.817-0.824 6.404-1.192c4.312-0.44 9.156-1.068 9.592-3.467 0.799-4.393-2.397-11.807-10.785-9.187zM10 5c0.552 0 1 0.447 1 1 0 0.551-0.448 1-1 1-0.553 0-1-0.449-1-1 0-0.553 0.447-1 1-1zM5 5.5c0.552 0 1 0.449 1 1s-0.448 1-1 1-1-0.449-1-1 0.448-1 1-1zM3.7 9.45c3.2 2.864 9.6-0.95 9.6-0.95-5.542 6.142-9.6 0.95-9.6 0.95z" fill="currentColor" />
                            </svg>
                        </div>

                        {/* Pop-out Box for Right Side */}
                        <div className="nav-popout nav-download-box">
                            <div className="nav-popout-inner">
                                <h4 className="nav-download-title">download the game</h4>
                                <p className="nav-download-desc">Get Bulusan Zootopia on your device and start exploring nature, feeding animals, and discovering the wild.</p>
                                <a href="#" className="nav-download-link">
                                    <span className="nav-download-link-text">Download now</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 169 10" fill="none" className="draw-btn__svg nav-download-link-svg">
                                        <path d="M1 6.5661C56.3941 3.06082 112.187 1.20095 168 0.999878" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                                        <path d="M32.1313 8.63371C68.2147 6.92799 104.462 6.13378 140.695 6.25107" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
