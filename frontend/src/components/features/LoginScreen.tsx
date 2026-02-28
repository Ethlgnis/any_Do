import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Cloud, Sparkles } from 'lucide-react';
import './LoginScreen.scss';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err?.message || 'Invalid email or password');
        } finally {
            setIsSubmitting(false);
        }
    };

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

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button className="google-login-btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="login-note">
                    Use your account to access your files, links, todos, chats, and more.
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
