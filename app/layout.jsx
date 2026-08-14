import './globals.css';

export const metadata = {
    title: 'Bulusan Zootopia',
    description: 'Bulusan Zootopia is a nature exploration game where you can explore the wild, discover animals, and feed them treats.',
    icons: {
        icon: '/bz-url-logo.png',
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
