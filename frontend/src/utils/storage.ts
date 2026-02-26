// Storage utility for managing all data types
// Uses localStorage for metadata and IndexedDB for file blobs

const STORAGE_KEYS = {
    FILES: 'anydo_files',
    LINKS: 'anydo_links',
    TODOS: 'anydo_todos',
    CHATS: 'anydo_chats',
};

// Initialize IndexedDB for file storage
const DB_NAME = 'AnyDoDB';
const DB_VERSION = 1;
const FILE_STORE = 'files';

let db: IDBDatabase | null = null;

const initDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            if (!database.objectStoreNames.contains(FILE_STORE)) {
                database.createObjectStore(FILE_STORE, { keyPath: 'id' });
            }
        };
    });
};

// Helper to generate unique IDs
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to format dates
export const formatDate = (date: any) => {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    } as Intl.DateTimeFormatOptions;
    return d.toLocaleDateString('en-US', options);
};

export const formatDateShort = (date: any) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
};

export const getRelativeTime = (date: any) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDateShort(date);
};

// ============================================
// Files Storage
// ============================================

export const saveFile = async (file: any): Promise<any> => {
    const database = (await initDB()) as IDBDatabase;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const fileData = {
                id: generateId(),
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result,
                addedAt: new Date().toISOString(),
            };

            const transaction = database.transaction([FILE_STORE], 'readwrite');
            const store = transaction.objectStore(FILE_STORE);

            store.add(fileData);

            transaction.oncomplete = () => {
                // Save metadata to localStorage
                const files = getFilesMetadata();
                files.push({
                    id: fileData.id,
                    name: fileData.name,
                    type: fileData.type,
                    size: fileData.size,
                    addedAt: fileData.addedAt,
                    driveFileId: null, // Will be updated after Drive upload
                });
                localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
                resolve(fileData);
            };

            transaction.onerror = () => reject(transaction.error);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

export const getFilesMetadata = () => {
    const data = localStorage.getItem(STORAGE_KEYS.FILES);
    return data ? JSON.parse(data) : [];
};

export const updateFileMetadata = (id: string, updates: any) => {
    const files = getFilesMetadata().map((file: any) =>
        file.id === id ? { ...file, ...updates } : file
    );
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
};

export const getFileMetadataById = (id: string) => {
    return getFilesMetadata().find((file: any) => file.id === id);
};

export const getFileById = async (id: string) => {
    const database = await initDB() as IDBDatabase;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([FILE_STORE], 'readonly');
        const store = transaction.objectStore(FILE_STORE);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteFile = async (id: string): Promise<void> => {
    const database = await initDB() as IDBDatabase;

    return new Promise<void>((resolve, reject) => {
        const transaction = database.transaction([FILE_STORE], 'readwrite');
        const store = transaction.objectStore(FILE_STORE);
        store.delete(id);

        transaction.oncomplete = () => {
            const files = getFilesMetadata().filter((f: any) => f.id !== id);
            localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
            resolve();
        };

        transaction.onerror = () => reject(transaction.error);
    });
};

// ============================================
// Links Storage
// ============================================

export const saveLink = (link: any) => {
    const links = getLinks();
    const newLink = {
        id: generateId(),
        url: link.url,
        title: link.title || '',
        description: link.description || '',
        category: link.category || 'General',
        addedAt: new Date().toISOString(),
    };
    links.push(newLink);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    return newLink;
};

export const getLinks = () => {
    const data = localStorage.getItem(STORAGE_KEYS.LINKS);
    return data ? JSON.parse(data) : [];
};

export const updateLink = (id: string, updates: any) => {
    const links = getLinks().map((link: any) =>
        link.id === id ? { ...link, ...updates } : link
    );
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
};

export const deleteLink = (id: string) => {
    const links = getLinks().filter((link: any) => link.id !== id);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
};

// ============================================
// Todos Storage
// ============================================

export const saveTodo = (todo: any) => {
    const todos = getTodos();
    const newTodo = {
        id: generateId(),
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate || null,
        completed: false,
        addedAt: new Date().toISOString(),
        completedAt: null,
    };
    todos.push(newTodo);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    return newTodo;
};

export const getTodos = () => {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
};

export const updateTodo = (id: string, updates: any) => {
    const todos = getTodos().map((todo: any) => {
        if (todo.id === id) {
            const updatedTodo = { ...todo, ...updates };
            if (updates.completed && !todo.completed) {
                updatedTodo.completedAt = new Date().toISOString();
            }
            return updatedTodo;
        }
        return todo;
    });
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
};

export const deleteTodo = (id: string) => {
    const todos = getTodos().filter((todo: any) => todo.id !== id);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
};

// ============================================
// Chats Storage
// ============================================

export const saveChat = (chat: any) => {
    const chats = getChats();
    const newChat = {
        id: generateId(),
        name: chat.name || 'Imported Chat',
        content: chat.content,
        messageCount: (chat.content.match(/\n/g) || []).length + 1,
        addedAt: new Date().toISOString(),
    };
    chats.push(newChat);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    return newChat;
};

export const getChats = () => {
    const data = localStorage.getItem(STORAGE_KEYS.CHATS);
    return data ? JSON.parse(data) : [];
};

export const getChatById = (id: string) => {
    return getChats().find((chat: any) => chat.id === id);
};

export const deleteChat = (id: string) => {
    const chats = getChats().filter((chat: any) => chat.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};

// ============================================
// Utility Functions
// ============================================

export const getFileIcon = (type: string) => {
    if (!type) return 'file';
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.includes('document') || type.includes('word')) return 'doc';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'spreadsheet';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'archive';
    if (type.includes('text') || type.includes('json') || type.includes('javascript')) return 'code';
    return 'file';
};

export const formatFileSize = (bytes: any) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStorageUsage = () => {
    let total = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key);
        if (item) {
            total += item.length * 2; // UTF-16 characters = 2 bytes each
        }
    }
    return total;
};

// Export all storage for backup
export const exportAllData = () => {
    return {
        files: getFilesMetadata(),
        links: getLinks(),
        todos: getTodos(),
        chats: getChats(),
        exportedAt: new Date().toISOString(),
    };
};

// Import data from backup
export const importData = (data: any) => {
    if (data.links) localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(data.links));
    if (data.todos) localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(data.todos));
    if (data.chats) localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(data.chats));
};
