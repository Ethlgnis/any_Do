import { useState } from 'react';
import {
    CheckSquare, Plus, Circle, CheckCircle2, Trash2,
    X, Check, Calendar, Flag, Clock
} from 'lucide-react';
import { formatDate, getRelativeTime } from '../../utils/storage';

const priorities = [
    { value: 'low', label: 'Low', color: 'var(--success)' },
    { value: 'medium', label: 'Medium', color: 'var(--warning)' },
    { value: 'high', label: 'High', color: 'var(--error)' },
];

interface TodoSectionProps {
    todos: any[];
    onAdd: (todo: any) => void;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
    searchQuery: string;
}

export default function TodoSection({ todos, onAdd, onUpdate, onDelete, searchQuery }: TodoSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
    });

    const filteredTodos = todos
        .filter(todo =>
            todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            todo.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(todo => {
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        });

    const activeTodos = todos.filter(t => !t.completed).length;
    const completedTodos = todos.filter(t => t.completed).length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onAdd({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            dueDate: formData.dueDate || null
        });

        setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowModal(false);
    };

    const toggleComplete = (id: string, completed: boolean) => {
        onUpdate(id, { completed: !completed });
    };

    const getPriorityStyle = (priority: string) => {
        const p = priorities.find(opt => opt.value === priority) || priorities[0];
        const rgbMap: Record<string, string> = {
            low: '34, 197, 94',
            medium: '245, 158, 11',
            high: '239, 68, 68'
        };
        return {
            '--priority-color': p.color,
            '--priority-rgb': rgbMap[priority] || '34, 197, 94'
        } as React.CSSProperties;
    };

    const isOverdue = (dueDate: Date | string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    return (
        <section className="todo-section">
            <div className="section-header">
                <div>
                    <h1 className="section-title">To-Do List</h1>
                    <p className="section-subtitle">
                        {activeTodos} active, {completedTodos} completed
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="todo-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({todos.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active ({activeTodos})
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({completedTodos})
                </button>
            </div>

            {/* Todo List */}
            {filteredTodos.length > 0 ? (
                <div className="todo-list">
                    {filteredTodos.map((todo, index) => (
                        <div
                            key={todo.id}
                            className={`todo-item stagger-item ${todo.completed ? 'completed' : ''}`}
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                ...getPriorityStyle(todo.priority)
                            }}
                        >
                            <button
                                className="todo-checkbox"
                                onClick={() => toggleComplete(todo.id, todo.completed)}
                            >
                                {todo.completed ? (
                                    <CheckCircle2 size={22} className="checked" />
                                ) : (
                                    <Circle size={22} />
                                )}
                            </button>

                            <div className="todo-content">
                                <h3 className="todo-title">{todo.title}</h3>
                                {todo.description && (
                                    <p className="todo-description">{todo.description}</p>
                                )}
                                <div className="todo-meta">
                                    <span className="todo-added">
                                        <Calendar size={12} />
                                        Added {getRelativeTime(todo.addedAt)}
                                    </span>
                                    {todo.dueDate && (
                                        <span className={`todo-due ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}>
                                            <Clock size={12} />
                                            Due {formatDate(todo.dueDate)}
                                        </span>
                                    )}
                                    <span className="todo-priority">
                                        <Flag size={12} />
                                        {priorities.find(p => p.value === todo.priority)?.label}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="action-btn delete"
                                title="Delete"
                                onClick={() => onDelete(todo.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <CheckSquare className="empty-state-icon" />
                    <h3 className="empty-state-title">
                        {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
                    </h3>
                    <p className="empty-state-text">
                        {filter === 'all'
                            ? 'Create your first task to get started'
                            : `You don't have any ${filter} tasks`
                        }
                    </p>
                    {filter === 'all' && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Add Your First Task
                        </button>
                    )}
                </div>
            )}

            {/* Add Todo Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Task</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="title">Task Title *</label>
                                    <input
                                        id="title"
                                        type="text"
                                        className="input"
                                        placeholder="What needs to be done?"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="input textarea"
                                        placeholder="Add details..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="priority">Priority</label>
                                        <select
                                            id="priority"
                                            className="input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            {priorities.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dueDate">Due Date</label>
                                        <input
                                            id="dueDate"
                                            type="datetime-local"
                                            className="input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={16} />
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
