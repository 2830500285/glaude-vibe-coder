# Glaude Vibe Coder

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

[English Version](./README.md)

Glaude Vibe Coder 把 Claude Code 风格的智能体工作流，做成了一个桌面化、项目化、可本地部署的工作台。它的核心亮点并不在于“模型更强”，而在于产品形态和落地方式更完整: 有 GUI、有桌面应用、有项目组织方式、有本地安装分发能力，也支持多后端模型配置。

## 产品定位

如果说原版 Claude Code 是一个强大的终端智能编码工具，那么 Glaude Vibe Coder 更像是一个面向真实项目协作场景的、本地可部署的 Agent IDE / Agent Workspace。

## Windows 下载

- [Glaude Vibe Coder-Setup-1.0.2.exe](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude.Vibe.Coder-Setup-1.0.2.exe)
  推荐大多数用户使用。这个版本会按照标准 Windows 安装流程完成安装。
- [Glaude Vibe Coder Portable Package](https://github.com/2830500285/glaude-vibe-coder/releases/download/v1.0.2/Glaude.Vibe.Coder-win-unpacked-1.0.2.zip)
  如果你希望免安装直接运行，可以下载这个压缩包。解压完整目录后，运行其中的 `Glaude Vibe Coder.exe`。

## 相对原版 Claude Code 的主要提升

- 原版更偏 CLI，而 Glaude Vibe Coder 补上了 GUI 和 Desktop App 形态，直接把使用门槛从技术用户扩展到更多非终端用户。
- 原版更接近单线程命令式交互，这里则采用 `Workspace -> Threads -> Chat` 的项目化组织方式，更适合长期任务和多项目切换。
- 原版更像“在终端里调用智能体”，这里更像“本地协作 Agent 工作台”，因为工作目录、附件、设置、上下文管理、插件、技能、自动化和 MCP 都被纳入统一界面。
- 原版主要围绕自身默认链路使用模型，这里补了多模型后端配置能力，支持自定义 Base URL、API Key、模型名和显示名称。
- 原版虽然工具能力很强，但对普通用户来说很多状态不可见；这里把文件上传、线程状态、设置项、上下文压缩和运行反馈都做成了更可视化的产品交互。
- 原版并没有针对你的本地分发场景做产品包装；这里已经支持打包、安装、共享给其他人使用，并且做了数据隔离，避免把开发者自己的对话和密钥直接带出去。
- 原版整体更偏“命令驱动”，这里则更有“任务驱动”和“项目驱动”的产品味道，尤其是在工作区、线程和上下文管理层面。

## 核心产品思路

- 面向桌面环境的 Agent 体验，而不是只服务终端用户。
- 面向项目和长期任务的组织结构，而不是一次性命令调用。
- 本地协作型工作流，把附件、上下文和状态反馈放到可见界面里。
- 多模型、多后端切换能力，而不是单一固定链路。
- 可安装、可分发、可复用的产品封装能力。

## 功能概览

- `src/` 中包含 CLI、智能体、工具和运行时核心逻辑
- `app/` 中包含本地服务和可视化界面层
- `electron/` 中包含桌面应用入口
- `packages/` 中包含工作区包
- 同时保留脚本、文档和 GitHub 工作流配置

## 仓库结构

```text
src/        核心 CLI、Agent、工具、Provider 与运行时逻辑
app/        本地服务与 Web UI
electron/   桌面端入口
scripts/    构建与维护脚本
docs/       项目文档
packages/   工作区包
```

## 快速开始

### 环境要求

- [Bun](https://bun.sh/) >= 1.2.0

### 安装依赖

```bash
bun install
```

### 开发模式运行

```bash
bun run dev
```

### 构建

```bash
bun run build
```

### 启动本地应用服务

```bash
bun run app
```

## 打包说明

- `Glaude Vibe Coder-Setup-1.0.2.exe` 是推荐使用的安装版。
- 免安装包不是单独一个可执行文件，必须在解压后的完整目录里运行 `Glaude Vibe Coder.exe`。
- 当前公开仓库不会提交依赖目录、本地状态、日志和发布产物目录。

## 许可证

本仓库按 Creative Commons Attribution-NonCommercial 4.0 International（`CC BY-NC 4.0`）发布。

你可以在非商业前提下进行共享和改编，但需要保留署名。完整授权条款见 [LICENSE](./LICENSE)，官方说明见 [creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)。

## 维护者

- 作者: 宫丰霖
- 邮箱: `gongfenglin@sdust.edu.cn`
- 网址: [https://2830500285.github.io/](https://2830500285.github.io/)
