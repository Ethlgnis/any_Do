"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sendLoginNotification } from '../utils/emailService';
import { apiClient } from '../utils/apiClient';

declare global {
    interface Window {
        google?: any;
    }
}

const AuthContext = createContext<any>(null);

// Your Google Cloud OAuth Client ID
const GOOGLE_CLIENT_ID = '654874405185-6koeq1ij3q1onptd6rj2s6rctot99nid.apps.googleusercontent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenClient, setTokenClient] = useState<any>(null);

    // Restore session from localStorage and validate with backend
    useEffect(() => {
        const bootstrapAuth = async () => {
            const savedUser = localStorage.getItem('anydo_user');
            const savedToken = localStorage.getItem('anydo_token');

            if (savedUser && savedToken) {
                try {
                    // Validate token with backend
                    const me = await apiClient.get<any>('/auth/me', savedToken);
                    const parsedUser = JSON.parse(savedUser);
                    setUser({ ...parsedUser, role: me.role });
                    setAccessToken(savedToken);
                } catch {
                    localStorage.removeItem('anydo_user');
                    localStorage.removeItem('anydo_token');
                }
            }
            setIsLoading(false);
        };

        bootstrapAuth();
    }, []);

    const login = useCallback(
        async (email: string, password: string) => {
            try {
                const result = await apiClient.post<{
                    accessToken: string;
                    user: { id: string; name: string; email: string; role: string };
                }>('/auth/login', { email, password });

                setAccessToken(result.accessToken);
                setUser(result.user);
                localStorage.setItem('anydo_token', result.accessToken);
                localStorage.setItem('anydo_user', JSON.stringify(result.user));

                // Optional: send notification email
                sendLoginNotification(result.user);
            } catch (error: any) {
                if (error?.status !== 401) {
                    console.error('Login failed', error);
                }
                throw error;
            }
        },
        [],
    );

    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);

        // Clear all user data from localStorage
        localStorage.removeItem('anydo_user');
        localStorage.removeItem('anydo_token');
        localStorage.removeItem('anydo_files');
        localStorage.removeItem('anydo_links');
        localStorage.removeItem('anydo_todos');
        localStorage.removeItem('anydo_chats');
    }, [accessToken]);

    const handleAuthError = useCallback((error: any) => {
        if (error.status === 401 || error.message?.includes('401')) {
            console.warn('Authentication expired, logging out...');
            logout();
        }
    }, [logout]);

    const value = {
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
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
