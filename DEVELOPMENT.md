# Development Guide

## Prerequisites

- Node.js (v18 or higher)
- npm
- VS Code

## Setup

1. Install Node.js if not already installed:
   ```bash
   brew install node
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

   Or manually:
   ```bash
   npm install
   npm run compile
   ```

## Development

1. Open this folder in VS Code
2. Press `F5` to launch the extension in debug mode
3. A new VS Code window will open with the extension loaded

## Testing

In the Extension Development Host window:

1. Configure your vault path:
   - Open Settings (`Cmd+,`)
   - Search for "Obsidian Vault"
   - Set `obsidianVault.vaultPath` to `~/Documents/SV`

2. Test commands via Command Palette (`Cmd+Shift+P`):
   - `Obsidian: Open Today's Note`
   - `Obsidian: Open This Week's Note`
   - `Obsidian: Create Note from Template`
   - `Obsidian: Navigate to Date`

3. Test Vault Explorer:
   - Click the Obsidian icon in the Activity Bar
   - Browse your vault structure
   - Click files to open them

4. Test Wikilinks:
   - Open any markdown file
   - Type `[[` to see note suggestions
   - Ctrl+Click on `[[note_name]]` to navigate
   - Hover over links to see tooltips

## Building for Distribution

```bash
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file that can be installed in VS Code.

## Project Structure

```
src/
├── extension.ts           # Main entry point
├── configResolver.ts      # Reads Obsidian + VS Code config
├── noteCommands.ts        # Daily/weekly note commands
├── templateProcessor.ts   # Template variable substitution
├── vaultTreeProvider.ts   # Activity bar tree view
└── wikilinkProvider.ts    # Wikilink IntelliSense & navigation
```

## Configuration Priority

1. Obsidian settings (`.obsidian/daily-notes.json`, etc.) - Read-only
2. VS Code settings (`obsidianVault.*`) - Fallback
3. Auto-detection (weekly note format)
4. Defaults

## Compatibility

- ✅ Reads Obsidian config files (never modifies them)
- ✅ Supports Obsidian wikilink syntax
- ✅ Compatible with Obsidian templates
- ✅ Works alongside Obsidian (no conflicts)
