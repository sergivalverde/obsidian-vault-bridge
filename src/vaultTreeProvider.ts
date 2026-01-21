import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigResolver } from './configResolver';

export class VaultTreeProvider implements vscode.TreeDataProvider<VaultItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<VaultItem | undefined | null | void> = new vscode.EventEmitter<VaultItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<VaultItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private configResolver: ConfigResolver) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: VaultItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: VaultItem): Promise<VaultItem[]> {
        const config = await this.configResolver.getConfig();

        if (!config.vaultPath || !fs.existsSync(config.vaultPath)) {
            vscode.window.showErrorMessage('Vault path not found. Please configure obsidianVault.vaultPath');
            return [];
        }

        if (!element) {
            // Root level - show main sections
            return this.getRootItems(config.vaultPath);
        } else {
            // Show files/folders within a section
            return this.getItemChildren(element);
        }
    }

    private getRootItems(vaultPath: string): VaultItem[] {
        const items: VaultItem[] = [];

        // Daily Notes section
        const dailyNotesPath = path.join(vaultPath, 'attention');
        if (fs.existsSync(dailyNotesPath)) {
            items.push(new VaultItem(
                'Daily Notes',
                dailyNotesPath,
                vscode.TreeItemCollapsibleState.Collapsed,
                'folder',
                'calendar'
            ));
        }

        // Weekly Notes section (root level)
        items.push(new VaultItem(
            'Weekly Notes',
            vaultPath,
            vscode.TreeItemCollapsibleState.Collapsed,
            'weekly-folder',
            'calendar'
        ));

        // Templates section
        const templatesPath = path.join(vaultPath, '_templates');
        if (fs.existsSync(templatesPath)) {
            items.push(new VaultItem(
                'Templates',
                templatesPath,
                vscode.TreeItemCollapsibleState.Collapsed,
                'folder',
                'file-code'
            ));
        }

        // Other folders
        const entries = fs.readdirSync(vaultPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.') && 
                entry.name !== 'attention' && entry.name !== '_templates') {
                items.push(new VaultItem(
                    entry.name,
                    path.join(vaultPath, entry.name),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'folder',
                    'folder'
                ));
            }
        }

        // Root level markdown files
        const rootFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md'));
        for (const file of rootFiles) {
            items.push(new VaultItem(
                file.name,
                path.join(vaultPath, file.name),
                vscode.TreeItemCollapsibleState.None,
                'file',
                'markdown'
            ));
        }

        return items;
    }

    private getItemChildren(item: VaultItem): VaultItem[] {
        const items: VaultItem[] = [];

        if (item.type === 'weekly-folder') {
            // Show only weekly notes (YYYY-Wxx.md pattern)
            const entries = fs.readdirSync(item.resourcePath, { withFileTypes: true });
            const weeklyPattern = /^\d{4}-(?:\[?W\]?)\d{2}\.md$/i;
            
            for (const entry of entries) {
                if (entry.isFile() && weeklyPattern.test(entry.name)) {
                    items.push(new VaultItem(
                        entry.name,
                        path.join(item.resourcePath, entry.name),
                        vscode.TreeItemCollapsibleState.None,
                        'file',
                        'markdown'
                    ));
                }
            }

            return items.sort((a, b) => b.label!.toString().localeCompare(a.label!.toString()));
        }

        if (!fs.existsSync(item.resourcePath)) {
            return [];
        }

        const entries = fs.readdirSync(item.resourcePath, { withFileTypes: true });

        // Folders first
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                items.push(new VaultItem(
                    entry.name,
                    path.join(item.resourcePath, entry.name),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'folder',
                    'folder'
                ));
            }
        }

        // Then files
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.md')) {
                items.push(new VaultItem(
                    entry.name,
                    path.join(item.resourcePath, entry.name),
                    vscode.TreeItemCollapsibleState.None,
                    'file',
                    'markdown'
                ));
            }
        }

        return items;
    }
}

class VaultItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly resourcePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'file' | 'folder' | 'weekly-folder',
        iconId?: string
    ) {
        super(label, collapsibleState);

        if (type === 'file') {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(resourcePath)]
            };
            this.contextValue = 'vaultFile';
        } else {
            this.contextValue = 'vaultFolder';
        }

        if (iconId) {
            this.iconPath = new vscode.ThemeIcon(iconId);
        }

        this.tooltip = resourcePath;
    }
}
