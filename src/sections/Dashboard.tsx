import {
    FolderOpen, Link2, CheckSquare, MessageCircle,
    TrendingUp, Clock, Calendar, ArrowRight
} from 'lucide-react';
import { formatFileSize, getRelativeTime } from '../utils/storage';
import './Dashboard.scss';

export default function Dashboard({
    files, links, todos, chats,
    onNavigate
}) {
    const stats = [
        {
            id: 'files',
            label: 'Files',
            count: files.length,
            icon: FolderOpen,
            color: '#6366f1',
            size: files.reduce((acc, f) => acc + f.size, 0)
        },
        {
            id: 'links',
            label: 'Links',
            count: links.length,
            icon: Link2,
            color: '#a855f7'
        },
        {
            id: 'todos',
            label: 'Tasks',
            count: todos.length,
            icon: CheckSquare,
            color: '#22c55e',
            completed: todos.filter(t => t.completed).length
        },
        {
            id: 'chats',
            label: 'Chats',
            count: chats.length,
            icon: MessageCircle,
            color: '#25D366'
        },
    ];

    const recentItems = [
        ...files.map(f => ({ ...f, type: 'file', section: 'files' })),
        ...links.map(l => ({ ...l, type: 'link', section: 'links' })),
        ...todos.map(t => ({ ...t, type: 'todo', section: 'todos' })),
        ...chats.map(c => ({ ...c, type: 'chat', section: 'chats' })),
    ]
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 8);

    const getItemIcon = (type) => {
        const icons = {
            file: FolderOpen,
            link: Link2,
            todo: CheckSquare,
            chat: MessageCircle
        };
        return icons[type];
    };

    const getItemTitle = (item) => {
        if (item.type === 'file') return item.name;
        if (item.type === 'link') return item.title || item.url;
        if (item.type === 'todo') return item.title;
        if (item.type === 'chat') return item.name;
        return 'Unknown';
    };

    return (
        <section className="dashboard">
            <div className="section-header">
                <div>
                    <h1 className="section-title gradient-text">Welcome Back</h1>
                    <p className="section-subtitle">Here&apos;s what&apos;s happening with your data</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className="stat-card stagger-item"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                '--stat-color': stat.color
                            }}
                            onClick={() => onNavigate(stat.id)}
                        >
                            <div className="stat-icon">
                                <Icon size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-count">{stat.count}</span>
                                <span className="stat-label">{stat.label}</span>
                                {stat.size !== undefined && (
                                    <span className="stat-extra">{formatFileSize(stat.size)}</span>
                                )}
                                {stat.completed !== undefined && (
                                    <span className="stat-extra">{stat.completed} completed</span>
                                )}
                            </div>
                            <div className="stat-arrow">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="recent-section">
                <div className="recent-header">
                    <h2>
                        <Clock size={20} />
                        Recent Activity
                    </h2>
                </div>

                {recentItems.length > 0 ? (
                    <div className="recent-list">
                        {recentItems.map((item, index) => {
                            const Icon = getItemIcon(item.type);
                            return (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="recent-item stagger-item"
                                    style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                                    onClick={() => onNavigate(item.section)}
                                >
                                    <div className="recent-icon" data-type={item.type}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="recent-content">
                                        <span className="recent-title">{getItemTitle(item)}</span>
                                        <span className="recent-meta">
                                            <Calendar size={10} />
                                            {getRelativeTime(item.addedAt)}
                                        </span>
                                    </div>
                                    <span className="recent-type">{item.type}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <TrendingUp className="empty-state-icon" />
                        <h3 className="empty-state-title">No activity yet</h3>
                        <p className="empty-state-text">
                            Start by uploading files, saving links, or creating tasks
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Tips */}
            <div className="tips-section">
                <h3>Quick Tips</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <FolderOpen size={20} />
                        <p>Drag & drop files anywhere to upload</p>
                    </div>
                    <div className="tip-card">
                        <Link2 size={20} />
                        <p>Paste any URL to quickly save links</p>
                    </div>
                    <div className="tip-card">
                        <MessageCircle size={20} />
                        <p>Export WhatsApp chats as .txt to import</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
