"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    FolderOpen, Link2, CheckSquare,
    Settings, Cloud, CloudOff,
    ChevronLeft, ChevronRight, RefreshCw, Sparkles, Users, Plus, UserPlus, Globe, Shield,
    MoreHorizontal, MessageSquarePlus, History
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getDriveQuota } from '../../utils/driveStorage';
import SettingsModal from '../features/SettingsModal';
import Logo from '../common/Logo';
import './Sidebar.scss';

const navItems = [
    { id: 'dashboard', label: 'Chat with AnyDo AI', icon: Sparkles },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'links', label: 'Community', icon: Globe },
    { id: 'todos', label: 'To-Do List', icon: CheckSquare },
    { id: 'chats', label: 'Friend List', icon: Users },
];

interface SidebarProps {
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
}

interface DriveStorage {
    used: number;
    limit: number;
    usedInDrive: number;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
    const { isAuthenticated, driveAccessToken, loginWithGoogle, handleAuthError } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [driveStorage, setDriveStorage] = useState<DriveStorage | null>(null);
    const [isLoadingStorage, setIsLoadingStorage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [friends, setFriends] = useState<{ id: string, name: string }[]>([]);
    const [newFriendName, setNewFriendName] = useState('');
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

    // Load friends from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedFriends = localStorage.getItem('anydo_friends');
            if (savedFriends) {
                try {
                    setFriends(JSON.parse(savedFriends));
                } catch (e) {
                    console.error('Error parsing friends:', e);
                }
            }
        }
    }, []);

    // Save friends to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && friends.length > 0) {
            localStorage.setItem('anydo_friends', JSON.stringify(friends));
        }
    }, [friends]);

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFriendName.trim()) {
            const newFriend = {
                id: Date.now().toString(),
                name: newFriendName.trim()
            };
            setFriends([...friends, newFriend]);
            setNewFriendName('');
        }
    };

    useEffect(() => {
        setIsMobile(window.innerWidth <= 1024);
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-collapse on mobile
    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
    }, [isMobile]);

    const fetchDriveStorage = useCallback(async () => {
        if (!driveAccessToken) return;
        setIsLoadingStorage(true);
        try {
            const quota = await getDriveQuota(driveAccessToken);
            console.log('Drive quota response:', quota);
            if (quota.storageQuota) {
                const storageData = {
                    used: parseInt(quota.storageQuota.usage || 0),
                    limit: parseInt(quota.storageQuota.limit || 15 * 1024 * 1024 * 1024),
                    usedInDrive: parseInt(quota.storageQuota.usageInDrive || 0),
                };
                console.log('Setting driveStorage:', storageData);
                setDriveStorage(storageData);
            }
        } catch (error: any) {
            console.error('Error fetching Drive storage:', error.message || error);
            console.error('Full Drive Error Object:', error);
            handleAuthError(error);
        } finally {
            setIsLoadingStorage(false);
        }
    }, [driveAccessToken, handleAuthError]);

    // Fetch Drive storage quota when authenticated
    useEffect(() => {
        if (isAuthenticated && driveAccessToken) {
            fetchDriveStorage();
            // Refresh storage every 30 seconds
            const interval = setInterval(fetchDriveStorage, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, driveAccessToken, fetchDriveStorage]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Calculate storage percentage - only show Google Drive when logged in
    const getStorageInfo = () => {
        if (isAuthenticated && driveStorage) {
            const percentage = (driveStorage.used / driveStorage.limit) * 100;
            return {
                percentage: Math.min(percentage, 100),
                used: formatBytes(driveStorage.used),
                total: formatBytes(driveStorage.limit),
                isCloud: true,
            };
        }
        // Return null if not authenticated or Drive not available
        return null;
    };

    const storageInfo = getStorageInfo();

    const storageWidthClass = storageInfo
        ? `storage-fill-${Math.round(storageInfo.percentage / 5) * 5}`
        : 'storage-fill-0';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && !collapsed && (
                <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Link href="/" className="logo-link">
                            <Logo size="sm" className="sidebar-logo-futuristic" />
                        </Link>
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => (
                                <li key={item.id} className="nav-list-item">
                                    <button
                                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                        onClick={() => {
                                            if (item.id === 'dashboard') {
                                                setIsChatMenuOpen(!isChatMenuOpen);
                                            }
                                            onSectionChange(item.id);
                                            if (isMobile) setCollapsed(true);
                                        }}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon size={20} />
                                        {!collapsed && <span>{item.label}</span>}
                                        {!collapsed && activeSection === item.id && (
                                            <div className="nav-indicator" />
                                        )}
                                    </button>

                                    {item.id === 'dashboard' && !collapsed && (
                                        <button 
                                            className={`more-options-btn ${isChatMenuOpen ? 'open' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsChatMenuOpen(!isChatMenuOpen);
                                            }}
                                            title="More options"
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>
                                    )}

                                    {item.id === 'dashboard' && !collapsed && isChatMenuOpen && (
                                        <div className="sub-nav-menu">
                                            <button className="sub-nav-item">
                                                <MessageSquarePlus size={14} />
                                                <span>New Chat</span>
                                            </button>
                                            <button className="sub-nav-item">
                                                <History size={14} />
                                                <span>History</span>
                                            </button>
                                        </div>
                                    )}
                                </li>
                        ))}
                    </ul>
                </nav>
                
                {/* Friend List Section */}
                <div className={`sidebar-friends-section ${collapsed ? 'collapsed' : ''}`}>
                    {!collapsed && (
                        <div className="friends-header">
                            <Users size={16} />
                            <span>Friends</span>
                        </div>
                    )}
                    
                    {!collapsed && (
                        <form className="add-friend-form" onSubmit={handleAddFriend}>
                            <input 
                                type="text" 
                                placeholder="Add friend..." 
                                value={newFriendName}
                                onChange={(e) => setNewFriendName(e.target.value)}
                            />
                            <button type="submit" title="Add Friend">
                                <Plus size={16} />
                            </button>
                        </form>
                    )}

                    {collapsed && (
                        <div className="add-friend-collapsed">
                             <button onClick={() => setCollapsed(false)} title="Add Friend">
                                <UserPlus size={20} />
                            </button>
                        </div>
                    )}

                    <div className="friends-list">
                        {friends.map(friend => (
                            <div key={friend.id} className="friend-item" title={collapsed ? friend.name : undefined}>
                                <div className="friend-avatar">
                                    {friend.name.charAt(0).toUpperCase()}
                                </div>
                                {!collapsed && <span className="friend-name">{friend.name}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* Storage Indicator - Show error state or connected state */}
                    {isAuthenticated && (
                        <div className={`storage-indicator ${collapsed ? 'collapsed' : ''}`}>
                            {!collapsed && (
                                <div className="byos-badge-container">
                                    <div className="byos-badge" title="Bring Your Own Storage">
                                        <Shield size={10} className="shield-icon" />
                                        <span>Bring Your Own Storage</span>
                                    </div>
                                </div>
                            )}
                            {storageInfo ? (
                                <>
                                    <div className="storage-header">
                                        <Cloud size={16} className="cloud-icon" />
                                        {!collapsed && (
                                            <>
                                                <span>Google Drive</span>
                                                <button
                                                    className={`refresh-btn ${isLoadingStorage ? 'spinning' : ''}`}
                                                    onClick={fetchDriveStorage}
                                                    title="Refresh storage info"
                                                >
                                                    <RefreshCw size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <div className="storage-bar">
                                                <div className={`storage-fill cloud ${storageWidthClass}`} />
                                            </div>
                                            <div className="storage-text">
                                                {storageInfo.used} / {storageInfo.total}
                                            </div>
                                            <div className="storage-status">
                                                <span className="status-dot online"></span>
                                                Synced to cloud
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="storage-header">
                                        <CloudOff size={16} className="cloud-error-icon" />
                                        {!collapsed && <span>Drive Access</span>}
                                    </div>
                                    {!collapsed && (
                                        <div className="drive-access-needed">
                                            <p>Enable Google Drive to store your data</p>
                                                <button
                                                    className="grant-access-btn"
                                                    onClick={loginWithGoogle}
                                                >
                                                    Grant Access
                                                </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Settings */}
                    <button
                        className="nav-item settings-btn"
                        title={collapsed ? 'Settings' : undefined}
                        onClick={() => setShowSettings(true)}
                    >
                        <Settings size={20} />
                        {!collapsed && <span>Settings</span>}
                    </button>
                </div>
            </aside>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}
