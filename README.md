# Glaude Vibe Coder

Glaude Vibe Coder 是一个面向本地协作场景的可视化 AI Agent 应用。项目以 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的 CLI 能力为基础，进一步重构为支持网页端、桌面端、多工作区、多线程、多模型配置、本地工具执行与安装包分发的 Agent 工作台。它的目标不是简单复刻一个命令行工具，而是把原本偏技术用户的 Coding Agent 体验，推进成普通用户也能直接上手的本地协作系统。

## 项目简介

传统的 Coding Agent 工具大多围绕终端展开，适合熟悉命令行的开发者，但在长期项目协作、多模型切换、文件上传、本地目录操作和可视化反馈方面仍有较高门槛。Glaude Vibe Coder 试图解决的就是这个问题：将 Agent 从“终端里的单轮工具”升级为“围绕真实项目长期工作的本地协作系统”。

在交互层，项目采用 `Workspace -> Threads -> Chat` 的结构组织任务。每个工作区可以绑定独立目录，每个线程可以关联不同上下文和模型配置，使对话不再只是聊天记录，而是可持续推进的项目任务流。在能力层，系统不只支持消息生成，还支持文件上传、本地文件读写、命令行执行、Python 调用、上下文压缩、自动化任务、插件、Skills 与 MCP 扩展，使 Agent 具备更完整的执行能力与可扩展性。

项目当前同时保留了 CLI 运行时的核心能力，并补充了桌面应用壳、安装包分发与本地数据隔离逻辑。对于希望在本地环境中使用 AI Agent 完成代码开发、文件处理、脚本执行和多轮协作的用户，它提供了一套更接近真实工作流的产品化方案。

## ⚠️ 已知问题 / Known Issues（高优先级）

> <span style="color:#d10000; font-weight:bold;">前端若出现“超时后无进度反馈”的情况，请先按此优先级处理</span>  
> If the interface shows “timeout without timely progress feedback”, handle in this order first.

### 1) 大任务超时提示 / Large task timeout prompt

- **现象 / Symptom**：在任务较大时可能出现 `The operation timed out.`。  
- **当前可用处理 / Current workaround**：向会话发送 `continue` 或 `continuecontinue` 继续任务。  
- **处理建议 / Suggestion**：先将该行为明确写入前端提示文案，避免用户误以为任务已失败。

### 2) 前端反馈不及时 / Frontend feedback is delayed

- **现象 / Symptom**：当前前端经常只显示 `tools` 状态，其他阶段反馈不及时，用户难以判断实际执行进度。  
- **处理建议 / Suggestion**：  
  - 补充统一状态面板（`submitted / running / waiting for resume / done / error`）。  
  - 将 Tool 开始、结束、等待、重试等关键事件推送到对话流。  
  - 对超时场景显示“恢复中/已暂停等待继续”进度态。

### 3) 对话框体验优化 / Conversation box UX polish

- **现象 / Symptom**：对话框在长任务和流式输出时可读性下降，人工干预体验不顺畅。  
- **处理建议 / Suggestion**：  
  - 增加“关键里程碑”分段（任务创建 → 执行中 → 等待继续 → 完成）。  
  - 为 `continue`/`continuecontinue` 提示提供按钮入口，降低命令记忆成本。  
  - 优化滚动与折叠策略，长输出支持按块确认（避免整段刷屏）。  

## 核心亮点

- **项目化工作流**：通过 `Workspace -> Threads -> Chat` 组织项目与会话，而不是单纯的聊天窗口。
- **多模型接入**：支持 Anthropic 与 OpenAI-compatible 模型配置，可自定义 URL、API Key、API Model，并持久化保存多组模型资料。
- **本地工具执行**：支持文件上传、本地目录读写、命令行调用和 Python 执行，使 Agent 能直接处理真实工作目录中的任务。
- **长上下文治理**：支持自动压缩与手动压缩，降低长任务场景中的上下文膨胀和失真问题。
- **可视化与桌面化**：提供网页端与 Windows 桌面安装包，降低非技术用户的使用门槛。
- **扩展能力**：内置 Automations、Plugins、Skills、MCP Servers、Environments、Worktrees 等模块，便于后续继续演进为完整的 Agent 平台。

