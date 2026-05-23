# localcodeai

> **An experiment in local LLM-powered code assistance — a test for AI coding assistants.**

## What is this?

`localcodeai` is a proof-of-concept VS Code extension designed to test local LLM models running directly on your PC. Together with [Roo Code](https://github.com/RooCodeInc/Roo-Code), it creates a dummy extension that integrates local language models into VS Code, providing inline code completions and AI-assisted coding features — all without sending your code to external cloud services.

Created primarily as a testing ground for local models and to understand how VS Code extensions work under the hood, this project serves as both a **test** for local AI coding assistants and a learning experience into extension development.

## Hardware

This experiment runs on:

| Component | Specification |
|-----------|---------------|
| **CPU** | AMD Ryzen 9 7900X (24) @ 5.74 GHz |
| **GPU** | GeForce RTX 5070 Ti |
| **RAM** | 32 GiB |

## Purpose

- **Test local LLM models** — Evaluate how well open-source/local models handle code completion tasks
- **Understand VS Code extension architecture** — Learn how the extension API works, from inline completion providers to context collection
- **Privacy-first coding assistance** — Keep all code execution local, no data leaves your machine

## Installation

Since this is a development/experimental extension, it's not published to the VS Code Marketplace. Install it locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [VS Code](https://code.visualstudio.com/)

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension package:**
   ```bash
   npm pack
   ```
   This creates a `.tgz` file (e.g., `localcodeai-0.0.1.tgz`).

3. **Install into VS Code:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette
   - Type **"Extensions: Install from VSIX"**
   - Select the generated `.tgz` file

4. **Or run in development mode:**
   - Open this folder in VS Code
   - Press `F5` to launch a new VS Code window with the extension loaded