"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LoginScreen from '../features/LoginScreen';

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    
    const {
        setSearchQuery,
        handleSync,
        isSyncing,
    } = useAppContext();

    // Map pathname to active section for Sidebar highlighting
    const activeSection = pathname === '/' ? 'dashboard' : pathname.split('/')[1];

    const handleSectionChange = (section: string) => {
        if (section === 'dashboard') {
            router.push('/');
        } else {
            router.push(`/${section}`);
        }
        setShowMobileMenu(false);
    };

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>; // Or a spinner
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="app-container">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
            />

            <Navbar
                onSearch={setSearchQuery}
                onMenuChange={handleSectionChange}
                onMenuClick={() => setShowMobileMenu(!showMobileMenu)}
                showMobileMenu={showMobileMenu}
                onSync={handleSync}
                isSyncing={isSyncing}
            />

            <main className="main-content">
                {children}
            </main>

        </div>
    );
}
