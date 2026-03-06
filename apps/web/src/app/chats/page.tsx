"use client";

import { useAppContext } from '../../context/AppContext';
import FriendListSection from '../../components/sections/FriendListSection';

export default function ChatsPage() {
    const { chats, handleChatAdd, handleChatDelete, searchQuery } = useAppContext();

    return (
        <FriendListSection
            chats={chats}
            onAdd={handleChatAdd}
            onDelete={handleChatDelete}
            searchQuery={searchQuery}
        />
    );
}
