import * as vscode from 'vscode';
import { FIMContext, FIMContextCollector } from './editor/fimContextCollector';
import { OpenAICompatibleClient } from './ai/client';

class RequestQueue {
    private queue: Array<{
        document: vscode.TextDocument;
        position: vscode.Position;
        resolve: (items: vscode.InlineCompletionItem[] | null) => void;
        cancelled: boolean;
    }> = [];
    private processing: boolean = false;

    enqueue(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.InlineCompletionItem[] | null> {
        return new Promise((resolve) => {
            for (const req of this.queue) {
                req.cancelled = true;
            }

            this.queue.push({ document, position, resolve, cancelled: false });

            if (!this.processing) {
                this.processNext();
            }
        });
    }

    private async processNext(): Promise<void> {
        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift()!;

            if (request.cancelled) {
                request.resolve(null);
                continue;
            }

            const collector = new FIMContextCollector(request.document, request.position);
            const fimContext = collector.collect({ maxContextLines: 20 });

            try {
                const response = await this.aiClient.fimComplete(
                    fimContext.prefix,
                    fimContext.suffix,
                    { maxTokens: 256, temperature: 0.6, instructions: "You are providing inline suggestion be concise and precise do not halucinate, do not repeat yourself." }
                );

                if (request.cancelled || !response.content.trim()) {
                    request.resolve(null);
                } else {
                    const completionText = response.content.trim();
                    console.log(completionText);
                    const item = new vscode.InlineCompletionItem(
                        completionText
                    );
                    request.resolve([item]);
                }
            } catch (error) {
                console.error('[InlineProvider] FIM request failed:', error);
                request.resolve(null);
            }
        }

        this.processing = false;
    }

    setAiClient(aiClient: OpenAICompatibleClient): void {
        this.aiClient = aiClient;
    }

    private aiClient!: OpenAICompatibleClient;
}

export class LocalCodeInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private readonly requestQueue = new RequestQueue();
    private lastRequestTime: number = 0;
    private readonly cooldownMs: number;
    private debounceTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(aiClient: OpenAICompatibleClient, options?: { cooldownMs?: number }) {
        this.requestQueue.setAiClient(aiClient);
        this.cooldownMs = options?.cooldownMs ?? 2000;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList | vscode.InlineCompletionItem[] | null> {

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.cooldownMs) {
            console.log(`[InlineProvider] Cooldown active (${this.cooldownMs - timeSinceLastRequest}ms remaining)`);
            return null;
        }

        clearTimeout(this.debounceTimer);
        await new Promise<void>((resolve) => {
            this.debounceTimer = setTimeout(resolve, 500);
        });

        if (token.isCancellationRequested) {
            return null;
        }

        return this.requestQueue.enqueue(document, position);
    }
}
