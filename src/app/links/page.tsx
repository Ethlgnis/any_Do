"use client";

import { useAppContext } from '../../context/AppContext';
import LinksSection from '../../sections/LinksSection';

export default function LinksPage() {
    const { links, handleLinkAdd, handleLinkDelete, searchQuery } = useAppContext();

    return (
        <LinksSection
            links={links}
            onAdd={handleLinkAdd}
            onDelete={handleLinkDelete}
            searchQuery={searchQuery}
        />
    );
}
