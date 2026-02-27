// Google Drive Storage Utilities
// Handles file upload/download and data sync with Google Drive

const FOLDER_NAME = 'AnyDo Storage';
const DATA_FILE_NAME = 'anydo_data.json';

let appFolderId: string | null = null;

// Get or create the app folder in Drive
async function getOrCreateAppFolder(accessToken: string) {
    if (appFolderId) return appFolderId;

    // Search for existing folder
    const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
        appFolderId = searchData.files[0].id;
        return appFolderId;
    }

    // Create new folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        }),
    });
    const folder = await createRes.json();
    appFolderId = folder.id;
    return appFolderId;
}

// Upload a file to Google Drive
export async function uploadFileToDrive(accessToken: string, file: File, localId: string) {
    const folderId = await getOrCreateAppFolder(accessToken);

    const metadata = {
        name: `${localId}_${file.name}`,
        parents: [folderId],
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
    });

    return await res.json();
}

// Delete a file from Google Drive
export async function deleteFileFromDrive(accessToken: string, driveFileId: string) {
    await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

// Sync app data (links, todos, chats) to Drive
export async function syncDataToDrive(accessToken: string, data: unknown) {
    const folderId = await getOrCreateAppFolder(accessToken);

    // Check if data file exists
    const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });

    if (searchData.files && searchData.files.length > 0) {
        // Update existing file
        const fileId = searchData.files[0].id;
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: blob,
        });
    } else {
        // Create new file
        const metadata = {
            name: DATA_FILE_NAME,
            parents: [folderId],
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
        });
    }
}

// Load app data from Drive
export async function loadDataFromDrive(accessToken: string) {
    const folderId = await getOrCreateAppFolder(accessToken);

    // Find data file
    const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
        const fileId = searchData.files[0].id;
        const contentRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return await contentRes.json();
    }

    return null;
}

// List all files in app folder
export async function listDriveFiles(accessToken: string) {
    const folderId = await getOrCreateAppFolder(accessToken);

    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,size,createdTime,mimeType)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return await res.json();
}

// Get storage quota info
export async function getDriveQuota(accessToken: string) {
    const res = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Drive API error ${res.status}`);
    }
    
    return await res.json();
}
