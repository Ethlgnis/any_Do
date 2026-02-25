import { useState, useRef, useCallback } from 'react';
import {
    Upload, File, FileText, Image, Film, Music, Archive,
    Code, Grid, List, Trash2, Eye, Calendar
} from 'lucide-react';
import { formatFileSize, getFileIcon, getRelativeTime } from '../utils/storage';
import './FilesSection.css';

const fileIcons = {
    image: Image,
    pdf: FileText,
    doc: FileText,
    video: Film,
    audio: Music,
    archive: Archive,
    code: Code,
    file: File,
};

export default function FilesSection({ files, onUpload, onDelete, onView, searchQuery }) {
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const fileInputRef = useRef(null);

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(file => onUpload(file));
    }, [onUpload]);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        selectedFiles.forEach(file => onUpload(file));
        e.target.value = '';
    };

    const getIconComponent = (type) => {
        const iconType = getFileIcon(type);
        return fileIcons[iconType] || File;
    };

    return (
        <section className="files-section">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Files</h1>
                    <p className="section-subtitle">{filteredFiles.length} files stored</p>
                </div>
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="drop-zone-icon" />
                <h3 className="drop-zone-title">Drop files here or click to upload</h3>
                <p className="drop-zone-text">Support for PDF, documents, images, and more</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                />
            </div>

            {/* Files Grid/List */}
            {filteredFiles.length > 0 ? (
                <div className={viewMode === 'grid' ? 'files-grid' : 'files-list'}>
                    {filteredFiles.map((file, index) => {
                        const IconComponent = getIconComponent(file.type);
                        return (
                            <div
                                key={file.id}
                                className={`file-card stagger-item ${viewMode}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="file-icon-container">
                                    <IconComponent size={viewMode === 'grid' ? 32 : 24} />
                                </div>
                                <div className="file-info">
                                    <h4 className="file-name" title={file.name}>{file.name}</h4>
                                    <div className="file-meta">
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                        <span className="file-date">
                                            <Calendar size={12} />
                                            {getRelativeTime(file.addedAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="file-actions">
                                    <button
                                        className="action-btn"
                                        title="View"
                                        onClick={() => onView(file)}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        title="Delete"
                                        onClick={() => onDelete(file.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <File className="empty-state-icon" />
                    <h3 className="empty-state-title">No files yet</h3>
                    <p className="empty-state-text">
                        Upload your first file by dragging and dropping or clicking above
                    </p>
                </div>
            )}
        </section>
    );
}
