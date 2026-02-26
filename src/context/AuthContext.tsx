"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sendLoginNotification } from '../utils/emailService';

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

    // Initialize Google Identity Services
    useEffect(() => {
        const initializeGoogleAuth = () => {
            if (window.google?.accounts) {
                // Initialize token client for Drive API access
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                    callback: handleTokenResponse,
                });
                setTokenClient(client);

                // Check for existing session
                const savedUser = localStorage.getItem('anydo_user');
                const savedToken = localStorage.getItem('anydo_token');
                if (savedUser && savedToken) {
                    setUser(JSON.parse(savedUser));
                    setAccessToken(savedToken);
                }
                setIsLoading(false);
            } else {
                // Wait for Google script to load
                setTimeout(initializeGoogleAuth, 100);
            }
        };

        initializeGoogleAuth();
    }, []);

    const handleTokenResponse = async (response: any) => {
        if (response.access_token) {
            setAccessToken(response.access_token);
            localStorage.setItem('anydo_token', response.access_token);

            // Fetch user profile
            try {
                const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${response.access_token}` }
                });
                const profile = await profileRes.json();
                const userData = {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture,
                };
                setUser(userData);
                localStorage.setItem('anydo_user', JSON.stringify(userData));

                // Send login notification email
                sendLoginNotification(userData);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        }
    };

    const login = useCallback(() => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        }
    }, [tokenClient]);

    const logout = useCallback(() => {
        if (accessToken && window.google?.accounts) {
            window.google.accounts.oauth2.revoke(accessToken);
        }
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

    const value = {
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
