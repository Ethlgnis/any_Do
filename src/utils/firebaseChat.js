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
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
export function setUserOnline(user) {
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
export function setUserOffline(chatUserId) {
    if (!chatUserId) return;
    const userRef = ref(database, `presence/${chatUserId}`);
    remove(userRef);
}

/**
 * Subscribe to online users
 */
export function subscribeToOnlineUsers(callback) {
    const presenceRef = ref(database, 'presence');

    return onValue(presenceRef, (snapshot) => {
        const users = [];
        snapshot.forEach((child) => {
            users.push(child.val());
        });
        callback(users);
    });
}

/**
 * Send a message to another user
 */
export function sendMessage(fromUser, toUserId, message) {
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
export function subscribeToMessages(userId1, userId2, callback) {
    const conversationId = [userId1, userId2].sort().join('_');
    const messagesRef = query(
        ref(database, `messages/${conversationId}`),
        orderByChild('timestamp'),
        limitToLast(50)
    );

    return onValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((child) => {
            messages.push({ id: child.key, ...child.val() });
        });
        callback(messages);
    });
}

/**
 * Subscribe to all messages for a user (for notifications)
 */
export function subscribeToAllUserMessages(chatUserId, callback) {
    const messagesRef = ref(database, 'messages');

    return onValue(messagesRef, (snapshot) => {
        const allMessages = [];
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
