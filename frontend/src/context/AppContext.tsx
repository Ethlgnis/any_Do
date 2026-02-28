/* eslint-disable react-refresh/only-export-components */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    saveLink, getLinks, deleteLink,
    saveChat, getChats, deleteChat,
} from '../utils/storage';
import { syncDataToDrive, loadDataFromDrive } from '../utils/driveStorage';
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
    links: any[];
    chats: any[];
    isSyncing: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleLinkAdd: (link: any) => void;
    handleLinkDelete: (id: string) => void;
    handleChatAdd: (chat: any) => void;
    handleChatDelete: (id: string) => void;
    handleSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { accessToken, driveAccessToken, isAuthenticated, isLoading } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const [links, setLinks] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        // Initial load from local storage
        try {
            setLinks(getLinks() || []);
            setChats(getChats() || []);
        } catch (e) {
            console.error("Initial load error", e);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            setLinks([]);
            setChats([]);
        }
    }, [isAuthenticated, isLoading]);

    const loadFromDrive = useCallback(async () => {
        if (!driveAccessToken) return;

        try {
            const driveData = await loadDataFromDrive(driveAccessToken);
            if (driveData) {
                if (driveData.links) {
                    localStorage.setItem('anydo_links', JSON.stringify(driveData.links));
                    setLinks(driveData.links);
                }
                if (driveData.chats) {
                    localStorage.setItem('anydo_chats', JSON.stringify(driveData.chats));
                    setChats(driveData.chats);
                }
            }
        } catch (error) {
            console.error('Error loading from Drive:', error);
        }
    }, [driveAccessToken]);

    useEffect(() => {
        if (isAuthenticated && driveAccessToken) {
            loadFromDrive();
        }
    }, [isAuthenticated, driveAccessToken, loadFromDrive]);

    useEffect(() => {
        if (!isAuthenticated || !driveAccessToken) return;

        const syncTimeout = setTimeout(() => {
            syncDataToDrive(driveAccessToken, {
                links: getLinks(),
                chats: getChats(),
                lastSync: new Date().toISOString(),
            }).catch(err => console.error('Auto-sync error:', err));
        }, 2000);

        return () => clearTimeout(syncTimeout);
    }, [links, chats, isAuthenticated, driveAccessToken]);

    const handleSync = async () => {
        if (!driveAccessToken || isSyncing) return;

        setIsSyncing(true);
        try {
            await syncDataToDrive(driveAccessToken, {
                links: getLinks(),
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


    const handleLinkAdd = useCallback((link: any) => {
        saveLink(link);
        setLinks(getLinks());
    }, []);

    const handleLinkDelete = useCallback((id: string) => {
        deleteLink(id);
        setLinks(getLinks());
    }, []);


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
            links,
            chats,
            isSyncing,
            searchQuery,
            setSearchQuery,
            handleLinkAdd,
            handleLinkDelete,
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
