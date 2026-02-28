// AI Service - all requests go through backend (no API keys in frontend)
import { apiClient } from './apiClient';

export type AiChatContext = {
  files?: unknown[];
  links?: unknown[];
  todos?: { completed?: boolean; title?: string }[];
  chats?: unknown[];
};

export type AiSearchResult = { type: string; name: string; reason: string }[];

/**
 * AI Chat - answer questions about user's data (via backend)
 */
export async function aiChat(
  message: string,
  context: AiChatContext = {},
  accessToken: string | null,
): Promise<string> {
  const result = await apiClient.post<{ text?: string }>(
    '/ai/chat',
    { message, context },
    accessToken,
  );
  return typeof result === 'string' ? result : (result?.text ?? '');
}

/**
 * AI Smart Search - natural language search across data (via backend)
 */
export async function aiSearch(
  query: string,
  data: Record<string, unknown> = {},
  accessToken: string | null,
): Promise<AiSearchResult> {
  try {
    const result = await apiClient.post<AiSearchResult>(
      '/ai/search',
      { query, data },
      accessToken,
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('AI Search error:', error);
    return [];
  }
}

/**
 * AI Summarization (via backend)
 */
export async function aiSummarize(
  content: string,
  type: 'chat' | 'file' | 'todos' = 'chat',
  accessToken: string | null,
): Promise<string> {
  const result = await apiClient.post<string | { text?: string }>(
    '/ai/summarize',
    { content, type },
    accessToken,
  );
  return typeof result === 'string' ? result : (result?.text ?? '');
}

/**
 * AI Suggestions (via backend)
 */
export async function aiSuggestions(
  context: Record<string, unknown> = {},
  accessToken: string | null,
): Promise<string[]> {
  try {
    const result = await apiClient.post<string[]>(
      '/ai/suggestions',
      { context },
      accessToken,
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('AI Suggestions error:', error);
    return [
      'Organize your files into folders',
      'Review pending tasks',
      'Clean up old bookmarks',
    ];
  }
}

/**
 * Quick AI actions (via backend)
 */
export async function aiQuickAction(
  action: string,
  data: Record<string, unknown>,
  accessToken: string | null,
): Promise<string> {
  const result = await apiClient.post<string | { text?: string }>(
    '/ai/quick-action',
    { action, data },
    accessToken,
  );
  return typeof result === 'string' ? result : (result?.text ?? 'Unknown action');
}
