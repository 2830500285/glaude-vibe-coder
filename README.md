# Glaude Vibe Coder

Glaude Vibe Coder is a terminal-first AI coding assistant project with a Bun-based CLI runtime and an Electron desktop shell. This public repository keeps the source code, scripts, documentation, and application assets needed for development while excluding local state, bundled dependencies, and build outputs.

## Windows Downloads

- [Glaude Vibe Coder-Setup-1.0.2.exe](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude%20Vibe%20Coder-Setup-1.0.2.exe)
  Recommended for most users. This installer adds the application through the normal Windows setup flow.
- [Glaude Vibe Coder.exe（免安装版，下载 ZIP 后解压运行）](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude%20Vibe%20Coder-win-unpacked-1.0.2.zip)
  Use this if you want to run the app directly without installation. Download the ZIP, extract the full folder, and then launch `Glaude Vibe Coder.exe` inside it.

## Download Notes

- `Glaude Vibe Coder-Setup-1.0.2.exe` is the standard installer and is the recommended option.
- The direct-run package is not a single standalone EXE. It must remain with the extracted `resources/` and related files in the same folder.

## Highlights

- Bun-based CLI and REPL source under `src/`
- App server and web settings UI under `app/`
- Electron packaging entrypoints under `electron/`
- Supporting scripts, docs, and GitHub workflow configuration included

## Project Structure

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

## Notes

- This repository intentionally excludes `node_modules/`, build artifacts, local app state, logs, and release bundles.
- Generated output should stay outside version control unless it is required source material.

## Maintainer

- Author: Gong Fenglin
- Email: `gongfenglin@sdust.edu.cn`
- Website: [https://2830500285.github.io/](https://2830500285.github.io/)
