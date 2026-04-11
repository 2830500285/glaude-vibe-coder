# Glaude Vibe Coder

[![Build](https://github.com/2830500285/glaude-vibe-coder/actions/workflows/ci.yml/badge.svg)](https://github.com/2830500285/glaude-vibe-coder/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/2830500285/glaude-vibe-coder?label=Release)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![Downloads](https://img.shields.io/github/downloads/2830500285/glaude-vibe-coder/total?label=Downloads)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

[Chinese Version](./README.zh-CN.md)

Glaude Vibe Coder turns the Claude Code style agent workflow into a desktop, project-oriented, locally deployable workspace. Its main advantage is not "a stronger model." The real upgrade is product form: GUI, project organization, local packaging, multi-backend configuration, and a more complete path from development to daily use.

## Product Positioning

If Claude Code is a powerful terminal coding agent, Glaude Vibe Coder is closer to a locally deployable Agent IDE / Agent Workspace built for real projects, long-running threads, and team-facing distribution.

## Windows Downloads

- [Glaude Vibe Coder-Setup-1.0.2.exe](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude.Vibe.Coder-Setup-1.0.2.exe)
  Recommended for most users. This installer adds the application through the standard Windows setup flow.
- [Glaude Vibe Coder Portable Package](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude.Vibe.Coder-win-unpacked-1.0.2.zip)
  Use this if you want to run the app without installation. Extract the archive first, then launch `Glaude Vibe Coder.exe` from the unpacked folder.

## Why It Stands Out Compared With Claude Code

- Claude Code is primarily CLI-first; Glaude Vibe Coder adds a GUI and desktop application layer, making the workflow accessible to non-terminal users.
- Claude Code is closer to a single-threaded command flow; Glaude Vibe Coder organizes work as `Workspace -> Threads -> Chat`, which fits long-running tasks and multi-project switching better.
- Claude Code focuses on interacting with an agent in the terminal; Glaude Vibe Coder behaves more like a local collaborative agent workstation with directories, attachments, settings, context management, plugins, skills, automation, and MCP inside one interface.
- Claude Code mainly centers around its native access path; Glaude Vibe Coder adds configurable model backends with custom base URL, API key, model id, and display name.
- Claude Code exposes strong tools but keeps much of the runtime state in the terminal; Glaude Vibe Coder makes uploads, thread state, settings, context compression, and runtime feedback visible in the product surface.
- Claude Code is a tool for the original environment; Glaude Vibe Coder is packaged for local distribution, installation, and reuse, with data separation so developer conversations and local secrets do not ship with the public app.
- Claude Code is command-driven; Glaude Vibe Coder moves toward a task-driven and project-driven workflow, especially through workspaces, thread management, and context handling.

## Core Product Ideas

- Desktop-first agent experience for users who do not want to live in the terminal.
- Project-oriented organization with persistent workspaces and threads.
- Local collaborative workflow with visible app state, attachments, and operational feedback.
- Multi-provider model switching instead of a single fixed backend path.
- Installable and shareable packaging for real-world handoff and distribution.

## Free API Options

This project supports custom model backends. If you want free or low-cost APIs for testing, the following options are practical starting points. Availability, quotas, and verification rules can change over time, so confirm the current policy before production use.

| Provider / Resource | Address | Notes |
| --- | --- | --- |
| SiliconFlow | Signup: [cloud.siliconflow.cn/i/96exzPgC](https://cloud.siliconflow.cn/i/96exzPgC)<br>Console: [cloud.siliconflow.cn](https://cloud.siliconflow.cn/)<br>Docs: [docs.siliconflow.cn](https://docs.siliconflow.cn/)<br>API Base URL: `https://api.siliconflow.cn/v1` | Recommended first for mainland China users. OpenAI-compatible and easy to plug into custom provider settings. For domestic services, registration is required and identity verification may be required under current platform rules. New accounts often receive trial or free quota. |
| free-llm-api-resources | [github.com/cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | One of the most complete and frequently updated resource lists. It categorizes free providers and trial-credit providers, and includes request and token limits. |
| awesome-free-llm-apis | [github.com/mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | A curated awesome-list focused on permanent free tiers and API-key-based access. Useful when you want OpenAI-compatible options without starting from scratch. |
| GitHub Models | Marketplace: [github.com/marketplace/models](https://github.com/marketplace/models)<br>Docs: [docs.github.com/en/github-models](https://docs.github.com/en/github-models) | Official GitHub offering. You can experiment with models using GitHub credentials, and API access can be used with a PAT that has `models:read`. GitHub documents the free API usage as public preview, so limits and availability may change. |
| Free-LLM-API | [github.com/daviddwlee84/Free-LLM-API](https://github.com/daviddwlee84/Free-LLM-API) | A smaller collection that is still useful because it includes example integrations for providers such as Hugging Face Inference Providers, OpenRouter, and Together AI. |

## Feature Overview

- Bun-based CLI and runtime source under `src/`
- Local app server and visual application layer under `app/`
- Electron desktop entrypoints under `electron/`
- Workspace packages under `packages/`
- Supporting docs, scripts, and GitHub workflow configuration included

## Repository Layout

```text
src/        Core CLI, agent, tools, providers, and runtime logic
app/        Local app server and web UI
electron/   Desktop entrypoints
scripts/    Build and maintenance scripts
docs/       Project documentation
packages/   Workspace packages
```

## Quick Start

### Requirements

- [Bun](https://bun.sh/) >= 1.2.0

### Install Dependencies

```bash
bun install
```

### Run in Development Mode

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Run the App Server

```bash
bun run app
```

## Packaging Notes

- `Glaude Vibe Coder-Setup-1.0.2.exe` is the recommended installer build.
- The portable package is not a single standalone EXE. Keep the extracted `resources/` and related files together with `Glaude Vibe Coder.exe`.
- This repository excludes bundled dependencies, local app state, logs, and release build directories from version control.

## License

This repository is distributed under the Creative Commons Attribution-NonCommercial 4.0 International license (`CC BY-NC 4.0`).

You may share and adapt the material for non-commercial use with attribution. For the full license text, see [LICENSE](./LICENSE) or visit [creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/).

## Maintainer

- Author: Gong Fenglin
- Email: `gongfenglin@sdust.edu.cn`
- Website: [https://2830500285.github.io/](https://2830500285.github.io/)
