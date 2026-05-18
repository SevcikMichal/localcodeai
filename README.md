# localcodeai

> **An experiment in local LLM-powered code assistance a test for AI coding assistants.**

## What is this?

`localcodeai` is a proof-of-concept VS Code extension designed to test local LLM models running directly on your PC. Together with [Roo Code](https://github.com/RooCodeInc/Roo-Code), it creates a dummy extension that integrates local language models into VS Code, providing inline code completions all without sending your code to external cloud services.

Created primarily as a testing ground for local models and to understand how VS Code extensions work under the hood, this project serves as both a **test** for local AI coding assistants and a learning experience into extension development.

## Hardware

This experiment runs on:

| Component | Specification |
|-----------|---------------|
| **CPU** | AMD Ryzen 9 7900X (24) @ 5.74 GHz |
| **GPU** | GeForce RTX 5070 Ti |
| **RAM** | 32 GiB |

## Purpose

- **Test local LLM models**. Evaluate how well open-source/local models handle code completion tasks
- **Understand VS Code extension architecture**. Learn how the extension API works, from inline completion providers to context collection
- **Privacy-first coding assistance**. Keep all code execution local, no data leaves your machine