## 与原始 CLI 形态的差异

- 从 **终端交互** 升级为 **可视化本地应用**
- 从 **单线程命令式对话** 升级为 **多工作区、多线程项目协作**
- 从 **单一运行入口** 升级为 **网页端 + 桌面端 + 安装包分发**
- 从 **偏开发者使用** 升级为 **更适合普通用户和真实项目场景**
- 从 **单纯生成回答** 升级为 **可执行本地工具、可管理上下文、可组织长期任务**

## 适用场景

- 本地项目代码协作与多轮任务推进
- 多模型切换与不同提供商接口验证
- 需要结合文件上传、命令行、Python 的 Agent 工作流
- 需要将 Agent 从“能跑”推进到“能持续协作”的本地化产品场景

## 快速开始

### 环境要求

一定要最新版本的 bun 啊, 不然一堆奇奇怪怪的 BUG!!! bun upgrade!!!

- [Bun](https://bun.sh/) >= 1.3.11
- 常规的配置 CC 的方式, 各大提供商都有自己的配置方式

### 安装

```bash
bun install
```

### 运行

```bash
# 开发模式, 看到版本号 888 说明就是对了
bun run dev

# 构建
bun run build
```

构建采用 code splitting 多文件打包（`build.ts`），产物输出到 `dist/` 目录（入口 `dist/cli.js` + 约 450 个 chunk 文件）。构建出的版本 bun 和 node 都可以启动, 你 publish 到私有源可以直接启动

## 能力清单

> ✅ = 已实现  ⚠️ = 部分实现 / 条件启用  ❌ = stub / 移除 / feature flag 关闭

### 核心系统

| 能力 | 状态 | 说明 |
|------|------|------|
| REPL 交互界面（Ink 终端渲染） | ✅ | 主屏幕 5000+ 行，完整交互 |
| API 通信 — Anthropic Direct | ✅ | 支持 API Key + OAuth |
| API 通信 — AWS Bedrock | ✅ | 支持凭据刷新、Bearer Token |
| API 通信 — Google Vertex | ✅ | 支持 GCP 凭据刷新 |
| API 通信 — Azure Foundry | ✅ | 支持 API Key + Azure AD |
| 流式对话与工具调用循环 (`query.ts`) | ✅ | 1700+ 行，含自动压缩、token 追踪 |
| 会话引擎 (`QueryEngine.ts`) | ✅ | 1300+ 行，管理对话状态与归因 |
| 上下文构建（git status / CLAUDE.md / memory） | ✅ | `context.ts` 完整实现 |
| 权限系统（plan/auto/manual 模式） | ✅ | 6300+ 行，含 YOLO 分类器、路径验证、规则匹配 |
| Hook 系统（pre/post tool use） | ✅ | 支持 settings.json 配置 |
| 会话恢复 (`/resume`) | ✅ | 独立 ResumeConversation 屏幕 |
| Doctor 诊断 (`/doctor`) | ✅ | 版本、API、插件、沙箱检查 |
| 自动压缩 (compaction) | ✅ | auto-compact / micro-compact / API compact |

### 工具 — 始终可用

| 工具 | 状态 | 说明 |
|------|------|------|
| BashTool | ✅ | Shell 执行，沙箱，权限检查 |
| FileReadTool | ✅ | 文件 / PDF / 图片 / Notebook 读取 |
| FileEditTool | ✅ | 字符串替换式编辑 + diff 追踪 |
| FileWriteTool | ✅ | 文件创建 / 覆写 + diff 生成 |
| NotebookEditTool | ✅ | Jupyter Notebook 单元格编辑 |
| AgentTool | ✅ | 子代理派生（fork / async / background / remote） |
| WebFetchTool | ✅ | URL 抓取 → Markdown → AI 摘要 |
| WebSearchTool | ✅ | 网页搜索 + 域名过滤 |
| AskUserQuestionTool | ✅ | 多问题交互提示 + 预览 |
| SendMessageTool | ✅ | 消息发送（peers / teammates / mailbox） |
| SkillTool | ✅ | 斜杠命令 / Skill 调用 |
| EnterPlanModeTool | ✅ | 进入计划模式 |
| ExitPlanModeTool (V2) | ✅ | 退出计划模式 |
| TodoWriteTool | ✅ | Todo 列表 v1 |
| BriefTool | ✅ | 简短消息 + 附件发送 |
| TaskOutputTool | ✅ | 后台任务输出读取 |
| TaskStopTool | ✅ | 后台任务停止 |
| ListMcpResourcesTool | ✅ | MCP 资源列表 |
| ReadMcpResourceTool | ✅ | MCP 资源读取 |
| SyntheticOutputTool | ✅ | 非交互会话结构化输出 |

### 工具 — 条件启用

| 工具 | 状态 | 启用条件 |
|------|------|----------|
| GlobTool | ✅ | 未嵌入 bfs/ugrep 时启用（默认启用） |
| GrepTool | ✅ | 同上 |
| TaskCreateTool | ⚠️ | `isTodoV2Enabled()` 为 true 时 |
| TaskGetTool | ⚠️ | 同上 |
| TaskUpdateTool | ⚠️ | 同上 |
| TaskListTool | ⚠️ | 同上 |
| EnterWorktreeTool | ⚠️ | `isWorktreeModeEnabled()` |
| ExitWorktreeTool | ⚠️ | 同上 |
| TeamCreateTool | ⚠️ | `isAgentSwarmsEnabled()` |
| TeamDeleteTool | ⚠️ | 同上 |
| ToolSearchTool | ⚠️ | `isToolSearchEnabledOptimistic()` |
| PowerShellTool | ⚠️ | Windows 平台检测 |
| LSPTool | ⚠️ | `ENABLE_LSP_TOOL` 环境变量 |
| ConfigTool | ❌ | `USER_TYPE === 'ant'`（永远为 false） |

### 工具 — Feature Flag 关闭（全部不可用）

| 工具 | Feature Flag |
|------|-------------|
| SleepTool | `PROACTIVE` / `KAIROS` |
| CronCreate/Delete/ListTool | `AGENT_TRIGGERS` |
| RemoteTriggerTool | `AGENT_TRIGGERS_REMOTE` |
| MonitorTool | `MONITOR_TOOL` |
| SendUserFileTool | `KAIROS` |
| OverflowTestTool | `OVERFLOW_TEST_TOOL` |
| TerminalCaptureTool | `TERMINAL_PANEL` |
| WebBrowserTool | `WEB_BROWSER_TOOL` |
| SnipTool | `HISTORY_SNIP` |
| WorkflowTool | `WORKFLOW_SCRIPTS` |
| PushNotificationTool | `KAIROS` |
| SubscribePRTool | `KAIROS_GITHUB_WEBHOOKS` |
| ListPeersTool | `UDS_INBOX` |
| CtxInspectTool | `CONTEXT_COLLAPSE` |

### 工具 — Stub / 不可用

| 工具 | 说明 |
|------|------|
| TungstenTool | ANT-ONLY stub |
| REPLTool | ANT-ONLY，`isEnabled: () => false` |
| SuggestBackgroundPRTool | ANT-ONLY，`isEnabled: () => false` |
| VerifyPlanExecutionTool | 需 `CLAUDE_CODE_VERIFY_PLAN=true` 环境变量，且为 stub |
| ReviewArtifactTool | stub，未注册到 tools.ts |
| DiscoverSkillsTool | stub，未注册到 tools.ts |

### 斜杠命令 — 可用

| 命令 | 状态 | 说明 |
|------|------|------|
| `/add-dir` | ✅ | 添加目录 |
| `/advisor` | ✅ | Advisor 配置 |
| `/agents` | ✅ | 代理列表/管理 |
| `/branch` | ✅ | 分支管理 |
| `/btw` | ✅ | 快速备注 |
| `/chrome` | ✅ | Chrome 集成 |
| `/clear` | ✅ | 清屏 |
| `/color` | ✅ | Agent 颜色 |
| `/compact` | ✅ | 压缩对话 |
| `/config` (`/settings`) | ✅ | 配置管理 |
| `/context` | ✅ | 上下文信息 |
| `/copy` | ✅ | 复制最后消息 |
| `/cost` | ✅ | 会话费用 |
| `/desktop` | ✅ | Claude Desktop 集成 |
| `/diff` | ✅ | 显示 diff |
| `/doctor` | ✅ | 健康检查 |
| `/effort` | ✅ | 设置 effort 等级 |
| `/exit` | ✅ | 退出 |
| `/export` | ✅ | 导出对话 |
| `/extra-usage` | ✅ | 额外用量信息 |
| `/fast` | ✅ | 切换 fast 模式 |
| `/feedback` | ✅ | 反馈 |
| `/files` | ✅ | 已跟踪文件 |
| `/heapdump` | ✅ | Heap dump（调试） |
| `/help` | ✅ | 帮助 |
| `/hooks` | ✅ | Hook 管理 |
| `/ide` | ✅ | IDE 连接 |
| `/init` | ✅ | 初始化项目 |
| `/install-github-app` | ✅ | 安装 GitHub App |
| `/install-slack-app` | ✅ | 安装 Slack App |
| `/keybindings` | ✅ | 快捷键管理 |
| `/login` / `/logout` | ✅ | 登录 / 登出 |
| `/mcp` | ✅ | MCP 服务管理 |
| `/memory` | ✅ | Memory / CLAUDE.md 管理 |
| `/mobile` | ✅ | 移动端 QR 码 |
| `/model` | ✅ | 模型选择 |
| `/output-style` | ✅ | 输出风格 |
| `/passes` | ✅ | 推荐码 |
| `/permissions` | ✅ | 权限管理 |
| `/plan` | ✅ | 计划模式 |
| `/plugin` | ✅ | 插件管理 |
| `/pr-comments` | ✅ | PR 评论 |
| `/privacy-settings` | ✅ | 隐私设置 |
| `/rate-limit-options` | ✅ | 限速选项 |
| `/release-notes` | ✅ | 更新日志 |
| `/reload-plugins` | ✅ | 重载插件 |
| `/remote-env` | ✅ | 远程环境配置 |
| `/rename` | ✅ | 重命名会话 |
| `/resume` | ✅ | 恢复会话 |
| `/review` | ✅ | 代码审查（本地） |
| `/ultrareview` | ✅ | 云端审查 |
| `/rewind` | ✅ | 回退对话 |
| `/sandbox-toggle` | ✅ | 切换沙箱 |
| `/security-review` | ✅ | 安全审查 |
| `/session` | ✅ | 会话信息 |
| `/skills` | ✅ | Skill 管理 |
| `/stats` | ✅ | 会话统计 |
| `/status` | ✅ | 状态信息 |
| `/statusline` | ✅ | 状态栏 UI |
| `/stickers` | ✅ | 贴纸 |
| `/tasks` | ✅ | 任务管理 |
| `/theme` | ✅ | 终端主题 |
| `/think-back` | ✅ | 年度回顾 |
| `/upgrade` | ✅ | 升级 CLI |
| `/usage` | ✅ | 用量信息 |
| `/insights` | ✅ | 使用分析报告 |
| `/vim` | ✅ | Vim 模式 |

### 斜杠命令 — Feature Flag 关闭

| 命令 | Feature Flag |
|------|-------------|
| `/voice` | `VOICE_MODE` |
| `/proactive` | `PROACTIVE` / `KAIROS` |
| `/brief` | `KAIROS` / `KAIROS_BRIEF` |
| `/assistant` | `KAIROS` |
| `/bridge` | `BRIDGE_MODE` |
| `/remote-control-server` | `DAEMON` + `BRIDGE_MODE` |
| `/force-snip` | `HISTORY_SNIP` |
| `/workflows` | `WORKFLOW_SCRIPTS` |
| `/web-setup` | `CCR_REMOTE_SETUP` |
| `/subscribe-pr` | `KAIROS_GITHUB_WEBHOOKS` |
| `/ultraplan` | `ULTRAPLAN` |
| `/torch` | `TORCH` |
| `/peers` | `UDS_INBOX` |
| `/fork` | `FORK_SUBAGENT` |
| `/buddy` | `BUDDY` |

### 斜杠命令 — ANT-ONLY（不可用）

`/tag` `/backfill-sessions` `/break-cache` `/bughunter` `/commit` `/commit-push-pr` `/ctx_viz` `/good-claude` `/issue` `/init-verifiers` `/mock-limits` `/bridge-kick` `/version` `/reset-limits` `/onboarding` `/share` `/summary` `/teleport` `/ant-trace` `/perf-issue` `/env` `/oauth-refresh` `/debug-tool-call` `/agents-platform` `/autofix-pr`

### CLI 子命令

| 子命令 | 状态 | 说明 |
|--------|------|------|
| `claude`（默认） | ✅ | 主 REPL / 交互 / print 模式 |
| `claude mcp serve/add/remove/list/get/...` | ✅ | MCP 服务管理（7 个子命令） |
| `claude auth login/status/logout` | ✅ | 认证管理 |
| `claude plugin validate/list/install/...` | ✅ | 插件管理（7 个子命令） |
| `claude setup-token` | ✅ | 长效 Token 配置 |
| `claude agents` | ✅ | 代理列表 |
| `claude doctor` | ✅ | 健康检查 |
| `claude update` / `upgrade` | ✅ | 自动更新 |
| `claude install [target]` | ✅ | Native 安装 |
| `claude server` | ❌ | `DIRECT_CONNECT` flag |
| `claude ssh <host>` | ❌ | `SSH_REMOTE` flag |
| `claude open <cc-url>` | ❌ | `DIRECT_CONNECT` flag |
| `claude auto-mode` | ❌ | `TRANSCRIPT_CLASSIFIER` flag |
| `claude remote-control` | ❌ | `BRIDGE_MODE` + `DAEMON` flag |
| `claude assistant` | ❌ | `KAIROS` flag |
| `claude up/rollback/log/error/export/task/completion` | ❌ | ANT-ONLY |

### 服务层

| 服务 | 状态 | 说明 |
|------|------|------|
| API 客户端 (`services/api/`) | ✅ | 3400+ 行，4 个 provider |
| MCP (`services/mcp/`) | ✅ | 24 个文件，12000+ 行 |
| OAuth (`services/oauth/`) | ✅ | 完整 OAuth 流程 |
| 插件 (`services/plugins/`) | ✅ | 基础设施完整，无内置插件 |
| LSP (`services/lsp/`) | ⚠️ | 实现存在，默认关闭 |
| 压缩 (`services/compact/`) | ✅ | auto / micro / API 压缩 |
| Hook 系统 (`services/tools/toolHooks.ts`) | ✅ | pre/post tool use hooks |
| 会话记忆 (`services/SessionMemory/`) | ✅ | 会话记忆管理 |
| 记忆提取 (`services/extractMemories/`) | ✅ | 自动记忆提取 |
| Skill 搜索 (`services/skillSearch/`) | ✅ | 本地/远程 skill 搜索 |
| 策略限制 (`services/policyLimits/`) | ✅ | 策略限制执行 |
| 分析 / GrowthBook / Sentry | ⚠️ | 框架存在，实际 sink 为空 |
| Voice (`services/voice.ts`) | ❌ | `VOICE_MODE` flag 关闭 |

### 内部包 (`packages/`)

| 包 | 状态 | 说明 |
|------|------|------|
| `color-diff-napi` | ✅ | 997 行完整 TypeScript 实现（语法高亮 diff） |
| `audio-capture-napi` | ❌ | stub，`isNativeAudioAvailable()` 返回 false |
| `image-processor-napi` | ❌ | stub，`getNativeModule()` 返回 null |
| `modifiers-napi` | ❌ | stub，`isModifierPressed()` 返回 false |
| `url-handler-napi` | ❌ | stub，`waitForUrlEvent()` 返回 null |
| `@ant/claude-for-chrome-mcp` | ❌ | stub，`createServer()` 返回 null |
| `@ant/computer-use-mcp` | ❌ | stub，`buildTools()` 返回 [] |
| `@ant/computer-use-input` | ❌ | stub，仅类型声明 |
| `@ant/computer-use-swift` | ❌ | stub，仅类型声明 |

### Feature Flags（30 个，全部返回 `false`）

`ABLATION_BASELINE` `AGENT_MEMORY_SNAPSHOT` `BG_SESSIONS` `BRIDGE_MODE` `BUDDY` `CCR_MIRROR` `CCR_REMOTE_SETUP` `CHICAGO_MCP` `COORDINATOR_MODE` `DAEMON` `DIRECT_CONNECT` `EXPERIMENTAL_SKILL_SEARCH` `FORK_SUBAGENT` `HARD_FAIL` `HISTORY_SNIP` `KAIROS` `KAIROS_BRIEF` `KAIROS_CHANNELS` `KAIROS_GITHUB_WEBHOOKS` `LODESTONE` `MCP_SKILLS` `PROACTIVE` `SSH_REMOTE` `TORCH` `TRANSCRIPT_CLASSIFIER` `UDS_INBOX` `ULTRAPLAN` `UPLOAD_USER_SETTINGS` `VOICE_MODE` `WEB_BROWSER_TOOL` `WORKFLOW_SCRIPTS`

## 项目结构

```
claude-code/
├── src/
│   ├── entrypoints/
│   │   ├── cli.tsx          # 入口文件（含 MACRO/feature polyfill）
│   │   └── sdk/             # SDK 子模块 stub
│   ├── main.tsx             # 主 CLI 逻辑（Commander 定义）
│   └── types/
│       ├── global.d.ts      # 全局变量/宏声明
│       └── internal-modules.d.ts  # 内部 npm 包类型声明
├── packages/                # Monorepo workspace 包
│   ├── color-diff-napi/     # 完整实现（终端 color diff）
│   ├── modifiers-napi/      # stub（macOS 修饰键检测）
│   ├── audio-capture-napi/  # stub
│   ├── image-processor-napi/# stub
│   ├── url-handler-napi/    # stub
│   └── @ant/               # Anthropic 内部包 stub
│       ├── claude-for-chrome-mcp/
│       ├── computer-use-mcp/
│       ├── computer-use-input/
│       └── computer-use-swift/
├── scripts/                 # 自动化 stub 生成脚本
├── build.ts                 # 构建脚本（Bun.build + code splitting + Node.js 兼容后处理）
├── dist/                    # 构建输出（入口 cli.js + ~450 chunk 文件）
└── package.json             # Bun workspaces monorepo 配置
```

## 技术说明

### 运行时 Polyfill

入口文件 `src/entrypoints/cli.tsx` 顶部注入了必要的 polyfill：

- `feature()` — 所有 feature flag 返回 `false`，跳过未实现分支
- `globalThis.MACRO` — 模拟构建时宏注入（VERSION 等）

### Monorepo

项目采用 Bun workspaces 管理内部包。原先手工放在 `node_modules/` 下的 stub 已统一迁入 `packages/`，通过 `workspace:*` 解析。

## Feature Flags 详解

原版 Claude Code 通过 `bun:bundle` 的 `feature()` 在构建时注入 feature flag，由 GrowthBook 等 A/B 实验平台控制灰度发布。本项目中 `feature()` 被 polyfill 为始终返回 `false`，因此以下 30 个 flag 全部关闭。

### 自主 Agent

| Flag | 用途 |
|------|------|
| `KAIROS` | Assistant 模式 — 长期运行的自主 Agent（含 brief、push 通知、文件发送） |
| `KAIROS_BRIEF` | Kairos Brief — 向用户发送简报摘要 |
| `KAIROS_CHANNELS` | Kairos 频道 — 多频道通信 |
| `KAIROS_GITHUB_WEBHOOKS` | GitHub Webhook 订阅 — PR 事件实时推送给 Agent |
| `PROACTIVE` | 主动模式 — Agent 主动执行任务，含 SleepTool 定时唤醒 |
| `COORDINATOR_MODE` | 协调器模式 — 多 Agent 编排调度 |
| `BUDDY` | Buddy 配对编程功能 |
| `FORK_SUBAGENT` | Fork 子代理 — 从当前会话分叉出独立子代理 |

### 远程 / 分布式

| Flag | 用途 |
|------|------|
| `BRIDGE_MODE` | 远程控制桥接 — 允许外部客户端远程操控 Claude Code |
| `DAEMON` | 守护进程 — 后台常驻服务，支持 worker 和 supervisor |
| `BG_SESSIONS` | 后台会话 — `ps`/`logs`/`attach`/`kill`/`--bg` 等后台进程管理 |
| `SSH_REMOTE` | SSH 远程 — `claude ssh <host>` 连接远程主机 |
| `DIRECT_CONNECT` | 直连模式 — `cc://` URL 协议、server 命令、`open` 命令 |
| `CCR_REMOTE_SETUP` | 网页端远程配置 — 通过浏览器配置 Claude Code |
| `CCR_MIRROR` | Claude Code Runtime 镜像 — 会话状态同步/复制 |

### 通信

| Flag | 用途 |
|------|------|
| `UDS_INBOX` | Unix Domain Socket 收件箱 — Agent 间本地通信（`/peers`） |

### 增强工具

| Flag | 用途 |
|------|------|
| `CHICAGO_MCP` | Computer Use MCP — 计算机操作（屏幕截图、鼠标键盘控制） |
| `WEB_BROWSER_TOOL` | 网页浏览器工具 — 在终端内嵌浏览器交互 |
| `VOICE_MODE` | 语音模式 — 语音输入输出，麦克风 push-to-talk |
| `WORKFLOW_SCRIPTS` | 工作流脚本 — 用户自定义自动化工作流 |
| `MCP_SKILLS` | 基于 MCP 的 Skill 加载机制 |

### 对话管理

| Flag | 用途 |
|------|------|
| `HISTORY_SNIP` | 历史裁剪 — 手动裁剪对话历史中的片段（`/force-snip`） |
| `ULTRAPLAN` | 超级计划 — 远程 Agent 协作的大规模规划功能 |
| `AGENT_MEMORY_SNAPSHOT` | Agent 运行时的记忆快照功能 |

### 基础设施 / 实验

| Flag | 用途 |
|------|------|
| `ABLATION_BASELINE` | 科学实验 — 基线消融测试，用于 A/B 实验对照组 |
| `HARD_FAIL` | 硬失败模式 — 遇错直接中断而非降级 |
| `TRANSCRIPT_CLASSIFIER` | 对话分类器 — `auto-mode` 命令，自动分析和分类对话记录 |
| `UPLOAD_USER_SETTINGS` | 设置同步上传 — 将本地配置同步到云端 |
| `LODESTONE` | 深度链接协议处理器 — 从外部应用跳转到 Claude Code 指定位置 |
| `EXPERIMENTAL_SKILL_SEARCH` | 实验性 Skill 搜索索引 |
| `TORCH` | Torch 功能（具体用途未知，可能是某种高亮/追踪机制） |

## 许可证

本项目仅供学习研究用途。Claude Code 的所有权利归 [Anthropic](https://www.anthropic.com/) 所有。
