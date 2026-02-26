import '../index.scss';
import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import MainLayoutClient from '../components/MainLayoutClient';

export const metadata: Metadata = {
    title: 'AnyDo',
    description: 'Your ultimate productivity workspace',
    icons: {
        icon: '/favicon.svg',
    },
};

import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml" />
                <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
            </head>
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <AppProvider>
                            <MainLayoutClient>
                                {children}
                            </MainLayoutClient>
                        </AppProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
