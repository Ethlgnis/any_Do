"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    FolderOpen, Link2, CheckSquare, MessageCircle, Crown,
    LayoutDashboard, Settings, Cloud, CloudOff,
    ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDriveQuota } from '../../utils/driveStorage';
import SettingsModal from '../features/SettingsModal';
import './Sidebar.scss';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'links', label: 'Links', icon: Link2 },
    { id: 'todos', label: 'To-Do List', icon: CheckSquare },
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'subscription', label: 'Subscription', icon: Crown },
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
    const { isAuthenticated, accessToken, login, handleAuthError } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [driveStorage, setDriveStorage] = useState<DriveStorage | null>(null);
    const [isLoadingStorage, setIsLoadingStorage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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
        if (!accessToken) return;
        setIsLoadingStorage(true);
        try {
            const quota = await getDriveQuota(accessToken);
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
    }, [accessToken, handleAuthError]);

    // Fetch Drive storage quota when authenticated
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            fetchDriveStorage();
            // Refresh storage every 30 seconds
            const interval = setInterval(fetchDriveStorage, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, accessToken, fetchDriveStorage]);

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
                        <div className="logo-icon">
                            <span>A</span>
                        </div>
                        {!collapsed && <span className="logo-text">AnyDo</span>}
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
                                <li key={item.id}>
                                    <button
                                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                        onClick={() => {
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
                                </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* Storage Indicator - Show error state or connected state */}
                    {isAuthenticated && (
                        <div className={`storage-indicator ${collapsed ? 'collapsed' : ''}`}>
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
                                                <div
                                                    className="storage-fill cloud"
                                                    style={{ width: `${storageInfo.percentage}%` }}
                                                />
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
                                                onClick={login}
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
