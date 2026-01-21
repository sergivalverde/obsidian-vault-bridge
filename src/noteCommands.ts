import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import { ConfigResolver } from './configResolver';
import { TemplateProcessor } from './templateProcessor';

export class NoteCommands {
    private templateProcessor: TemplateProcessor;

    constructor(private configResolver: ConfigResolver) {
        this.templateProcessor = new TemplateProcessor();
    }

    async openTodayNote(): Promise<void> {
        const config = await this.configResolver.getConfig();
        const today = moment();
        const fileName = today.format('YYYY-MM-DD') + '.md';

        let notePath: string;
        if (config.autoCreateYearFolders) {
            const yearFolder = path.join(config.vaultPath, config.dailyNotesFolder, today.format('YYYY'));
            notePath = path.join(yearFolder, fileName);

            // Create year folder if needed
            if (!fs.existsSync(yearFolder)) {
                fs.mkdirSync(yearFolder, { recursive: true });
            }
        } else {
            notePath = path.join(config.vaultPath, config.dailyNotesFolder, fileName);
        }

        await this.ensureDirectoryExists(path.dirname(notePath));
        await this.createOrOpenNote(notePath, config.dailyNoteTemplate, { title: fileName.replace('.md', '') });
    }

    async openWeeklyNote(): Promise<void> {
        const config = await this.configResolver.getConfig();
        const today = moment();
        const fileName = today.format(config.weeklyNoteFormat) + '.md';

        const notePath = path.join(config.vaultPath, config.weeklyNotesFolder, fileName);

        await this.ensureDirectoryExists(path.dirname(notePath));
        await this.createOrOpenNote(notePath, config.weeklyNoteTemplate, { title: fileName.replace('.md', '') });
    }

    async createNoteFromTemplate(): Promise<void> {
        const config = await this.configResolver.getConfig();
        const templatesPath = path.join(config.vaultPath, config.templatesFolder);

        if (!fs.existsSync(templatesPath)) {
            vscode.window.showErrorMessage(`Templates folder not found: ${config.templatesFolder}`);
            return;
        }

        // List available templates
        const templates = fs.readdirSync(templatesPath)
            .filter(f => f.endsWith('.md'))
            .map(f => ({ label: f.replace('.md', ''), path: path.join(templatesPath, f) }));

        if (templates.length === 0) {
            vscode.window.showErrorMessage('No templates found in templates folder');
            return;
        }

        const selected = await vscode.window.showQuickPick(templates, {
            placeHolder: 'Select a template'
        });

        if (!selected) {
            return;
        }

        // Ask for note name
        const noteName = await vscode.window.showInputBox({
            prompt: 'Enter note name',
            placeHolder: 'my-note'
        });

        if (!noteName) {
            return;
        }

        const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
        const notePath = path.join(config.vaultPath, fileName);

        await this.createOrOpenNote(notePath, selected.path, { title: noteName });
    }

    async navigateToDate(): Promise<void> {
        const config = await this.configResolver.getConfig();

        // Ask user to choose daily or weekly note
        const noteType = await vscode.window.showQuickPick(['Daily Note', 'Weekly Note'], {
            placeHolder: 'Select note type'
        });

        if (!noteType) {
            return;
        }

        // Ask for date
        const dateStr = await vscode.window.showInputBox({
            prompt: 'Enter date (YYYY-MM-DD)',
            placeHolder: moment().format('YYYY-MM-DD'),
            value: moment().format('YYYY-MM-DD')
        });

        if (!dateStr) {
            return;
        }

        const date = moment(dateStr, 'YYYY-MM-DD');
        if (!date.isValid()) {
            vscode.window.showErrorMessage('Invalid date format. Use YYYY-MM-DD');
            return;
        }

        if (noteType === 'Daily Note') {
            const fileName = date.format('YYYY-MM-DD') + '.md';
            let notePath: string;

            if (config.autoCreateYearFolders) {
                const yearFolder = path.join(config.vaultPath, config.dailyNotesFolder, date.format('YYYY'));
                notePath = path.join(yearFolder, fileName);
                if (!fs.existsSync(yearFolder)) {
                    fs.mkdirSync(yearFolder, { recursive: true });
                }
            } else {
                notePath = path.join(config.vaultPath, config.dailyNotesFolder, fileName);
            }

            await this.ensureDirectoryExists(path.dirname(notePath));
            await this.createOrOpenNote(notePath, config.dailyNoteTemplate, { title: fileName.replace('.md', '') });
        } else {
            const fileName = date.format(config.weeklyNoteFormat) + '.md';
            const notePath = path.join(config.vaultPath, config.weeklyNotesFolder, fileName);

            await this.ensureDirectoryExists(path.dirname(notePath));
            await this.createOrOpenNote(notePath, config.weeklyNoteTemplate, { title: fileName.replace('.md', '') });
        }
    }

    private async createOrOpenNote(notePath: string, templatePath: string, context: Record<string, any>): Promise<void> {
        const config = await this.configResolver.getConfig();

        // Create note from template if it doesn't exist
        if (!fs.existsSync(notePath)) {
            const fullTemplatePath = templatePath ? path.join(config.vaultPath, templatePath) : '';
            const content = fullTemplatePath && fs.existsSync(fullTemplatePath)
                ? await this.templateProcessor.processTemplate(fullTemplatePath, context)
                : `# ${context.title}\n\n`;

            fs.writeFileSync(notePath, content, 'utf-8');
        }

        // Open the note
        const doc = await vscode.workspace.openTextDocument(notePath);
        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor intelligently
        if (editor.document.getText().length > 0) {
            const cursorPos = this.templateProcessor.findCursorPosition(editor.document.getText());
            const position = editor.document.positionAt(cursorPos);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}
