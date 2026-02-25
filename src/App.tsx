import { useState, useEffect, useCallback } from 'react';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// Theme
import { ThemeProvider } from './context/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import LiveChat from './components/LiveChat';
import AIAssistant from './components/AIAssistant';

// Sections
import Dashboard from './sections/Dashboard';
import FilesSection from './sections/FilesSection';
import LinksSection from './sections/LinksSection';
import TodoSection from './sections/TodoSection';
import ChatsSection from './sections/ChatsSection';
import SubscriptionSection from './sections/SubscriptionSection';

// Storage utilities
import {
    saveFile, getFilesMetadata, deleteFile, getFileById,
    saveLink, getLinks, deleteLink,
    saveTodo, getTodos, updateTodo, deleteTodo,
    saveChat, getChats, deleteChat,
    updateFileMetadata, getFileMetadataById
} from './utils/storage';

// Drive storage
import { syncDataToDrive, loadDataFromDrive, uploadFileToDrive, deleteFileFromDrive } from './utils/driveStorage';

function AppContent() {
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    const [showApp, setShowApp] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    interface AnyDoFile {
    id: string;
    name: string;
    type: string;
    size: number;
    data?: string | ArrayBuffer | null;
    addedAt: string;
    driveFileId?: string | null;
}

// Data states
    const [files, setFiles] = useState<AnyDoFile[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [todos, setTodos] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);

    // Handle skip login event - skip login is disabled now (require login)
    useEffect(() => {
        const handleSkipLogin = () => setShowApp(true);
        window.addEventListener('skipLogin', handleSkipLogin);
        return () => window.removeEventListener('skipLogin', handleSkipLogin);
    }, []);

    // Show app when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setShowApp(true);
        }
    }, [isAuthenticated]);

    // Clear data and redirect to login when user logs out
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            // Clear all data when not authenticated
            setFiles([]);
            setLinks([]);
            setTodos([]);
            setChats([]);
            // Redirect to login page
            setShowApp(false);
        }
    }, [isAuthenticated, isLoading]);

    // Load data from Google Drive
    const loadFromDrive = useCallback(async () => {
        if (!accessToken) return;

        try {
            const driveData = await loadDataFromDrive(accessToken);
            if (driveData) {
                // Merge with local data (Drive takes precedence for conflicts)
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

    // Load data from Drive ONLY when authenticated
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            loadFromDrive();
        }
    }, [isAuthenticated, accessToken, loadFromDrive]);

    // Auto-sync to Drive when data changes (debounced)
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

    // Sync data to Google Drive
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

    // File handlers
    const handleFileUpload = useCallback(async (file: File) => {
        try {
            const savedFile = await saveFile(file) as AnyDoFile;
            setFiles(getFilesMetadata());

            // Also upload to Drive if authenticated
            if (accessToken) {
                try {
                    const driveResult = await uploadFileToDrive(accessToken, file, savedFile.id);
                    // Save the Drive file ID for later deletion
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
            // Get file metadata to check for Drive ID
            const fileMeta = getFileMetadataById(id);

            // Delete from local storage
            await deleteFile(id);
            setFiles(getFilesMetadata());

            // Also delete from Drive if authenticated and has Drive ID
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

    // Link handlers
    const handleLinkAdd = useCallback((link: any) => {
        saveLink(link);
        setLinks(getLinks());
    }, []);

    const handleLinkDelete = useCallback((id: string) => {
        deleteLink(id);
        setLinks(getLinks());
    }, []);

    // Todo handlers
    const handleTodoAdd = useCallback((todo: any) => {
        saveTodo(todo);
        setTodos(getTodos());
    }, []);

    const handleTodoUpdate = useCallback((id: string, updates: any) => {
        updateTodo(id, updates);
        setTodos(getTodos());
    }, []);

    const handleTodoDelete = useCallback((id: string) => {
        deleteTodo(id);
        setTodos(getTodos());
    }, []);

    // Chat handlers
    const handleChatAdd = useCallback((chat: any) => {
        saveChat(chat);
        setChats(getChats());
    }, []);

    const handleChatDelete = useCallback((id: string) => {
        deleteChat(id);
        setChats(getChats());
    }, []);

    // Navigation handler for add button
    const handleAddClick = () => {
        if (activeSection === 'dashboard') {
            setActiveSection('files');
        }
    };

    // Show login screen if not authenticated and not skipped
    if (!showApp && !isLoading) {
        return <LoginScreen />;
    }

    // Render current section
    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <Dashboard
                        files={files}
                        links={links}
                        todos={todos}
                        chats={chats}
                        onNavigate={setActiveSection}
                    />
                );
            case 'files':
                return (
                    <FilesSection
                        files={files}
                        onUpload={handleFileUpload}
                        onDelete={handleFileDelete}
                        onView={handleFileView}
                        searchQuery={searchQuery}
                    />
                );
            case 'links':
                return (
                    <LinksSection
                        links={links}
                        onAdd={handleLinkAdd}
                        onDelete={handleLinkDelete}
                        searchQuery={searchQuery}
                    />
                );
            case 'todos':
                return (
                    <TodoSection
                        todos={todos}
                        onAdd={handleTodoAdd}
                        onUpdate={handleTodoUpdate}
                        onDelete={handleTodoDelete}
                        searchQuery={searchQuery}
                    />
                );
            case 'chats':
                return (
                    <ChatsSection
                        chats={chats}
                        onAdd={handleChatAdd}
                        onDelete={handleChatDelete}
                        searchQuery={searchQuery}
                    />
                );
            case 'subscription':
                return <SubscriptionSection />;
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            <Navbar
                onSearch={setSearchQuery}
                onAddClick={handleAddClick}
                onMenuChange={setActiveSection}
                onMenuClick={() => setShowMobileMenu(!showMobileMenu)}
                showMobileMenu={showMobileMenu}
                onSync={handleSync}
                isSyncing={isSyncing}
            />

            <main className="main-content">
                {renderSection()}
            </main>

            {/* Live Chat Widget */}
            <LiveChat />

            {/* AI Assistant Widget */}
            <AIAssistant
                files={files}
                links={links}
                todos={todos}
                chats={chats}
                onAddTodo={handleTodoAdd}
            />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
