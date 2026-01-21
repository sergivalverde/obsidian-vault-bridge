# Obsidian Vault Bridge

A VS Code extension that brings Obsidian vault functionality into Visual Studio Code.

## Features

- **Daily Notes**: Quickly open or create today's daily note with templates
- **Weekly Notes**: Access this week's note with auto-detected format
- **Vault Explorer**: Browse your vault in a dedicated activity bar view
- **Wikilink Support**: Navigate between notes using `[[wikilinks]]` with IntelliSense
- **Templates**: Create notes from templates with variable substitution

## Installation

### Option 1: Install from .vsix (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/sergivalverde/obsidian-vault-bridge/releases)
2. In VS Code: `Cmd+Shift+P` → "**Extensions: Install from VSIX**"
3. Select the downloaded `.vsix` file

### Option 2: Build from Source

```bash
git clone https://github.com/sergivalverde/obsidian-vault-bridge.git
cd obsidian-vault-bridge
npm install
npm run compile
```

Then press F5 in VS Code to run in development mode, or:

```bash
npm install -g @vscode/vsce
vsce package
# Install the generated .vsix file
```

## Configuration

The extension reads your Obsidian configuration files (read-only) and falls back to VS Code settings:

- `obsidianVault.vaultPath`: Path to your Obsidian vault (e.g., `~/Documents/MyVault`)
- `obsidianVault.dailyNotesFolder`: Folder for daily notes (default: from Obsidian config)
- `obsidianVault.weeklyNotesFolder`: Folder for weekly notes (default: from Obsidian config)
- `obsidianVault.dailyNoteTemplate`: Template for daily notes (default: from Obsidian config)
- `obsidianVault.weeklyNoteTemplate`: Template for weekly notes (default: from Obsidian config)
- `obsidianVault.autoCreateYearFolders`: Organize daily notes by year (default: `true`)

### First Time Setup

1. Open VS Code Settings (`Cmd+,`)
2. Search for "Obsidian Vault"
3. Set `Vault Path` to your Obsidian vault location

## Usage

### Command Palette

Use the Command Palette (`Cmd+Shift+P`):
- `Obsidian: Open Today's Note` - Create/open today's daily note
- `Obsidian: Open This Week's Note` - Create/open this week's note
- `Obsidian: Create Note from Template` - Create a new note from templates
- `Obsidian: Navigate to Date` - Open daily/weekly note for specific date

### Vault Explorer

Click the Obsidian icon in the Activity Bar to:
- Browse your vault structure
- Open notes by clicking
- See daily notes, weekly notes, and templates organized

### Wikilinks

- Type `[[` to see note suggestions
- `Ctrl+Click` on `[[note_name]]` to navigate
- Quick fix available for creating missing notes

## 100% Obsidian Compatible

This extension:
- ✅ Reads Obsidian configuration (never modifies it)
- ✅ Uses the same wikilink syntax
- ✅ Compatible with Obsidian templates
- ✅ Works alongside Obsidian with no conflicts

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for development setup and architecture details.

## License

MIT

## Links

- [GitHub Repository](https://github.com/sergivalverde/obsidian-vault-bridge)
- [Report Issues](https://github.com/sergivalverde/obsidian-vault-bridge/issues)
