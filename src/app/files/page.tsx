"use client";

import { useAppContext } from '../../context/AppContext';
import FilesSection from '../../components/sections/FilesSection';

export default function FilesPage() {
    const { files, handleFileUpload, handleFileDelete, handleFileView, searchQuery } = useAppContext();

    return (
        <FilesSection
            files={files}
            onUpload={handleFileUpload}
            onDelete={handleFileDelete}
            onView={handleFileView}
            searchQuery={searchQuery}
        />
    );
}
