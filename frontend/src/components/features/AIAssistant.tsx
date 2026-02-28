import { useState, useRef, useEffect } from 'react';
import {
    Sparkles, X, Send, Search, Lightbulb, FileText,
    MessageSquare, Loader2, Plus, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiChat, aiSearch, aiSummarize, aiSuggestions } from '../../utils/aiService';
import './AIAssistant.scss';

interface AIAssistantProps {
    files: any[];
    links: any[];
    todos: any[];
    chats: any[];
    onAddTodo?: (todo: any) => void;
}

export default function AIAssistant({ files, links, todos, chats, onAddTodo }: AIAssistantProps) {
    const { accessToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
        { role: 'assistant', content: 'Hi! I\'m Kiro, your AI assistant 🤖 How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<{ type: string; name: string; reason: string }[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const context = { files, links, todos, chats };

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle chat message
    const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await aiChat(userMessage, context, accessToken);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again. 🙁'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle smart search
    const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setSearchResults([]);

        try {
            const results = await aiSearch(input, context, accessToken);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get AI suggestions
    const handleGetSuggestions = async () => {
        setIsLoading(true);
        setSuggestions([]);

        try {
            const results = await aiSuggestions(context, accessToken);
            setSuggestions(results);
        } catch (error) {
            console.error('Suggestions error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get summary
    const handleSummarize = async (type: 'todos' | 'chats') => {
        setIsLoading(true);
        setSummary('');

        try {
            let content = '';
            if (type === 'todos') {
                content = todos?.map(t => `${t.completed ? '✓' : '○'} ${t.title}`).join('\n') || 'No todos';
            } else if (type === 'chats' && chats?.length) {
                content = chats[0].content.substring(0, 2000);
            }

            const result = await aiSummarize(content, type === 'chats' ? 'chat' : 'todos', accessToken);
            setSummary(result);
        } catch {
            setSummary('Could not generate summary');
        } finally {
            setIsLoading(false);
        }
    };

    // Add suggestion as todo
    const handleAddSuggestion = (suggestion: string) => {
        if (onAddTodo) {
            onAddTodo({ title: suggestion, completed: false });
            setSuggestions(prev => prev.filter(s => s !== suggestion));
        }
    };

    const tabs = [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'suggest', label: 'Suggest', icon: Lightbulb },
        { id: 'summary', label: 'Summary', icon: FileText },
    ];

    return (
        <div className="ai-assistant-container">
            {/* Toggle Button */}
            <button
                className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </button>

            {/* Assistant Panel */}
            {isOpen && (
                <div className="ai-panel">
                    {/* Header */}
                    <div className="ai-header">
                        <Sparkles size={20} />
                        <span>Kiro AI</span>
                    </div>

                    {/* Tabs */}
                    <div className="ai-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="ai-content">
                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <div className="ai-chat">
                                <div className="ai-messages">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`ai-message ${msg.role}`}
                                        >
                                            {msg.content}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="ai-message assistant loading">
                                            <Loader2 className="spin" size={16} />
                                            Thinking...
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        )}

                        {/* Search Tab */}
                        {activeTab === 'search' && (
                            <div className="ai-search">
                                {searchResults.length > 0 ? (
                                    <div className="search-results">
                                        {searchResults.map((result, i) => (
                                            <div key={i} className="search-result-item">
                                                <span className="result-type">{result.type}</span>
                                                <span className="result-name">{result.name}</span>
                                                <span className="result-reason">{result.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="ai-placeholder">
                                        <Search size={48} />
                                        <p>Ask anything in natural language</p>
                                        <span>&quot;Find my project files&quot; or &quot;Show urgent tasks&quot;</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Suggestions Tab */}
                        {activeTab === 'suggest' && (
                            <div className="ai-suggest">
                                {suggestions.length > 0 ? (
                                    <div className="suggestions-list">
                                        {suggestions.map((suggestion, i) => (
                                            <div key={i} className="suggestion-item">
                                                <span>{suggestion}</span>
                                                <button
                                                    className="add-suggestion-btn"
                                                    onClick={() => handleAddSuggestion(suggestion)}
                                                    title="Add as Todo"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="ai-placeholder">
                                        <Lightbulb size={48} />
                                        <p>Get smart task suggestions</p>
                                        <button
                                            className="generate-btn"
                                            onClick={handleGetSuggestions}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="spin" size={16} /> Generating...</>
                                            ) : (
                                                <><Sparkles size={16} /> Generate Suggestions</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div className="ai-summary">
                                {summary ? (
                                    <div className="summary-content">
                                        <p>{summary}</p>
                                    </div>
                                ) : (
                                    <div className="ai-placeholder">
                                        <FileText size={48} />
                                        <p>Summarize your data</p>
                                        <div className="summary-options">
                                            <button
                                                onClick={() => handleSummarize('todos')}
                                                disabled={isLoading}
                                            >
                                                <ChevronRight size={14} />
                                                Summarize Todos
                                            </button>
                                            {chats?.length > 0 && (
                                                <button
                                                    onClick={() => handleSummarize('chats')}
                                                    disabled={isLoading}
                                                >
                                                    <ChevronRight size={14} />
                                                    Summarize Latest Chat
                                                </button>
                                            )}
                                        </div>
                                        {isLoading && (
                                            <div className="loading-indicator">
                                                <Loader2 className="spin" size={20} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input (for chat and search) */}
                    {(activeTab === 'chat' || activeTab === 'search') && (
                        <form
                            className="ai-input-form"
                            onSubmit={activeTab === 'chat' ? handleSendMessage : handleSearch}
                        >
                            <input
                                type="text"
                                placeholder={activeTab === 'chat' ? 'Ask me anything...' : 'Search in natural language...'}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="ai-input"
                            />
                            <button
                                type="submit"
                                className="ai-send-btn"
                                disabled={!input.trim() || isLoading}
                            >
                                {isLoading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
