import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigResolver } from './configResolver';

export class WikilinkProvider {
    constructor(private configResolver: ConfigResolver) {}

    register(context: vscode.ExtensionContext): void {
        // Register completion provider for wikilinks
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: 'markdown' },
                new WikilinkCompletionProvider(this.configResolver),
                '[', '['
            )
        );

        // Register definition provider for navigation
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(
                { scheme: 'file', language: 'markdown' },
                new WikilinkDefinitionProvider(this.configResolver)
            )
        );

        // Register document link provider for clickable links
        context.subscriptions.push(
            vscode.languages.registerDocumentLinkProvider(
                { scheme: 'file', language: 'markdown' },
                new WikilinkDocumentLinkProvider(this.configResolver)
            )
        );

        // Register code action provider for creating missing notes
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(
                { scheme: 'file', language: 'markdown' },
                new WikilinkCodeActionProvider(this.configResolver),
                {
                    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
                }
            )
        );
    }
}

class WikilinkCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private configResolver: ConfigResolver) {}

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        // Only provide completions after [[
        if (!linePrefix.endsWith('[[')) {
            return [];
        }

        const config = await this.configResolver.getConfig();
        const notes = await this.getAllNotes(config.vaultPath);

        return notes.map(note => {
            const item = new vscode.CompletionItem(note.name, vscode.CompletionItemKind.File);
            item.insertText = note.name;
            item.detail = note.relativePath;
            item.documentation = `Link to ${note.name}`;
            return item;
        });
    }

    private async getAllNotes(vaultPath: string): Promise<Array<{ name: string; relativePath: string; fullPath: string }>> {
        const notes: Array<{ name: string; relativePath: string; fullPath: string }> = [];

        const scanDirectory = (dir: string, relativeTo: string = vaultPath) => {
            if (!fs.existsSync(dir)) {
                return;
            }

            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(relativeTo, fullPath);

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    scanDirectory(fullPath, relativeTo);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    notes.push({
                        name: entry.name.replace('.md', ''),
                        relativePath,
                        fullPath
                    });
                }
            }
        };

        scanDirectory(vaultPath);
        return notes;
    }
}

class WikilinkDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private configResolver: ConfigResolver) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | undefined> {
        const range = document.getWordRangeAtPosition(position, /\[\[([^\]]+)\]\]/);
        if (!range) {
            return undefined;
        }

        const linkText = document.getText(range);
        const match = linkText.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
        if (!match) {
            return undefined;
        }

        const noteName = match[1];
        const config = await this.configResolver.getConfig();
        const notePath = await this.findNote(config.vaultPath, noteName);

        if (notePath) {
            return new vscode.Location(vscode.Uri.file(notePath), new vscode.Position(0, 0));
        }

        return undefined;
    }

    private async findNote(vaultPath: string, noteName: string): Promise<string | null> {
        const findInDirectory = (dir: string): string | null => {
            if (!fs.existsSync(dir)) {
                return null;
            }

            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isFile() && entry.name === `${noteName}.md`) {
                    return fullPath;
                }

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const found = findInDirectory(fullPath);
                    if (found) {
                        return found;
                    }
                }
            }

            return null;
        };

        return findInDirectory(vaultPath);
    }
}

class WikilinkDocumentLinkProvider implements vscode.DocumentLinkProvider {
    constructor(private configResolver: ConfigResolver) {}

    async provideDocumentLinks(document: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();
        const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

        let match;
        while ((match = wikilinkRegex.exec(text)) !== null) {
            const noteName = match[1];
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            const config = await this.configResolver.getConfig();
            const notePath = await this.findNote(config.vaultPath, noteName);

            if (notePath) {
                const link = new vscode.DocumentLink(range, vscode.Uri.file(notePath));
                link.tooltip = `Open ${noteName}`;
                links.push(link);
            }
        }

        return links;
    }

    private async findNote(vaultPath: string, noteName: string): Promise<string | null> {
        const findInDirectory = (dir: string): string | null => {
            if (!fs.existsSync(dir)) {
                return null;
            }

            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isFile() && entry.name === `${noteName}.md`) {
                    return fullPath;
                }

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const found = findInDirectory(fullPath);
                    if (found) {
                        return found;
                    }
                }
            }

            return null;
        };

        return findInDirectory(vaultPath);
    }
}

class WikilinkCodeActionProvider implements vscode.CodeActionProvider {
    constructor(private configResolver: ConfigResolver) {}

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): Promise<vscode.CodeAction[]> {
        const linkRange = document.getWordRangeAtPosition(range.start, /\[\[([^\]]+)\]\]/);
        if (!linkRange) {
            return [];
        }

        const linkText = document.getText(linkRange);
        const match = linkText.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
        if (!match) {
            return [];
        }

        const noteName = match[1];
        const config = await this.configResolver.getConfig();
        const notePath = path.join(config.vaultPath, `${noteName}.md`);

        // Check if note exists
        if (fs.existsSync(notePath)) {
            return [];
        }

        // Offer to create the note
        const action = new vscode.CodeAction(
            `Create note "${noteName}"`,
            vscode.CodeActionKind.QuickFix
        );

        action.command = {
            command: 'vscode.open',
            title: 'Create Note',
            arguments: [vscode.Uri.file(notePath).with({ scheme: 'untitled' })]
        };

        return [action];
    }
}
