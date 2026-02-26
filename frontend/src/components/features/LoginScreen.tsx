import { useAuth } from '../../context/AuthContext';
import { Cloud, Sparkles } from 'lucide-react';
import './LoginScreen.scss';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();

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
                    <div className="login-logo">
                        <Sparkles size={32} />
                    </div>
                    <h1>AnyDo</h1>
                    <p>Universal File Storage</p>
                </div>

                <div className="login-features">
                    <div className="feature">
                        <Cloud size={20} />
                        <span>15 GB Free Cloud Storage</span>
                    </div>
                    <div className="feature">
                        <span>📁</span>
                        <span>Store Files, Links, Todos, Chats</span>
                    </div>
                    <div className="feature">
                        <span>🔄</span>
                        <span>Sync Across All Devices</span>
                    </div>
                </div>

                <button className="google-login-btn" onClick={login}>
                    <span>
                        Sign in with 
                        <span className="google-brand">
                            <span className="g-blue">G</span>
                            <span className="g-red">o</span>
                            <span className="g-yellow">o</span>
                            <span className="g-blue">g</span>
                            <span className="g-green">l</span>
                            <span className="g-red">e</span>
                        </span>
                    </span>
                </button>

                <p className="login-note">
                    Sign in to access your files and data stored in Google Drive
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
