import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Cloud, Shield, HardDrive } from 'lucide-react';
import Logo from '../common/Logo';
import './LoginScreen.scss';

export default function LoginScreen() {
    const { loginWithGoogle, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="login-screen">
                <div className="login-loader">
                    <div className="loader-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-header">
                    <Link href="/" className="logo-link">
                        <Logo size="lg" className="login-logo-futuristic" />
                    </Link>
                    <p>Your data, your drive, your way.</p>
                </div>

                <div className="login-features">
                    <div className="feature">
                        <HardDrive size={20} />
                        <span>Syncs to your Google Drive</span>
                    </div>
                    <div className="feature">
                        <Cloud size={20} />
                        <span>Files, Chats, Todos &amp; Links</span>
                    </div>
                    <div className="feature">
                        <Shield size={20} />
                        <span>Your data stays in your account</span>
                    </div>
                </div>

                <button
                    className="google-login-btn"
                    onClick={loginWithGoogle}
                    type="button"
                >
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5 13 5 4 14 4 24s9 19 20 19c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.8z"/>
                        <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.6 15.5 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5 16.3 5 9.7 9.1 6.3 14.7z"/>
                        <path fill="#FBBC05" d="M24 43c5.2 0 9.8-1.9 13.4-5L31 32.8C29.1 34.1 26.7 35 24 35c-5.3 0-9.7-3.6-11.3-8.5l-6.5 5C9.5 39 16.2 43 24 43z"/>
                        <path fill="#EA4335" d="M43.6 20.2H42V20H24v8h11.3c-.7 2-2 3.7-3.7 4.9l.1-.1 6.4 5c-.4.4 6.9-5 6.9-13.9 0-1.3-.1-2.6-.4-3.7z"/>
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Sign in with Google</span>
                </button>

                <p className="login-note">
                    Your chat history, todos, and files are stored securely in your own Google Drive.
                </p>
            </div>

            <div className="login-bg-effects">
                <div className="bg-box box-1"></div>
                <div className="bg-box box-2"></div>
                <div className="bg-box box-3"></div>
                <div className="bg-box box-4"></div>
            </div>
        </div>
    );
}
