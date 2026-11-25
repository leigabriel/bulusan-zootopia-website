import './globals.css';

export const metadata = {
    title: 'Bulusan Zootopia',
    description: 'Bulusan Zootopia is a nature exploration game where you can explore the wild, discover animals, and feed them treats.',
    icons: {
        icon: '/bz-url-logo.png',
    },
    openGraph: {
        title: 'Bulusan Zootopia',
        description: 'Play our game and explore the wild side, feed the animals.',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Bulusan Zootopia hero — play our game and explore the wild side, feed the animals',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bulusan Zootopia',
        description: 'Play our game and explore the wild side, feed the animals.',
        images: ['/og-image.jpg'],
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
