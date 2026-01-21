# Obsidian Vault Bridge - Quick Reference

## Installation

### Option 1: From Source (Development)
```bash
cd ~/dev/obsidian-vault-bridge
./setup.sh
```

Then press F5 in VS Code to launch in debug mode.

### Option 2: Install .vsix (Production)
```bash
npm install -g @vscode/vsce
vsce package
code --install-extension obsidian-vault-bridge-0.1.0.vsix
```

## Configuration

Open VS Code Settings (`Cmd+,`) and search for "Obsidian Vault":

| Setting | Description | Example |
|---------|-------------|---------|
| `obsidianVault.vaultPath` | Path to your vault | `~/Documents/SV` |
| `obsidianVault.dailyNotesFolder` | Daily notes folder | `attention` (default) |
| `obsidianVault.weeklyNotesFolder` | Weekly notes folder | `` (root) |
| `obsidianVault.dailyNoteTemplate` | Daily template path | `_templates/daily_note_template.md.md` |
| `obsidianVault.weeklyNoteTemplate` | Weekly template path | `_templates/Weekly template.md` |
| `obsidianVault.autoCreateYearFolders` | Organize by year | `true` (default) |

**Note:** If left empty, settings fallback to your Obsidian configuration.

## Commands

Access via Command Palette (`Cmd+Shift+P`):

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Obsidian: Open Today's Note` | Opens/creates today's daily note | - |
| `Obsidian: Open This Week's Note` | Opens/creates this week's note | - |
| `Obsidian: Create Note from Template` | Create new note from template picker | - |
| `Obsidian: Navigate to Date` | Open daily/weekly note for specific date | - |
| `Obsidian: Refresh Vault Explorer` | Refresh the vault tree view | - |

## Features

### 📅 Daily Notes
- **Format:** `YYYY-MM-DD.md` (e.g., `2026-01-21.md`)
- **Location:** `attention/2026/` (auto-organized by year)
- **Template:** Uses configured template with variable substitution

### 📊 Weekly Notes
- **Format:** Auto-detected (`YYYY-W##.md` or `YYYY-[W]##.md`)
- **Location:** Root of vault or configured folder
- **Template:** Uses configured template

### 🔗 Wikilinks
- **Type `[[`** to see note suggestions (IntelliSense)
- **Ctrl+Click** on `[[note_name]]` to navigate
- **Hover** over links to see note path
- **Quick Fix** to create missing notes

### 🗂️ Vault Explorer
- Click **Obsidian icon** in Activity Bar
- Browse vault structure:
  - 📅 Daily Notes
  - 📊 Weekly Notes
  - 📝 Templates
  - 📁 Other folders
- **Click** to open files
- **Refresh** button to update view

### 📋 Templates

Template variables are automatically replaced:

| Variable | Result | Example |
|----------|--------|---------|
| `{{date}}` | Current date | `2026-01-21` |
| `{{time}}` | Current time | `14:30` |
| `{{title}}` | Note title | `2026-01-21` |
| `{{date:FORMAT}}` | Custom format | `{{date:MMMM Do, YYYY}}` → `January 21st, 2026` |

Template example:
```markdown
---
tags:
  - daily_note
created: {{date}}
---

# {{title}}

Created at {{time}}

## Notes

{{cursor}}
```

## File Organization

The extension respects your vault structure:

```
~/Documents/SV/
├── attention/              # Daily notes folder
│   ├── 2025/              # Auto-organized by year
│   │   └── 2025-12-31.md
│   └── 2026/
│       └── 2026-01-21.md  # Today's note
├── _templates/            # Template files
│   ├── daily_note_template.md.md
│   └── Weekly template.md
├── 2026-W04.md           # Weekly notes (root level)
├── 2026-W03.md
└── other-notes.md
```

## Obsidian Compatibility

✅ **100% Compatible**
- Reads Obsidian config (`.obsidian/daily-notes.json`, etc.)
- **Never modifies** Obsidian config files
- Uses same wikilink syntax
- Compatible with Obsidian templates
- Works alongside Obsidian (no conflicts)

## Troubleshooting

### Vault not showing
- Check `obsidianVault.vaultPath` in settings
- Ensure path exists and is accessible
- Try absolute path instead of `~`

### Templates not working
- Verify template path in settings
- Check template file exists
- Ensure template folder is `_templates` or configured correctly

### Wikilinks not working
- Ensure you're in a Markdown file
- Check vault path is configured
- Verify file extensions are `.md`

### Weekly format wrong
- Extension auto-detects from existing files
- If no files exist, uses `YYYY-[W]WW`
- Check existing weekly notes match pattern

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for development setup and architecture.

## License

MIT
