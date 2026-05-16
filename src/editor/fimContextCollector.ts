import * as vscode from 'vscode';

export interface FIMContext {
    prefix: string;
    suffix: string;
    language: string;
    filePath: string;
}

export class FIMContextCollector {
    constructor(
        private readonly document: vscode.TextDocument,
        private readonly position: vscode.Position
    ) {}

    static createFromEvent(event: vscode.TextDocumentChangeEvent): FIMContextCollector | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return null;
        }
        return new FIMContextCollector(event.document, editor.selection.active);
    }

    collect(options?: { maxContextLines?: number }): FIMContext {
        const maxContextLines = options?.maxContextLines ?? 20;
        const position = this.position;
        const document = this.document;

        const prefixStart = document.positionAt(0);
        const prefixEnd = position;
        let prefix = document.getText(new vscode.Range(prefixStart, prefixEnd));

        const suffixStart = position;
        const suffixEnd = document.positionAt(document.getText().length);
        let suffix = document.getText(new vscode.Range(suffixStart, suffixEnd));

        const suffixLines = suffix.split('\n');
        if (suffixLines.length > maxContextLines) {
            suffix = suffixLines.slice(0, maxContextLines).join('\n');
        }

        const prefixLines = prefix.split('\n');
        if (prefixLines.length > maxContextLines) {
            prefix = prefixLines.slice(-maxContextLines).join('\n');
        }

        return {
            prefix,
            suffix,
            language: document.languageId,
            filePath: document.uri.fsPath,
        };
    }
}
