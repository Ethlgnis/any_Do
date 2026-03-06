"use client";

import dynamic from 'next/dynamic';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const Dashboard = dynamic(
  () => import('../components/sections/Dashboard'),
  { ssr: true }
);

export default function DashboardPage() {
    const { links, chats } = useAppContext();
    const { user } = useAuth();
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
            links={links}
            chats={chats}
            user={user}
            onNavigate={handleNavigate}
        />
    );
}
