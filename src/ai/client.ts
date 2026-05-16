export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenAICompatibleClientOptions {
    baseUrl: string;      // e.g., 'http://localhost:8080'
    model: string;        // e.g., 'llama3', 'codellama'
    maxTokens?: number;   // default: 1024
    temperature?: number; // default: 0.7
}

export class OpenAICompatibleClient {
    private readonly baseUrl: string;
    private readonly model: string;
    private readonly maxTokens: number;
    private readonly temperature: number;

    constructor(options: OpenAICompatibleClientOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.model = options.model;
        this.maxTokens = options.maxTokens ?? 1024;
        this.temperature = options.temperature ?? 0.7;
    }

    async complete(messages: ChatMessage[]): Promise<{ content: string }> {
        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI-compatible API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return { content: data.choices?.[0]?.message?.content ?? '' };
    }

    async completeStream(
        messages: ChatMessage[],
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI-compatible API error ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body reader');
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                    for (const line of lines) {
                        const data = line.slice(6);
                        if (data === '[DONE]') { onComplete(); return; }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) onChunk(content);
                        } catch { /* skip malformed chunks */ }
                    }
                }
            } finally { reader.releaseLock(); }
        } catch (error) {
            onError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    // FIM (Fill-In-the-Middle) completion for inline code suggestions
    async fimComplete(
        prefix: string,
        suffix: string,
        options: { 
            maxTokens?: number;
            temperature?: number;
            stop?: string[];
            instructions?: string } = {}
    ): Promise<{ content: string }> {
        const requestBody = JSON.stringify({
            model: this.model,
            prompt: `${options.instructions}\n${prefix}`,
            suffix: suffix,
            max_tokens: options.maxTokens ?? 256,
            temperature: options.temperature ?? 0.2,
            stop: options.stop ?? ['\n\n'],
            stream: false,
        });

        const response = await fetch(`${this.baseUrl}/v1/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`FIM API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // llama.cpp / OpenAI-compatible completions response format
        const content = data.choices?.[0]?.text ?? '';

        return { content };
    }
}
