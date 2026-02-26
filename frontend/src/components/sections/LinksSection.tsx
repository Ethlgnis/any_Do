import { useState } from 'react';
import {
    Link2, Plus, ExternalLink, Copy, Trash2,
    X, Check, Calendar, Tag, Globe
} from 'lucide-react';
import { getRelativeTime } from '../../utils/storage';
import './LinksSection.scss';

const categories = ['General', 'Work', 'Personal', 'Learning', 'Social', 'News', 'Shopping'];

interface LinksSectionProps {
    links: any[];
    onAdd: (link: any) => void;
    onDelete: (id: string) => void;
    searchQuery: string;
}

export default function LinksSection({ links, onAdd, onDelete, searchQuery }: LinksSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        category: 'General'
    });

    const filteredLinks = links.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) return;

        onAdd({
            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
            title: formData.title || new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`).hostname,
            description: formData.description,
            category: formData.category
        });

        setFormData({ url: '', title: '', description: '', category: 'General' });
        setShowModal(false);
    };

    const copyToClipboard = async (url: string) => {
        await navigator.clipboard.writeText(url);
    };

    const getFaviconUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return undefined;
        }
    };

    return (
        <section className="links-section">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Links</h1>
                    <p className="section-subtitle">{filteredLinks.length} links saved</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Link
                </button>
            </div>

            {/* Links Grid */}
            {filteredLinks.length > 0 ? (
                <div className="links-grid">
                    {filteredLinks.map((link, index) => (
                        <div
                            key={link.id}
                            className="link-card stagger-item"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="link-header">
                                <div className="link-favicon">
                                    {getFaviconUrl(link.url) ? (
                                        <img src={getFaviconUrl(link.url)} alt="" />
                                    ) : (
                                        <Globe size={20} />
                                    )}
                                </div>
                                <div className="link-category">
                                    <Tag size={10} />
                                    {link.category}
                                </div>
                            </div>

                            <div className="link-content">
                                <h3 className="link-title">{link.title}</h3>
                                <p className="link-url">{link.url}</p>
                                {link.description && (
                                    <p className="link-description">{link.description}</p>
                                )}
                            </div>

                            <div className="link-footer">
                                <span className="link-date">
                                    <Calendar size={12} />
                                    {getRelativeTime(link.addedAt)}
                                </span>
                                <div className="link-actions">
                                    <button
                                        className="action-btn"
                                        title="Copy URL"
                                        onClick={() => copyToClipboard(link.url)}
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn"
                                        title="Open Link"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    <button
                                        className="action-btn delete"
                                        title="Delete"
                                        onClick={() => onDelete(link.id)}
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
                    <Link2 className="empty-state-icon" />
                    <h3 className="empty-state-title">No links saved</h3>
                    <p className="empty-state-text">
                        Save your favorite websites, articles, and resources
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Add Your First Link
                    </button>
                </div>
            )}

            {/* Add Link Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Link</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="url">URL *</label>
                                    <input
                                        id="url"
                                        type="text"
                                        className="input"
                                        placeholder="https://example.com"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="title">Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        className="input"
                                        placeholder="Link title (optional)"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="input textarea"
                                        placeholder="Add a description..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        className="input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={16} />
                                    Save Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
