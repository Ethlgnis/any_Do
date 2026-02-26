import { useState, useRef, useEffect } from 'react';
import {
    FolderOpen, Link2, CheckSquare, MessageCircle,
    TrendingUp, Clock, Calendar, Plus, Image, Search, Globe, HelpCircle, Send, Loader2
} from 'lucide-react';
import { aiChat } from '../../utils/aiService';
import { formatFileSize, getRelativeTime } from '../../utils/storage';
import './Dashboard.scss';

interface DashboardProps {
    files: any[];
    links: any[];
    todos: any[];
    chats: any[];
    user?: any;
    onNavigate: (sectionId: string) => void;
}

export default function Dashboard({
    files, links, todos, chats, user,
    onNavigate
}: DashboardProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        
        // Reset textarea height when input is cleared or loading finishes
        if (!input) {
            const textarea = document.querySelector('.prompt-input') as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.height = 'auto';
            }
        }
    }, [messages, isLoading, input]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { 
            id: Date.now().toString(),
            role: 'user', 
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = { files, links, todos, chats };
            const response = await aiChat(userMessage.content, context);
            
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting right now. 🙁",
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={`dashboard ${messages.length > 0 ? 'has-chat' : ''}`}>
            <div className="dashboard-hero">
                {/* Chat History */}
                {messages.length > 0 && (
                    <div className="chat-history">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-meta">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper assistant">
                                <div className="message-bubble loading">
                                    <Loader2 className="spin" size={18} />
                                    <span>Kiro is thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <div className="prompt-container">
                    <form className="prompt-bar" onSubmit={handleSendMessage}>
                        <div className="prompt-icon-plus-wrapper">
                            <div className="prompt-icon-plus">
                                <Plus size={24} />
                            </div>
                            <div className="actions-menu">
                                <button className="action-item" onClick={() => onNavigate('files')} type="button">
                                    <Image size={18} />
                                    <span>Add file or photo</span>
                                </button>
                                <button className="action-item" type="button">
                                    <Search size={18} />
                                    <span>Deep research</span>
                                </button>
                                <button className="action-item" type="button">
                                    <Globe size={18} />
                                    <span>Web search</span>
                                </button>
                                <button className="action-item" type="button">
                                    <HelpCircle size={18} />
                                    <span>Quizze</span>
                                </button>
                            </div>
                        </div>
                        <textarea 
                            className="prompt-input"
                            placeholder={messages.length > 0 ? "Ask a follow up..." : (user?.name ? `Anydo for ${user.name}!` : "Anydo for you!")}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            rows={1}
                            onFocus={(e) => { if (!messages.length) e.target.placeholder = ''; }}
                            onBlur={(e) => { if (!messages.length) e.target.placeholder = (user?.name ? `Anydo for ${user.name}!` : "Anydo for you!"); }}
                        />
                        <div className="prompt-actions">
                            {input.trim() ? (
                                <button type="submit" className="prompt-btn send" title="Send message">
                                    <Send size={20} />
                                </button>
                            ) : (
                                <>
                                    <button type="button" className="prompt-btn" title="Add files" onClick={() => onNavigate('files')}>
                                        <FolderOpen size={20} />
                                    </button>
                                    <button type="button" className="prompt-btn" title="Voice input">
                                        <MessageCircle size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
