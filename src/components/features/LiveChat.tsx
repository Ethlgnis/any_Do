import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    setUserOnline,
    setUserOffline,
    subscribeToOnlineUsers,
    sendMessage,
    subscribeToMessages
} from '../../utils/firebaseChat';
import './LiveChat.scss';

export default function LiveChat() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [myChatId, setMyChatId] = useState(null);
    const messagesEndRef = useRef(null);

    // Set user online when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            const chatId = setUserOnline(user);
            setMyChatId(chatId);

            return () => {
                setUserOffline(chatId);
            };
        }
    }, [isAuthenticated, user]);

    // Subscribe to online users
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = subscribeToOnlineUsers((users) => {
            // Filter out current user
            const otherUsers = users.filter(u => u.id !== myChatId);
            setOnlineUsers(otherUsers);
        });

        return () => unsubscribe && unsubscribe();
    }, [isAuthenticated, myChatId]);

    // Subscribe to messages when user selected
    useEffect(() => {
        if (!selectedUser || !myChatId) return;

        const unsubscribe = subscribeToMessages(myChatId, selectedUser.id, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe && unsubscribe();
    }, [selectedUser, myChatId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle message sending
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        sendMessage(user, selectedUser.id, newMessage);
        setNewMessage('');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // If not authenticated or Firebase setup failed, don't render anything
    if (!isAuthenticated) return null;

    return (
        <div className="live-chat-container">
            {/* Floating Button */}
            <button
                className={`live-chat-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {onlineUsers.length > 0 && !isOpen && (
                    <span className="online-badge">{onlineUsers.length}</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="live-chat-window">
                    {/* Header */}
                    <div className="live-chat-header">
                        {selectedUser ? (
                            <>
                                <button
                                    className="back-btn"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <img
                                    src={selectedUser.picture}
                                    alt={selectedUser.name}
                                    className="chat-user-avatar"
                                />
                                <div className="chat-user-info">
                                    <span className="chat-user-name">{selectedUser.name}</span>
                                    <span className="chat-user-status">Online</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Users size={20} />
                                <span>Online Users ({onlineUsers.length})</span>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="live-chat-content">
                        {!selectedUser ? (
                            // Users List
                            <div className="online-users-list">
                                {onlineUsers.length === 0 ? (
                                    <div className="no-users">
                                        <Users size={48} />
                                        <p>No other users online</p>
                                        <span>Share your site to chat with others!</span>
                                    </div>
                                ) : (
                                    onlineUsers.map((onlineUser) => (
                                        <div
                                            key={onlineUser.id}
                                            className="online-user-item"
                                            onClick={() => setSelectedUser(onlineUser)}
                                        >
                                            <img
                                                src={onlineUser.picture}
                                                alt={onlineUser.name}
                                                className="user-avatar"
                                            />
                                            <div className="user-info">
                                                <span className="user-name">{onlineUser.name}</span>
                                                <span className="user-email">{onlineUser.email}</span>
                                            </div>
                                            <span className="online-dot"></span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            // Messages
                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p>No messages yet</p>
                                        <span>Say hello! 👋</span>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`message ${msg.senderId === myChatId ? 'sent' : 'received'}`}
                                        >
                                            {msg.senderId !== myChatId && (
                                                <img
                                                    src={msg.senderPicture}
                                                    alt=""
                                                    className="message-avatar"
                                                />
                                            )}
                                            <div className="message-bubble">
                                                <p>{msg.text}</p>
                                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    {selectedUser && (
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="message-input"
                            />
                            <button
                                type="submit"
                                className="send-btn"
                                disabled={!newMessage.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    )}

                    {/* My Chat ID */}
                    <div className="my-chat-id">
                        Your ID: <code>{myChatId}</code>
                    </div>
                </div>
            )}
        </div>
    );
}
