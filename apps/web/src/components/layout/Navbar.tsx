import { useState, useRef, useEffect } from 'react';
import { Menu, X, Cloud, CloudOff, LogOut, User, Crown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

interface NavbarProps {
    onMenuClick: () => void;
    showMobileMenu: boolean;
    onSync: () => Promise<void>;
    isSyncing: boolean;
    onMenuChange?: (section: string) => void;
}

export default function Navbar({
    onMenuClick,
    showMobileMenu,
    onSync,
    isSyncing,
    onMenuChange,
}: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (userMenuRef.current && target && !userMenuRef.current.contains(target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <header className="navbar">
            <div className="navbar-inner">
                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
                </button>


                {/* Actions */}
                <div className="navbar-actions">
                    {/* Sync Button - only show when logged in */}
                    {isAuthenticated && (
                        <button
                            className={`sync-btn ${isSyncing ? 'syncing' : ''}`}
                            onClick={onSync}
                            title="Sync to Google Drive"
                        >
                            <Cloud size={18} />
                            <span className="sync-text">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                        </button>
                    )}
                </div>

                {/* User Profile / Auth - Moved out of navbar-actions */}
                <div className="user-menu-container" ref={userMenuRef}>
                    <button 
                        className="subscription-nav-btn" 
                        onClick={() => onMenuChange?.('subscription')}
                        title="Subscription Plans"
                    >
                        <Crown size={20} />
                        <span className="premium-badge">PRO</span>
                    </button>

                    {isAuthenticated && user?.role === 'admin' && (
                        <button
                            className="admin-nav-btn"
                            onClick={() => onMenuChange?.('admin')}
                            title="Admin Panel"
                        >
                            <Shield size={20} />
                            <span>Admin</span>
                        </button>
                    )}

                    {isAuthenticated && user ? (
                        <>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="user-avatar" />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        <User size={18} />
                                    </div>
                                )}
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        {user.picture && (
                                            <img src={user.picture} alt={user.name} className="dropdown-avatar" />
                                        )}
                                        <div className="user-details">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-email">{user.email}</span>
                                            <span className="user-id">ID: {user.id}</span>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={logout}>
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="offline-indicator" title="Offline mode">
                            <CloudOff size={18} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
