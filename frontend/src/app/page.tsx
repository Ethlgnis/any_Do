"use client";

import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import Dashboard from '../components/sections/Dashboard';

export default function DashboardPage() {
    const { files, links, todos, chats } = useAppContext();
    const router = useRouter();

    const handleNavigate = (sectionId: string) => {
        if (sectionId === 'dashboard') {
            router.push('/');
        } else {
            router.push(`/${sectionId}`);
        }
    };

    return (
        <Dashboard
            files={files}
            links={links}
            todos={todos}
            chats={chats}
            onNavigate={handleNavigate}
        />
    );
}
