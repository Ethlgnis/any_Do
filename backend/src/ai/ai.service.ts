import { Injectable } from '@nestjs/common';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

@Injectable()
export class AiService {
  private getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    return key;
  }

  private async callGemini(
    prompt: string,
    systemInstruction = '',
  ): Promise<string> {
    const apiKey = this.getApiKey();
    const text = systemInstruction
      ? `${systemInstruction}\n\nUser: ${prompt}`
      : prompt;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI request failed');
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
    );
  }

  async chat(message: string, context: Record<string, unknown> = {}): Promise<string> {
    const ctx = context as {
      files?: unknown[];
      links?: unknown[];
      todos?: { completed?: boolean; title?: string }[];
      chats?: unknown[];
    };
    const systemPrompt = `You are Kiro, a friendly AI assistant for AnyDo, a personal productivity app. 
You help users manage their files, links, todos, and chats.
Be helpful, concise, and friendly. Use emojis occasionally.
Answer questions based on the user's data context provided.

User's current data:
- Files: ${ctx.files?.length ?? 0} files stored
- Links: ${ctx.links?.length ?? 0} bookmarks saved
- Todos: ${ctx.todos?.length ?? 0} tasks (${ctx.todos?.filter((t) => t.completed)?.length ?? 0} completed)
- Chats: ${ctx.chats?.length ?? 0} imported chats

${ctx.files?.length ? 'Files: ' + (ctx.files as { name?: string }[]).map((f) => f.name).join(', ') : ''}
${ctx.links?.length ? 'Links: ' + (ctx.links as { title?: string; url?: string }[]).map((l) => l.title || l.url).join(', ') : ''}
${ctx.todos?.length ? 'Todos: ' + ctx.todos.map((t) => `${t.completed ? '✓' : '○'} ${t.title}`).join(', ') : ''}`;

    return this.callGemini(message, systemPrompt);
  }

  async search(
    query: string,
    data: Record<string, unknown> = {},
  ): Promise<{ type: string; name: string; reason: string }[]> {
    const d = data as {
      files?: { name?: string; type?: string; size?: number }[];
      links?: { title?: string; url?: string }[];
      todos?: { completed?: boolean; title?: string; description?: string }[];
      chats?: { name?: string; messageCount?: number }[];
    };
    const prompt = `Search query: "${query}"

Available data to search:
FILES:
${d.files?.map((f) => `- ${f.name} (${f.type}, ${f.size} bytes)`).join('\n') ?? 'No files'}

LINKS:
${d.links?.map((l) => `- ${l.title ?? 'Untitled'}: ${l.url}`).join('\n') ?? 'No links'}

TODOS:
${d.todos?.map((t) => `- [${t.completed ? 'x' : ' '}] ${t.title}${t.description ? ': ' + t.description : ''}`).join('\n') ?? 'No todos'}

CHATS:
${d.chats?.map((c) => `- ${c.name} (${c.messageCount} messages)`).join('\n') ?? 'No chats'}

Based on the search query, find and return the most relevant items. 
Format as a JSON array with objects having: { type: "file"|"link"|"todo"|"chat", name: string, reason: string }
Return only the JSON array, no other text.`;

    const response = await this.callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as { type: string; name: string; reason: string }[];
    }
    return [];
  }

  async summarize(
    content: string,
    type: 'chat' | 'file' | 'todos' = 'chat',
  ): Promise<string> {
    const prompts: Record<string, string> = {
      chat: `Summarize this chat conversation in 2-3 sentences. Highlight key topics and any action items:\n\n${content}`,
      file: `Summarize this file content briefly:\n\n${content}`,
      todos: `Give a quick status overview of these todos:\n\n${content}`,
    };
    return this.callGemini(prompts[type] ?? prompts.chat);
  }

  async suggestions(context: Record<string, unknown> = {}): Promise<string[]> {
    const ctx = context as {
      todos?: { completed?: boolean; title?: string }[];
      links?: { title?: string; url?: string }[];
      files?: { name?: string }[];
    };
    const prompt = `Based on the user's current data, suggest 3-5 actionable tasks they might want to add.

Current todos:
${ctx.todos?.map((t) => `- [${t.completed ? 'x' : ' '}] ${t.title}`).join('\n') ?? 'No current todos'}

Links they've saved:
${ctx.links?.slice(0, 10).map((l) => `- ${l.title || l.url}`).join('\n') ?? 'No links'}

Files they have:
${ctx.files?.slice(0, 10).map((f) => f.name).join(', ') ?? 'No files'}

Suggest practical, specific tasks. Return as a JSON array of strings.
Return only the JSON array, no other text.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as string[];
      }
    } catch {
      // fallback
    }
    return [
      'Organize your files into folders',
      'Review pending tasks',
      'Clean up old bookmarks',
    ];
  }

  async quickAction(
    action: string,
    data: Record<string, unknown> = {},
  ): Promise<string> {
    const d = data as {
      todos?: { completed?: boolean; title?: string }[];
      content?: string;
    };
    switch (action) {
      case 'summarize_todos': {
        const todoText = d.todos
          ?.map((t) => `${t.completed ? '✓' : '○'} ${t.title}`)
          .join('\n');
        return this.summarize(todoText ?? '', 'todos');
      }
      case 'summarize_chat':
        return this.summarize(d.content ?? '', 'chat');
      case 'suggest_tasks':
        return JSON.stringify(await this.suggestions(data));
      default:
        return 'Unknown action';
    }
  }
}
