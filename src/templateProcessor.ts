import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';

export class TemplateProcessor {
    async processTemplate(templatePath: string, context: Record<string, any>): Promise<string> {
        try {
            if (!fs.existsSync(templatePath)) {
                return '';
            }

            let content = fs.readFileSync(templatePath, 'utf-8');

            // Replace core template variables
            content = this.replaceVariables(content, context);

            return content;
        } catch (error) {
            console.error('Error processing template:', error);
            return '';
        }
    }

    private replaceVariables(content: string, context: Record<string, any>): string {
        // {{date}} - Current date in YYYY-MM-DD format
        content = content.replace(/\{\{date\}\}/g, moment().format('YYYY-MM-DD'));

        // {{time}} - Current time in HH:mm format
        content = content.replace(/\{\{time\}\}/g, moment().format('HH:mm'));

        // {{title}} - Note title from context
        if (context.title) {
            content = content.replace(/\{\{title\}\}/g, context.title);
        }

        // {{date:FORMAT}} - Custom date format
        const dateFormatRegex = /\{\{date:([^}]+)\}\}/g;
        content = content.replace(dateFormatRegex, (match, format) => {
            return moment().format(format);
        });

        // Custom context variables
        for (const [key, value] of Object.entries(context)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            content = content.replace(regex, String(value));
        }

        return content;
    }

    findCursorPosition(content: string): number {
        // Look for cursor marker {{cursor}} or place after frontmatter
        const cursorMarker = content.indexOf('{{cursor}}');
        if (cursorMarker !== -1) {
            return cursorMarker;
        }

        // Place cursor after YAML frontmatter
        const frontmatterEnd = this.findFrontmatterEnd(content);
        if (frontmatterEnd !== -1) {
            return frontmatterEnd;
        }

        // Default to start of file
        return 0;
    }

    private findFrontmatterEnd(content: string): number {
        const lines = content.split('\n');
        if (lines[0] === '---') {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                    // Return position after second ---
                    return lines.slice(0, i + 1).join('\n').length + 1;
                }
            }
        }
        return -1;
    }
}
