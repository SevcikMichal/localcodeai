import * as vscode from 'vscode';
import { OpenAICompatibleClient } from './ai/client';
import { LocalCodeInlineCompletionProvider } from './inlineCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
    const aiClient = new OpenAICompatibleClient({
        baseUrl: 'http://localhost:8033',
        model: 'Qwen3.6-35B-A3B-UD-Q4_K_M.gguf',  // Use model name, NOT .gguf filename
        maxTokens: 256,
        temperature: 0.2,  // Lower temperature for more deterministic completions
    });

    // Register the inline completion provider
    const provider = new LocalCodeInlineCompletionProvider(aiClient, { cooldownMs: 1000 });
    const disposable = vscode.languages.registerInlineCompletionItemProvider(
        [{ pattern: '**' }],  // Register for all file types
        provider
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    // Cleanup handled by VS Code when disposable is disposed
}
