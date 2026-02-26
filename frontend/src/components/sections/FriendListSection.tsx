import { useState, useRef } from 'react';
import {
    Plus, Upload, Trash2, Eye, X,
    Calendar, MessageSquare, Users
} from 'lucide-react';
import { getRelativeTime } from '../../utils/storage';
import './FriendListSection.scss';

interface FriendListSectionProps {
    chats: any[];
    onAdd: (chat: any) => void;
    onDelete: (id: string) => void;
    searchQuery: string;
}

export default function FriendListSection({ chats, onAdd, onDelete, searchQuery }: FriendListSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [viewingChat, setViewingChat] = useState<{ name: string; content: string } | null>(null);
    const [formData, setFormData] = useState({ name: '', content: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({
                    name: file.name.replace('.txt', ''),
                    content: (event.target?.result as string) || ''
                });
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content.trim()) return;

        onAdd({
            name: formData.name || 'Imported Chat',
            content: formData.content
        });

        setFormData({ name: '', content: '' });
        setShowModal(false);
    };

    const parseWhatsAppMessage = (line: string) => {
        // WhatsApp format: [DD/MM/YYYY, HH:MM:SS] Sender: Message
        // or: DD/MM/YYYY, HH:MM - Sender: Message
        const patterns = [
            /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*-?\s*([^:]+):\s*(.+)$/i,
            /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.+)$/i
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                return {
                    date: match[1],
                    time: match[2],
                    sender: match[3].trim(),
                    message: match[4]
                };
            }
        }

        return null;
    };

    const renderChatContent = (content: string) => {
        const lines = content.split('\n');
        let lastSender = '';

        return lines.map((line: string, index: number) => {
            const parsed = parseWhatsAppMessage(line);

            if (parsed) {
                const isMe = parsed.sender.toLowerCase().includes('you') ||
                    parsed.sender.toLowerCase().includes('me');
                const sameSender = parsed.sender === lastSender;
                lastSender = parsed.sender;

                return (
                    <div
                        key={index}
                        className={`chat-bubble ${isMe ? 'sent' : 'received'} ${sameSender ? 'same-sender' : ''}`}
                    >
                        {!sameSender && <span className="chat-sender">{parsed.sender}</span>}
                        <p className="chat-message">{parsed.message}</p>
                        <span className="chat-time">{parsed.time}</span>
                    </div>
                );
            }

            // Non-message line (system message or unparseable)
            if (line.trim()) {
                return (
                    <div key={index} className="chat-system">
                        {line}
                    </div>
                );
            }

            return null;
        });
    };

    return (
        <section className="friend-list-section">
            <div className="section-hero">
                <div className="hero-content">
                    <h1 className="hero-title gradient-text">Friend List</h1>
                    <p className="hero-subtitle">Search, view, and manage your imported friends history</p>
                    
                    <button className="btn btn-big-import" onClick={() => setShowModal(true)}>
                        <Upload size={20} />
                        <span>Import Friend List</span>
                    </button>
                </div>
            </div>

            <div className="section-content">
                {filteredChats.length > 0 && (
                    <div className="friends-grid">
                        {filteredChats.map((chat, index) => (
                            <div
                                key={chat.id}
                                className="friend-card-big stagger-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onClick={() => setViewingChat(chat)}
                            >
                                <div className="friend-card-glow"></div>
                                <div className="friend-card-content">
                                    <div className="friend-card-header">
                                        <div className="friend-avatar">
                                            {chat.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="friend-meta">
                                            <h3 className="friend-name">{chat.name}</h3>
                                            <span className="friend-label">{chat.messageCount} messages</span>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(chat.id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="friend-body-preview">
                                        <p>{chat.content.substring(0, 180)}...</p>
                                    </div>

                                    <div className="friend-card-footer">
                                        <span className="date-tag">
                                            <Calendar size={12} />
                                            {getRelativeTime(chat.addedAt)}
                                        </span>
                                        <div className="read-more">
                                            <span>View profile</span>
                                            <Eye size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Import Friend List</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div
                                    className="upload-zone"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={32} />
                                    <p>Click to upload a .txt chat export</p>
                                    <span>or drag and drop</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileUpload}
                                        hidden
                                    />
                                </div>

                                <div className="divider">
                                    <span>or paste chat text</span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="chatName">Chat Name</label>
                                    <input
                                        id="chatName"
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Family Group, John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="chatContent">Chat Content *</label>
                                    <textarea
                                        id="chatContent"
                                        className="input textarea"
                                        placeholder="Paste your WhatsApp chat export here..."
                                        rows={8}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Users size={16} />
                                    Import Friend List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Viewer Modal */}
            {viewingChat && (
                <div className="modal-overlay" onClick={() => setViewingChat(null)}>
                    <div className="modal chat-viewer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{viewingChat?.name}</h2>
                            <button className="modal-close" onClick={() => setViewingChat(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body chat-viewer-body">
                            <div className="chat-messages">
                                {renderChatContent(viewingChat?.content)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
