// Google Gemini AI Service
// Provides AI chat, summarization, suggestions, and smart search

const GEMINI_API_KEY = 'AIzaSyAqdh0UECJ4wDf8-N99lz6uLuZdVNK_faY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Send a message to Gemini AI
 */
async function callGemini(prompt, systemInstruction = '') {
    try {
        const requestBody = {
            contents: [{
                parts: [{ text: systemInstruction ? `${systemInstruction}\n\nUser: ${prompt}` : prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API Error:', error);
            throw new Error(error.error?.message || 'AI request failed');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } catch (error) {
        console.error('Gemini call failed:', error);
        throw error;
    }
}

/**
 * AI Chat Assistant - Answer questions about user's data
 */
export async function aiChat(message, context = {}) {
    const systemPrompt = `You are Kiro, a friendly AI assistant for AnyDo, a personal productivity app. 
You help users manage their files, links, todos, and chats.
Be helpful, concise, and friendly. Use emojis occasionally.
Answer questions based on the user's data context provided.

User's current data:
- Files: ${context.files?.length || 0} files stored
- Links: ${context.links?.length || 0} bookmarks saved
- Todos: ${context.todos?.length || 0} tasks (${context.todos?.filter(t => t.completed)?.length || 0} completed)
- Chats: ${context.chats?.length || 0} imported chats

${context.files?.length ? 'Files: ' + context.files.map(f => f.name).join(', ') : ''}
${context.links?.length ? 'Links: ' + context.links.map(l => l.title || l.url).join(', ') : ''}
${context.todos?.length ? 'Todos: ' + context.todos.map(t => `${t.completed ? '✓' : '○'} ${t.title}`).join(', ') : ''}`;

    return callGemini(message, systemPrompt);
}

/**
 * AI Smart Search - Natural language search across data
 */
export async function aiSearch(query, data = {}) {
    const prompt = `Search query: "${query}"

Available data to search:
FILES:
${data.files?.map(f => `- ${f.name} (${f.type}, ${f.size} bytes)`).join('\n') || 'No files'}

LINKS:
${data.links?.map(l => `- ${l.title || 'Untitled'}: ${l.url}`).join('\n') || 'No links'}

TODOS:
${data.todos?.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title}${t.description ? ': ' + t.description : ''}`).join('\n') || 'No todos'}

CHATS:
${data.chats?.map(c => `- ${c.name} (${c.messageCount} messages)`).join('\n') || 'No chats'}

Based on the search query, find and return the most relevant items. 
Format as a JSON array with objects having: { type: "file"|"link"|"todo"|"chat", name: string, reason: string }
Return only the JSON array, no other text.`;

    try {
        const response = await callGemini(prompt);
        // Try to parse JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('AI Search error:', error);
        return [];
    }
}

/**
 * AI Summarization - Summarize chats or text content
 */
export async function aiSummarize(content, type = 'chat') {
    const prompts = {
        chat: `Summarize this chat conversation in 2-3 sentences. Highlight key topics and any action items:

${content}`,
        file: `Summarize this file content briefly:

${content}`,
        todos: `Give a quick status overview of these todos:

${content}`
    };

    return callGemini(prompts[type] || prompts.chat);
}

/**
 * AI Suggestions - Smart todo/task suggestions
 */
export async function aiSuggestions(context = {}) {
    const prompt = `Based on the user's current data, suggest 3-5 actionable tasks they might want to add.

Current todos:
${context.todos?.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title}`).join('\n') || 'No current todos'}

Links they've saved:
${context.links?.slice(0, 10).map(l => `- ${l.title || l.url}`).join('\n') || 'No links'}

Files they have:
${context.files?.slice(0, 10).map(f => f.name).join(', ') || 'No files'}

Suggest practical, specific tasks. Return as a JSON array of strings.
Return only the JSON array, no other text.`;

    try {
        const response = await callGemini(prompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return ['Organize your files into folders', 'Review pending tasks', 'Clean up old bookmarks'];
    } catch (error) {
        console.error('AI Suggestions error:', error);
        return ['Organize your files into folders', 'Review pending tasks', 'Clean up old bookmarks'];
    }
}

/**
 * Quick AI actions
 */
export async function aiQuickAction(action, data) {
    switch (action) {
        case 'summarize_todos':
            const todoText = data.todos?.map(t => `${t.completed ? '✓' : '○'} ${t.title}`).join('\n');
            return aiSummarize(todoText, 'todos');

        case 'summarize_chat':
            return aiSummarize(data.content, 'chat');

        case 'suggest_tasks':
            return aiSuggestions(data);

        default:
            return 'Unknown action';
    }
}
