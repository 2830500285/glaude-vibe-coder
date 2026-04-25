# Glaude Vibe Coder

[![Build](https://github.com/2830500285/glaude-vibe-coder/actions/workflows/ci.yml/badge.svg)](https://github.com/2830500285/glaude-vibe-coder/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/2830500285/glaude-vibe-coder?label=Release)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![Downloads](https://img.shields.io/github/downloads/2830500285/glaude-vibe-coder/total?label=Downloads)](https://github.com/2830500285/glaude-vibe-coder/releases)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

[English Version](./README.md)

Glaude Vibe Coder 把 Claude Code 风格的智能体工作流，做成了一个桌面化、项目化、可本地部署的工作台。它的核心亮点并不在于“模型更强”，而在于产品形态和落地方式更完整: 有 GUI、有桌面应用、有项目组织方式、有本地安装分发能力，也支持多后端模型配置。

## 项目简介

目前很多 Coding Agent 工具仍然以终端为中心，更适合熟悉命令行的开发者；一旦进入长期项目协作、多模型切换、文件上传、本地目录操作和运行状态反馈这些真实场景，使用门槛和产品割裂感就会明显上升。Glaude Vibe Coder 的目标，就是把这类“终端里能跑的 Agent”进一步推进成“本地可持续协作的 Agent 工作台”。

项目在保留原有 CLI 运行时能力的基础上，围绕真实工作流重新组织了交互与能力层。交互上，系统采用 `Workspace -> Threads -> Chat` 结构，每个工作区可绑定具体本地目录，每个线程可持续保存任务上下文和运行状态，不再只是简单的聊天记录。能力上，除了消息生成，还支持文件上传、本地文件读写、命令行执行、Python 调用、上下文自动/手动压缩、自动化任务、插件、Skills 与 MCP 扩展。这使它更接近一个真正能进入项目流程的本地协作 Agent，而不只是一个会回答问题的聊天界面。

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

## 免费 API 推荐

本项目支持自定义模型后端。如果你想找一些免费或低成本的 API 来测试，这几项比较适合作为起点。额度、限流、实名和计费政策都可能变化，正式接入前建议再次确认平台当前规则。

| 提供商 / 资源 | 具体地址 | 说明 |
| --- | --- | --- |
| 硅基流动 SiliconFlow | 注册链接: [cloud.siliconflow.cn/i/96exzPgC](https://cloud.siliconflow.cn/i/96exzPgC)<br>控制台: [cloud.siliconflow.cn](https://cloud.siliconflow.cn/)<br>文档: [docs.siliconflow.cn](https://docs.siliconflow.cn/)<br>API Base URL: `https://api.siliconflow.cn/v1` | 放在第一推荐位。兼容 OpenAI 接口，适合直接接入本项目的自定义提供商配置。国内服务通常需要先注册，且可能需要完成实名认证；注册后一般会有免费额度或试用额度，具体以平台当前政策为准。 |
| free-llm-api-resources | [github.com/cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 目前很全面、更新也比较快的免费大模型 API 资源汇总，区分了完全免费和试用额度两类，还整理了请求频率和 Token 限制。 |
| awesome-free-llm-apis | [github.com/mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 一个偏精选风格的 Awesome 列表，重点是永久免费或长期免费层，适合找兼容 OpenAI SDK 的可用接口。 |
| GitHub Models | Marketplace: [github.com/marketplace/models](https://github.com/marketplace/models)<br>文档: [docs.github.com/en/github-models](https://docs.github.com/en/github-models) | GitHub 官方提供的模型体验和推理入口。可以直接用 GitHub 凭据做实验，API 调用可配合带 `models:read` 权限的 PAT 使用。官方说明里免费 API 仍处于 public preview，额度和可用模型可能调整。 |
| Free-LLM-API | [github.com/daviddwlee84/Free-LLM-API](https://github.com/daviddwlee84/Free-LLM-API) | 相对小众一些，但提供了 Hugging Face Inference Providers、OpenRouter、Together AI 等接入示例，适合想直接看代码的人。 |

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
