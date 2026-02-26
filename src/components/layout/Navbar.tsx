import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Menu, X, Cloud, CloudOff, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

export default function Navbar({ onSearch, onAddClick, onMenuClick, showMobileMenu, onSync, isSyncing, onMenuChange }) {
    const { user, isAuthenticated, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch?.(value);
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Search Bar */}
                <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search files, links, todos..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => { setSearchQuery(''); onSearch?.(''); }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

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

                    <button className="btn btn-primary add-btn" onClick={onAddClick}>
                        <Plus size={18} />
                        <span className="add-btn-text">Add New</span>
                    </button>
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
