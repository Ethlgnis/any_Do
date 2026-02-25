import { useState, useRef } from 'react';
import {
    MessageCircle, Plus, Upload, Trash2, Eye, X,
    Calendar, MessageSquare
} from 'lucide-react';
import { getRelativeTime } from '../utils/storage';
import './ChatsSection.scss';

interface ChatsSectionProps {
    chats: any[];
    onAdd: (chat: any) => void;
    onDelete: (id: string) => void;
    searchQuery: string;
}

export default function ChatsSection({ chats, onAdd, onDelete, searchQuery }: ChatsSectionProps) {
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
        <section className="chats-section">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Chats</h1>
                    <p className="section-subtitle">{filteredChats.length} conversations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Import Chat
                </button>
            </div>

            {/* Chats Grid */}
            {filteredChats.length > 0 ? (
                <div className="chats-grid">
                    {filteredChats.map((chat, index) => (
                        <div
                            key={chat.id}
                            className="chat-card stagger-item"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="chat-card-header">
                                <div className="chat-icon">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="chat-info">
                                    <h3 className="chat-name">{chat.name}</h3>
                                    <span className="chat-count">{chat.messageCount} messages</span>
                                </div>
                            </div>

                            <p className="chat-preview">
                                {chat.content.substring(0, 150)}...
                            </p>

                            <div className="chat-card-footer">
                                <span className="chat-date">
                                    <Calendar size={12} />
                                    {getRelativeTime(chat.addedAt)}
                                </span>
                                <div className="chat-actions">
                                    <button
                                        className="action-btn"
                                        title="View Chat"
                                        onClick={() => setViewingChat(chat)}
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        title="Delete"
                                        onClick={() => onDelete(chat.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <MessageCircle className="empty-state-icon" />
                    <h3 className="empty-state-title">No chats imported</h3>
                    <p className="empty-state-text">
                        Import WhatsApp chat exports to view and search through old conversations
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Upload size={18} />
                        Import Your First Chat
                    </button>
                </div>
            )}

            {/* Import Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Import Chat</h2>
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
                                    <MessageCircle size={16} />
                                    Import Chat
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
