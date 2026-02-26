"use client";

import { useAppContext } from '../../context/AppContext';
import ChatsSection from '../../sections/ChatsSection';

export default function ChatsPage() {
    const { chats, handleChatAdd, handleChatDelete, searchQuery } = useAppContext();

    return (
        <ChatsSection
            chats={chats}
            onAdd={handleChatAdd}
            onDelete={handleChatDelete}
            searchQuery={searchQuery}
        />
    );
}
