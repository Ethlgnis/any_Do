// Storage utility for managing all data types
// Uses localStorage for metadata and IndexedDB for file blobs

const STORAGE_KEYS = {
    LINKS: 'anydo_links',
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
        links: getLinks(),
        chats: getChats(),
        exportedAt: new Date().toISOString(),
    };
};

// Import data from backup
export const importData = (data: any) => {
    if (data.links) localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(data.links));
    if (data.chats) localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(data.chats));
};
