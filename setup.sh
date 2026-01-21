#!/bin/bash

# Setup script for Obsidian Vault Bridge extension

echo "🔧 Setting up Obsidian Vault Bridge..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Or download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Compile TypeScript
echo ""
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile TypeScript"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open this folder in VS Code"
echo "2. Press F5 to launch the extension in debug mode"
echo "3. Configure your vault path in settings (Cmd+,):"
echo "   - Search for 'Obsidian Vault'"
echo "   - Set 'obsidianVault.vaultPath' to your vault location"
echo ""
echo "Available commands (Cmd+Shift+P):"
echo "  - Obsidian: Open Today's Note"
echo "  - Obsidian: Open This Week's Note"
echo "  - Obsidian: Create Note from Template"
echo "  - Obsidian: Navigate to Date"
