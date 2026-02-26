// Firebase Live Chat Utility
import { initializeApp } from 'firebase/app';
import {
    getDatabase,
    ref,
    push,
    onValue,
    set,
    remove,
    onDisconnect,
    query,
    orderByChild,
    limitToLast
} from 'firebase/database';

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase conditionally to prevent crash on empty/placeholder config
let app = null;
let database = null;

// FORCE DISABLE FIREBASE - User requested to stop firebase
const DISABLE_FIREBASE = true;

try {
    const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_firebase_api_key');
    if (!DISABLE_FIREBASE && !isPlaceholder && firebaseConfig.databaseURL && firebaseConfig.databaseURL.startsWith('http')) {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
    } else {
        console.warn('Firebase activity stopped as per user request or invalid config.');
    }
} catch (error) {
    console.error('Failed to initialize Firebase:', error);
}

/**
 * Generate a short user ID from Google ID
 */
export function generateChatUserId(googleId) {
    // Create a short hash from the Google ID
    const hash = googleId.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return 'user_' + Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Set user online presence
 */
export function setUserOnline(user: any) {
    if (!database) return null;
    if (!user?.id) return;

    const chatUserId = generateChatUserId(user.id);
    const userRef = ref(database, `presence/${chatUserId}`);

    // Set user data
    set(userRef, {
        id: chatUserId,
        name: user.name,
        email: user.email,
        picture: user.picture,
        lastSeen: Date.now(),
        online: true
    });

    // Remove on disconnect
    onDisconnect(userRef).remove();

    return chatUserId;
}

/**
 * Set user offline
 */
export function setUserOffline(chatUserId: any) {
    if (!database) return;
    if (!chatUserId) return;
    const userRef = ref(database, `presence/${chatUserId}`);
    remove(userRef);
}

/**
 * Subscribe to online users
 */
export function subscribeToOnlineUsers(callback: any) {
    if (!database) {
        callback([]);
        return () => {};
    }
    const presenceRef = ref(database, 'presence');

    return onValue(presenceRef, (snapshot) => {
        const users: any[] = [];
        snapshot.forEach((child) => {
            users.push(child.val());
        });
        callback(users);
    });
}

/**
 * Send a message to another user
 */
export function sendMessage(fromUser: any, toUserId: any, message: any) {
    if (!database) return null;
    if (!fromUser || !toUserId || !message.trim()) return;

    const fromUserId = generateChatUserId(fromUser.id);

    // Create conversation ID (sorted to ensure same ID for both users)
    const conversationId = [fromUserId, toUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${conversationId}`);

    return push(messagesRef, {
        senderId: fromUserId,
        senderName: fromUser.name,
        senderPicture: fromUser.picture,
        receiverId: toUserId,
        text: message.trim(),
        timestamp: Date.now()
    });
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(userId1: any, userId2: any, callback: any) {
    if (!database) {
        callback([]);
        return () => {};
    }
    const conversationId = [userId1, userId2].sort().join('_');
    const messagesRef = query(
        ref(database, `messages/${conversationId}`),
        orderByChild('timestamp'),
        limitToLast(50)
    );

    return onValue(messagesRef, (snapshot) => {
        const messages: any[] = [];
        snapshot.forEach((child) => {
            messages.push({ id: child.key, ...child.val() });
        });
        callback(messages);
    });
}

/**
 * Subscribe to all messages for a user (for notifications)
 */
export function subscribeToAllUserMessages(chatUserId: any, callback: any) {
    if (!database) {
        callback([]);
        return () => {};
    }
    const messagesRef = ref(database, 'messages');

    return onValue(messagesRef, (snapshot) => {
        const allMessages: any[] = [];
        snapshot.forEach((conversation) => {
            const convId = conversation.key;
            if (convId.includes(chatUserId)) {
                conversation.forEach((msg) => {
                    allMessages.push({
                        id: msg.key,
                        conversationId: convId,
                        ...msg.val()
                    });
                });
            }
        });
        // Sort by timestamp
        allMessages.sort((a, b) => a.timestamp - b.timestamp);
        callback(allMessages);
    });
}
