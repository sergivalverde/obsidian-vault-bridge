# Obsidian Vault Bridge

A VS Code extension that brings Obsidian vault functionality into Visual Studio Code.

## Features

- **Daily Notes**: Quickly open or create today's daily note with templates
- **Weekly Notes**: Access this week's note with auto-detected format
- **Vault Explorer**: Browse your vault in a dedicated activity bar view
- **Wikilink Support**: Navigate between notes using `[[wikilinks]]` with IntelliSense
- **Templates**: Create notes from templates with variable substitution

## Configuration

The extension reads your Obsidian configuration files (read-only) and falls back to VS Code settings:

- `obsidianVault.vaultPath`: Path to your Obsidian vault
- `obsidianVault.dailyNotesFolder`: Folder for daily notes
- `obsidianVault.weeklyNotesFolder`: Folder for weekly notes
- `obsidianVault.dailyNoteTemplate`: Template for daily notes
- `obsidianVault.weeklyNoteTemplate`: Template for weekly notes

## Usage

Use the Command Palette (`Cmd+Shift+P`):
- `Obsidian: Open Today's Note`
- `Obsidian: Open This Week's Note`
- `Obsidian: Create Note from Template`
- `Obsidian: Navigate to Date`

## 100% Obsidian Compatible

This extension does NOT modify Obsidian configuration files and maintains full compatibility with your Obsidian vault.
