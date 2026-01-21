import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface VaultConfig {
    vaultPath: string;
    dailyNotesFolder: string;
    weeklyNotesFolder: string;
    dailyNoteTemplate: string;
    weeklyNoteTemplate: string;
    templatesFolder: string;
    autoCreateYearFolders: boolean;
    weeklyNoteFormat: string;
}

interface ObsidianDailyNotesConfig {
    folder?: string;
    template?: string;
    format?: string;
}

interface ObsidianCalendarConfig {
    weeklyNoteFormat?: string;
    weeklyNoteFolder?: string;
    weeklyNoteTemplate?: string;
}

export class ConfigResolver {
    private configCache: VaultConfig | null = null;

    clearCache(): void {
        this.configCache = null;
    }

    async getConfig(): Promise<VaultConfig> {
        if (this.configCache) {
            return this.configCache;
        }

        const config = vscode.workspace.getConfiguration('obsidianVault');
        const vaultPath = this.resolveVaultPath(config.get<string>('vaultPath', ''));

        // Read Obsidian configs (read-only)
        const obsidianDailyConfig = this.readObsidianDailyNotesConfig(vaultPath);
        const obsidianCalendarConfig = this.readObsidianCalendarConfig(vaultPath);

        // Detect weekly note format from existing files
        const detectedWeeklyFormat = await this.detectWeeklyNoteFormat(vaultPath);

        this.configCache = {
            vaultPath,
            dailyNotesFolder: config.get<string>('dailyNotesFolder') || obsidianDailyConfig?.folder || 'attention',
            weeklyNotesFolder: config.get<string>('weeklyNotesFolder') || obsidianCalendarConfig?.weeklyNoteFolder || '',
            dailyNoteTemplate: config.get<string>('dailyNoteTemplate') || obsidianDailyConfig?.template || '',
            weeklyNoteTemplate: config.get<string>('weeklyNoteTemplate') || obsidianCalendarConfig?.weeklyNoteTemplate || '',
            templatesFolder: config.get<string>('templatesFolder', '_templates'),
            autoCreateYearFolders: config.get<boolean>('autoCreateYearFolders', true),
            weeklyNoteFormat: detectedWeeklyFormat || 'YYYY-[W]WW'
        };

        return this.configCache;
    }

    private resolveVaultPath(configPath: string): string {
        if (configPath) {
            return configPath.replace(/^~/, process.env.HOME || '');
        }

        // Use workspace folder as fallback
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }

        return '';
    }

    private readObsidianDailyNotesConfig(vaultPath: string): ObsidianDailyNotesConfig | null {
        try {
            const configPath = path.join(vaultPath, '.obsidian', 'daily-notes.json');
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf-8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading Obsidian daily notes config:', error);
        }
        return null;
    }

    private readObsidianCalendarConfig(vaultPath: string): ObsidianCalendarConfig | null {
        try {
            const configPath = path.join(vaultPath, '.obsidian', 'plugins', 'calendar', 'data.json');
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf-8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading Obsidian calendar config:', error);
        }
        return null;
    }

    private async detectWeeklyNoteFormat(vaultPath: string): Promise<string | null> {
        try {
            const files = fs.readdirSync(vaultPath);
            const weeklyNotePattern = /^\d{4}-W\d{2}\.md$/i;
            const weeklyNoteBracketPattern = /^\d{4}-\[W\]\d{2}\.md$/i;

            for (const file of files) {
                if (weeklyNotePattern.test(file)) {
                    return 'YYYY-[W]WW';
                }
                if (weeklyNoteBracketPattern.test(file)) {
                    return 'YYYY-[W]WW';
                }
            }

            // Check if using gggg format (ISO week year)
            const isoPattern = /^\d{4}-W\d{2}\.md$/;
            if (files.some(f => isoPattern.test(f))) {
                return 'gggg-[W]ww';
            }
        } catch (error) {
            console.error('Error detecting weekly note format:', error);
        }
        return null;
    }
}
