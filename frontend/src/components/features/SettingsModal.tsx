"use client";

import { useState } from 'react';
import { X, Trash2, LogOut, User, Shield, Moon, Sun, Crown, Activity, MessageSquare, HelpCircle, Key, MonitorOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sendAccountDeletedNotification } from '../../utils/emailService';
import './SettingsModal.scss';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // Send deletion notification email before clearing data
            await sendAccountDeletedNotification(user);

            // Clear all local data
            localStorage.clear();

            // Clear IndexedDB
            const databases = await indexedDB.databases();
            for (const db of databases) {
                if (db.name) {
                    indexedDB.deleteDatabase(db.name);
                }
            }

            // Logout
            logout();
            onClose();
        } catch (error) {
            console.error('Error deleting account:', error);
            setIsDeleting(false);
        }
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="settings-content">
                    {/* Account Section */}
                    <div className="settings-section">
                        <h3><User size={16} /> Account</h3>
                        <div className="account-info">
                            {user?.picture && (
                                <img src={user.picture} alt={user.name} className="account-avatar" />
                            )}
                            <div className="account-details">
                                <span className="account-name">{user?.name || 'User'}</span>
                                <span className="account-email">{user?.email || ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="settings-section">
                        <h3><Moon size={16} /> Appearance</h3>
                        <div className="theme-toggle-container">
                            <span className="theme-label">Theme</span>
                            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Subscription Section */}
                    <div className="settings-section">
                        <h3><Crown size={16} /> Subscription</h3>
                        <button className="settings-action-btn subscription-btn">
                            <Crown size={18} />
                            <span>Manage Subscription</span>
                        </button>
                    </div>

                    {/* Usage Section */}
                    <div className="settings-section">
                        <h3><Activity size={16} /> Usage</h3>
                        <button className="settings-action-btn">
                            <Activity size={18} />
                            <span>Activity Log</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <div className="settings-section">
                        <h3><HelpCircle size={16} /> Support</h3>
                        <button className="settings-action-btn">
                            <MessageSquare size={18} />
                            <span>Send Feedback</span>
                        </button>
                        <button className="settings-action-btn">
                            <HelpCircle size={18} />
                            <span>Help Center</span>
                        </button>
                    </div>

                    {/* Security Section */}
                    <div className="settings-section">
                        <h3><Shield size={16} /> Security</h3>
                        <button className="settings-action-btn">
                            <Key size={18} />
                            <span>Passkey</span>
                        </button>
                        <button className="settings-action-btn">
                            <MonitorOff size={18} />
                            <span>Log out from all devices</span>
                        </button>
                        <button className="settings-action-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="settings-section danger-zone">
                        <h3><Trash2 size={16} /> Danger Zone</h3>

                        {!showDeleteConfirm ? (
                            <button
                                className="delete-account-btn"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 size={18} />
                                <span>Delete Account</span>
                            </button>
                        ) : (
                            <div className="delete-confirm">
                                <p>Are you sure? This will delete all your local data. Your Google Drive files will remain.</p>
                                <div className="delete-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="confirm-delete-btn"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
