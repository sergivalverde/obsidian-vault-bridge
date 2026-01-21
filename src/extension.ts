import * as vscode from 'vscode';
import { ConfigResolver } from './configResolver';
import { NoteCommands } from './noteCommands';
import { VaultTreeProvider } from './vaultTreeProvider';
import { WikilinkProvider } from './wikilinkProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Obsidian Vault Bridge is now active');

    const configResolver = new ConfigResolver();
    const noteCommands = new NoteCommands(configResolver);
    const vaultTreeProvider = new VaultTreeProvider(configResolver);
    const wikilinkProvider = new WikilinkProvider(configResolver);

    // Register tree view
    const treeView = vscode.window.createTreeView('obsidianVaultTreeView', {
        treeDataProvider: vaultTreeProvider,
        showCollapseAll: true
    });

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('obsidianVault.openTodayNote', () => noteCommands.openTodayNote()),
        vscode.commands.registerCommand('obsidianVault.openWeeklyNote', () => noteCommands.openWeeklyNote()),
        vscode.commands.registerCommand('obsidianVault.createNoteFromTemplate', () => noteCommands.createNoteFromTemplate()),
        vscode.commands.registerCommand('obsidianVault.navigateToDate', () => noteCommands.navigateToDate()),
        vscode.commands.registerCommand('obsidianVault.refreshVaultExplorer', () => vaultTreeProvider.refresh()),
        treeView
    );

    // Register wikilink providers
    wikilinkProvider.register(context);

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('obsidianVault')) {
                configResolver.clearCache();
                vaultTreeProvider.refresh();
            }
        })
    );
}

export function deactivate() {}
