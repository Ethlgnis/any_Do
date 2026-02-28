/* eslint-disable react-refresh/only-export-components */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    saveFile, getFilesMetadata, deleteFile, getFileById,
    saveLink, getLinks, deleteLink,
    saveTodo, getTodos, updateTodo, deleteTodo,
    saveChat, getChats, deleteChat,
    updateFileMetadata, getFileMetadataById
} from '../utils/storage';
import { syncDataToDrive, loadDataFromDrive, uploadFileToDrive, deleteFileFromDrive } from '../utils/driveStorage';
import { apiClient } from '../utils/apiClient';

interface AnyDoFile {
    id: string;
    name: string;
    type: string;
    size: number;
    data?: string | ArrayBuffer | null;
    addedAt: string;
    driveFileId?: string | null;
}

interface AppContextType {
    files: AnyDoFile[];
    links: any[];
    todos: any[];
    chats: any[];
    isSyncing: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleFileUpload: (file: File) => Promise<void>;
    handleFileDelete: (id: string) => Promise<void>;
    handleFileView: (file: AnyDoFile) => Promise<void>;
    handleLinkAdd: (link: any) => void;
    handleLinkDelete: (id: string) => void;
    handleTodoAdd: (todo: any) => void;
    handleTodoUpdate: (id: string, updates: any) => void;
    handleTodoDelete: (id: string) => void;
    handleChatAdd: (chat: any) => void;
    handleChatDelete: (id: string) => void;
    handleSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const [files, setFiles] = useState<AnyDoFile[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [todos, setTodos] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        // Initial load from local storage
        try {
            setFiles(getFilesMetadata() || []);
            setLinks(getLinks() || []);
            setTodos(getTodos() || []);
            setChats(getChats() || []);
        } catch (e) {
            console.error("Initial load error", e);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            setFiles([]);
            setLinks([]);
            setTodos([]);
            setChats([]);
        }
    }, [isAuthenticated, isLoading]);

    const loadFromDrive = useCallback(async () => {
        if (!accessToken) return;

        try {
            const driveData = await loadDataFromDrive(accessToken);
            if (driveData) {
                if (driveData.links) {
                    localStorage.setItem('anydo_links', JSON.stringify(driveData.links));
                    setLinks(driveData.links);
                }
                if (driveData.todos) {
                    localStorage.setItem('anydo_todos', JSON.stringify(driveData.todos));
                    setTodos(driveData.todos);
                }
                if (driveData.chats) {
                    localStorage.setItem('anydo_chats', JSON.stringify(driveData.chats));
                    setChats(driveData.chats);
                }
            }
        } catch (error) {
            console.error('Error loading from Drive:', error);
        }
    }, [accessToken]);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            loadFromDrive();
        }
    }, [isAuthenticated, accessToken, loadFromDrive]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const syncTimeout = setTimeout(() => {
            syncDataToDrive(accessToken, {
                links: getLinks(),
                todos: getTodos(),
                chats: getChats(),
                lastSync: new Date().toISOString(),
            }).catch(err => console.error('Auto-sync error:', err));
        }, 2000);

        return () => clearTimeout(syncTimeout);
    }, [links, todos, chats, isAuthenticated, accessToken]);

    const handleSync = async () => {
        if (!accessToken || isSyncing) return;

        setIsSyncing(true);
        try {
            await syncDataToDrive(accessToken, {
                links: getLinks(),
                todos: getTodos(),
                chats: getChats(),
                lastSync: new Date().toISOString(),
            });
            console.log('Data synced to Drive successfully');
        } catch (error) {
            console.error('Error syncing to Drive:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleFileUpload = useCallback(async (file: File) => {
        try {
            const savedFile = await saveFile(file) as AnyDoFile;
            setFiles(getFilesMetadata());

            if (accessToken) {
                try {
                    const driveResult = await uploadFileToDrive(accessToken, file, savedFile.id);
                    if (driveResult?.id) {
                        updateFileMetadata(savedFile.id, { driveFileId: driveResult.id });
                        setFiles(getFilesMetadata());
                    }
                } catch (e) {
                    console.error('Error uploading to Drive:', e);
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }, [accessToken]);

    const handleFileDelete = useCallback(async (id: string) => {
        try {
            const fileMeta = getFileMetadataById(id);
            await deleteFile(id);
            setFiles(getFilesMetadata());

            if (accessToken && fileMeta?.driveFileId) {
                try {
                    await deleteFileFromDrive(accessToken, fileMeta.driveFileId);
                    console.log('File deleted from Drive:', fileMeta.driveFileId);
                } catch (e) {
                    console.error('Error deleting from Drive:', e);
                }
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }, [accessToken]);

    const handleFileView = useCallback(async (file: AnyDoFile) => {
        try {
            const fullFile = await getFileById(file.id) as AnyDoFile;
            if (fullFile?.data) {
                const win = window.open();
                if (win) {
                    if (fullFile.type.startsWith('image/') || fullFile.type === 'application/pdf') {
                        win.document.write(`
              <html>
                <head><title>${fullFile.name}</title></head>
                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0a0a0f;">
                  ${fullFile.type === 'application/pdf'
                                ? `<iframe src="${fullFile.data}" style="width:100%;height:100vh;border:none;"></iframe>`
                                : `<img src="${fullFile.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" />`
                            }
                </body>
              </html>
            `);
                    } else {
                        const link = document.createElement('a');
                        link.href = fullFile.data as string;
                        link.download = fullFile.name;
                        link.click();
                    }
                }
            }
        } catch (error) {
            console.error('Error viewing file:', error);
        }
    }, []);

    const handleLinkAdd = useCallback((link: any) => {
        saveLink(link);
        setLinks(getLinks());
    }, []);

    const handleLinkDelete = useCallback((id: string) => {
        deleteLink(id);
        setLinks(getLinks());
    }, []);

    const handleTodoAdd = useCallback(async (todo: any) => {
        saveTodo(todo);
        setTodos(getTodos());

        if (isAuthenticated && accessToken) {
            try {
                await apiClient.post('/todos', todo, accessToken);
            } catch (error) {
                console.error('Error creating todo on backend:', error);
            }
        }
    }, [isAuthenticated, accessToken]);

    const handleTodoUpdate = useCallback(async (id: string, updates: any) => {
        updateTodo(id, updates);
        setTodos(getTodos());

        if (isAuthenticated && accessToken) {
            try {
                await apiClient.patch(`/todos/${id}`, updates, accessToken);
            } catch (error) {
                console.error('Error updating todo on backend:', error);
            }
        }
    }, [isAuthenticated, accessToken]);

    const handleTodoDelete = useCallback(async (id: string) => {
        deleteTodo(id);
        setTodos(getTodos());

        if (isAuthenticated && accessToken) {
            try {
                await apiClient.del(`/todos/${id}`, accessToken);
            } catch (error) {
                console.error('Error deleting todo on backend:', error);
            }
        }
    }, [isAuthenticated, accessToken]);

    const handleChatAdd = useCallback((chat: any) => {
        saveChat(chat);
        setChats(getChats());
    }, []);

    const handleChatDelete = useCallback((id: string) => {
        deleteChat(id);
        setChats(getChats());
    }, []);

    return (
        <AppContext.Provider value={{
            files,
            links,
            todos,
            chats,
            isSyncing,
            searchQuery,
            setSearchQuery,
            handleFileUpload,
            handleFileDelete,
            handleFileView,
            handleLinkAdd,
            handleLinkDelete,
            handleTodoAdd,
            handleTodoUpdate,
            handleTodoDelete,
            handleChatAdd,
            handleChatDelete,
            handleSync
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
