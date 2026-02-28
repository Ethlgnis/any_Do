"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';

const BACKEND_URL = 'http://localhost:4000';

interface AuthUser {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    driveAccessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginWithGoogle: () => void;
    logout: () => void;
    handleAuthError: (error: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On app start: check URL for OAuth callback tokens, then fall back to localStorage
    useEffect(() => {
        const bootstrapAuth = async () => {
            // Check if we're returning from Google OAuth
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const driveToken = params.get('driveToken');
            const userParam = params.get('user');

            if (token && userParam) {
                try {
                    const parsedUser: AuthUser = JSON.parse(userParam);
                    setUser(parsedUser);
                    setAccessToken(token);
                    setDriveAccessToken(driveToken ?? null);

                    localStorage.setItem('anydo_token', token);
                    localStorage.setItem('anydo_drive_token', driveToken ?? '');
                    localStorage.setItem('anydo_user', JSON.stringify(parsedUser));

                    // Clean the URL so tokens don't stay visible
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch {
                    // ignore parse errors
                }
                setIsLoading(false);
                return;
            }

            // Restore from localStorage
            const savedUser = localStorage.getItem('anydo_user');
            const savedToken = localStorage.getItem('anydo_token');
            const savedDriveToken = localStorage.getItem('anydo_drive_token');

            if (savedUser && savedToken) {
                try {
                    // Validate JWT is still good
                    await apiClient.get<any>('/auth/me', savedToken);
                    const parsedUser: AuthUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setAccessToken(savedToken);
                    setDriveAccessToken(savedDriveToken || null);
                } catch {
                    // Token expired or invalid — clear everything
                    localStorage.removeItem('anydo_user');
                    localStorage.removeItem('anydo_token');
                    localStorage.removeItem('anydo_drive_token');
                }
            }

            setIsLoading(false);
        };

        bootstrapAuth();
    }, []);

    const loginWithGoogle = useCallback(() => {
        // Redirect browser to backend Google OAuth route
        window.location.href = `${BACKEND_URL}/auth/google`;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        setDriveAccessToken(null);

        localStorage.removeItem('anydo_user');
        localStorage.removeItem('anydo_token');
        localStorage.removeItem('anydo_drive_token');
        localStorage.removeItem('anydo_files');
        localStorage.removeItem('anydo_links');
        localStorage.removeItem('anydo_todos');
        localStorage.removeItem('anydo_chats');
    }, []);

    const handleAuthError = useCallback((error: any) => {
        if (error?.status === 401 || error?.message?.includes('401')) {
            console.warn('Authentication expired, logging out...');
            logout();
        }
    }, [logout]);

    const value: AuthContextType = {
        user,
        accessToken,
        driveAccessToken,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        logout,
        handleAuthError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
