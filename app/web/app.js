const state = {
  activeThreadId: null,
  automationCategory: "Status reports",
  automationComposer: null,
  automationNotice: "",
  automations: [],
  activeWorkspaceId: null,
  apiKeyDraft: "",
  apiKeyTouched: false,
  clearApiKey: false,
  composerAttachments: [],
  composerText: "",
  config: null,
  hotkeyCapture: false,
  importCandidates: [],
  libraryCatalog: null,
  libraryCategory: "all",
  libraryComposer: null,
  libraryNotice: "",
  libraryProvider: "all",
  librarySearch: "",
  librarySource: "all",
  libraryTab: "plugins",
  liveRuns: {},
  contextMenu: null,
  pendingPrompts: {},
  pollTokens: {},
  search: "",
  searchFocusRequested: false,
  searchSelectRequested: false,
  settingsDraft: null,
  settingsNotice: "",
  settingsSection: "general",
  threadNotice: "",
  threads: [],
  threadViewport: {},
  version: "",
  view: "chat",
  worktreeItems: [],
  workspaces: [],
  workspaceShowAll: {},
};

const sidebarElement = document.querySelector("#sidebar");
const screenElement = document.querySelector("#screen");
const menuLayerElement = document.createElement("div");
menuLayerElement.className = "context-menu-layer";
document.body.append(menuLayerElement);

const SETTINGS_SECTIONS = [
  ["general", "General", "通用"],
  ["appearance", "Appearance", "外观"],
  ["configuration", "Configuration", "配置"],
  ["models", "Models", "模型"],
  ["personalization", "Personalization", "个性化"],
  ["usage", "Usage", "使用"],
  ["mcp", "MCP servers", "MCP 服务"],
  ["git", "Git", "Git"],
  ["environments", "Environments", "环境"],
  ["worktrees", "Worktrees", "Worktrees"],
  ["archived", "Archived chats", "归档对话"],
];

const MODEL_SUGGESTIONS = [
  "claude-sonnet-4-6",
  "claude-opus-4-6",
  "claude-haiku-4-5-20251001",
  "sonnet",
  "opus",
  "haiku",
];

const AUTOMATION_CATEGORIES = [
  "Status reports",
  "Release prep",
  "Incidents & triage",
  "Code quality",
  "Repo maintenance",
  "Growth & exploration",
];

const AUTOMATION_TEMPLATES = [
  {
    category: "Status reports",
    descriptionEn: "Summarize yesterday's git activity for standup.",
    descriptionZh: "汇总昨天的 Git 活动，生成站会摘要。",
    frequency: "daily",
    icon: "●",
    id: "daily-standup",
    nameEn: "Daily standup digest",
    nameZh: "每日站会摘要",
    promptEn:
      "Summarize the last working day's repository activity for a standup update. Highlight key commits, file areas touched, likely risks, and suggested follow-ups.",
    promptZh:
      "总结最近一个工作日的仓库活动，生成站会更新。重点列出关键提交、涉及的文件区域、潜在风险和建议跟进项。",
    timeOfDay: "09:10",
  },
  {
    category: "Status reports",
    descriptionEn: "Turn this week's PRs, incidents, and reviews into a weekly update.",
    descriptionZh: "把本周 PR、故障与评审整理成周报。",
    frequency: "weekly",
    icon: "◆",
    id: "weekly-update",
    nameEn: "Weekly engineering update",
    nameZh: "每周工程更新",
    promptEn:
      "Create a concise weekly engineering update from recent repository activity. Group by shipping progress, notable fixes, and open risks. Keep it readable by non-technical stakeholders.",
    promptZh:
      "根据最近的仓库活动生成简洁的每周工程更新。按发布进展、重要修复和未解决风险分组，保证非技术人员也能看懂。",
    timeOfDay: "17:30",
    weekdays: [5],
  },
  {
    category: "Release prep",
    descriptionEn: "Draft release notes from merged changes.",
    descriptionZh: "根据已合并变更起草发布说明。",
    frequency: "weekly",
    icon: "✦",
    id: "release-notes",
    nameEn: "Release notes draft",
    nameZh: "发布说明草稿",
    promptEn:
      "Draft release notes from this week's repository changes. Group changes by user-facing feature, bug fix, and internal maintenance. Include short risk notes when relevant.",
    promptZh:
      "根据本周仓库变更起草发布说明。按用户可见功能、缺陷修复和内部维护分组，必要时补充简短风险提示。",
    timeOfDay: "16:00",
    weekdays: [5],
  },
  {
    category: "Release prep",
    descriptionEn: "Check change log, migrations, feature flags, and tests before tagging.",
    descriptionZh: "在打标签前检查变更日志、迁移、功能开关和测试。",
    frequency: "weekly",
    icon: "✓",
    id: "release-checklist",
    nameEn: "Release readiness check",
    nameZh: "发布准备检查",
    promptEn:
      "Review the repository for release readiness. Verify changelog updates, migration files, feature flags, and recent test signals. Return a short go/no-go checklist.",
    promptZh:
      "检查仓库是否具备发布条件。核对变更日志、迁移文件、功能开关和最近测试信号，输出简洁的放行/阻塞清单。",
    timeOfDay: "15:00",
    weekdays: [5],
  },
  {
    category: "Incidents & triage",
    descriptionEn: "Group recent failures by likely root cause and suggest minimal fixes.",
    descriptionZh: "按可能根因归类近期失败，并给出最小修复建议。",
    frequency: "daily",
    icon: "⚑",
    id: "incident-triage",
    nameEn: "Failure triage sweep",
    nameZh: "失败排查巡检",
    promptEn:
      "Inspect the latest repository and test activity for failures, flaky areas, or risky changes. Group them by likely root cause and suggest the smallest safe next fixes.",
    promptZh:
      "检查最近的仓库与测试活动，定位失败、波动区域或高风险改动。按可能根因分组，并给出最小且安全的后续修复建议。",
    timeOfDay: "10:00",
  },
  {
    category: "Code quality",
    descriptionEn: "Scan for hotspots, fragile files, and missing tests.",
    descriptionZh: "扫描热点、脆弱文件和缺失测试。",
    frequency: "weekly",
    icon: "◎",
    id: "quality-hotspots",
    nameEn: "Quality hotspot review",
    nameZh: "质量热点巡检",
    promptEn:
      "Review the most active and risky areas in the repository. Highlight fragile files, repeated churn, missing tests, and practical cleanup opportunities for the next week.",
    promptZh:
      "检查仓库中最活跃且风险较高的区域。指出脆弱文件、反复改动、缺失测试，以及下周值得做的实际清理机会。",
    timeOfDay: "14:00",
    weekdays: [3],
  },
  {
    category: "Repo maintenance",
    descriptionEn: "Surface stale branches, old chats, and workspaces that need cleanup.",
    descriptionZh: "找出需要清理的陈旧分支、旧对话和工作区。",
    frequency: "weekly",
    icon: "▣",
    id: "maintenance-cleanup",
    nameEn: "Cleanup radar",
    nameZh: "清理雷达",
    promptEn:
      "Review the current project workspace for stale branches, outdated automation profiles, archived chats, and worktree clutter. Recommend safe cleanup actions only.",
    promptZh:
      "检查当前项目工作区中的陈旧分支、过期自动化配置、归档对话和 worktree 杂项，只给出安全的清理建议。",
    timeOfDay: "11:30",
    weekdays: [1],
  },
  {
    category: "Growth & exploration",
    descriptionEn: "Look for experimental ideas and next-step opportunities from recent work.",
    descriptionZh: "从近期工作中挖掘实验方向和下一步机会。",
    frequency: "weekly",
    icon: "✳",
    id: "exploration-ideas",
    nameEn: "Exploration backlog",
    nameZh: "探索机会清单",
    promptEn:
      "Review recent repository activity and suggest a shortlist of experiments, product polish ideas, and technical investments worth exploring next.",
    promptZh:
      "复盘最近的仓库活动，提出一份值得继续探索的实验、产品打磨方向和技术投入建议清单。",
    timeOfDay: "18:00",
    weekdays: [5],
  },
];

const DEFAULT_CONFIG = {
  appearance: {
    codeFontFamily:
      '"Cascadia Code", "Cascadia Mono", "JetBrains Mono", "Consolas", "Sarasa Mono SC", monospace',
    codeFontSize: 12,
    darkTheme: {
      accent: "#339CFF",
      background: "#181818",
      contrast: 60,
      foreground: "#FFFFFF",
      name: "Glaude Dark",
      translucentSidebar: true,
    },
    lightTheme: {
      accent: "#339CFF",
      background: "#FFFFFF",
      contrast: 45,
      foreground: "#1A1C1F",
      name: "Glaude Light",
      translucentSidebar: true,
    },
    pointerCursor: true,
    themeMode: "system",
    uiFontFamily:
      '"Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei UI", sans-serif',
    uiFontSize: 13,
  },
  autoOpenBrowser: true,
  configuration: {
    approvalPolicy: "on-request",
    configScope: "user",
    sandboxMode: "workspace-write",
  },
  defaultModel: "",
  defaultModelProfileId: "",
  defaultPermissionMode: "default",
  environments: [],
  general: {
    agentEnvironment: "windowsNative",
    codeReviewMode: "inline",
    defaultOpenDestination: "fileExplorer",
    followUpBehavior: "queue",
    integratedTerminalShell: "powershell",
    language: "auto",
    notifications: {
      completion: "onlyWhenUnfocused",
      permission: true,
      question: true,
    },
    popupWindowHotkey: "",
    requireCtrlEnterForLongPrompts: false,
    speed: "standard",
    threadDetail: "steps",
  },
  git: {
    alwaysForcePush: false,
    branchPrefix: "glaude/",
    commitInstructions: "",
    createDraftPullRequests: false,
    pullRequestInstructions: "",
    pullRequestMergeMethod: "merge",
    showPrIcons: false,
  },
  hasApiKey: false,
  includeThinking: false,
  mcpServers: [],
  modelProfiles: [],
  personalization: {
    customInstructions: "",
    personality: "pragmatic",
  },
  port: 43120,
  usage: {
    autoReloadCredit: false,
    autoReloadThreshold: 10,
    creditRemaining: 0,
    fiveHourLimit: 100,
    weeklyLimit: 400,
  },
  workingDirectory: "",
  worktrees: {
    autoDeleteLimit: 15,
    autoDeleteOldWorktrees: true,
  },
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mergeConfig(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    appearance: {
      ...DEFAULT_CONFIG.appearance,
      ...(config.appearance || {}),
      darkTheme: {
        ...DEFAULT_CONFIG.appearance.darkTheme,
        ...(config.appearance?.darkTheme || {}),
      },
      lightTheme: {
        ...DEFAULT_CONFIG.appearance.lightTheme,
        ...(config.appearance?.lightTheme || {}),
      },
    },
    configuration: {
      ...DEFAULT_CONFIG.configuration,
      ...(config.configuration || {}),
    },
    general: {
      ...DEFAULT_CONFIG.general,
      ...(config.general || {}),
      notifications: {
        ...DEFAULT_CONFIG.general.notifications,
        ...(config.general?.notifications || {}),
      },
    },
    git: {
      ...DEFAULT_CONFIG.git,
      ...(config.git || {}),
    },
    personalization: {
      ...DEFAULT_CONFIG.personalization,
      ...(config.personalization || {}),
    },
    usage: {
      ...DEFAULT_CONFIG.usage,
      ...(config.usage || {}),
    },
    worktrees: {
      ...DEFAULT_CONFIG.worktrees,
      ...(config.worktrees || {}),
    },
    environments: Array.isArray(config.environments) ? config.environments : [],
    mcpServers: Array.isArray(config.mcpServers) ? config.mcpServers : [],
    modelProfiles: Array.isArray(config.modelProfiles)
      ? config.modelProfiles.map((profile, index) => ({
          apiKey: "",
          apiModel: "",
          baseUrl: "",
          id: profile?.id || `model-${index + 1}`,
          name: profile?.name || `Model ${index + 1}`,
          protocol: profile?.protocol || "anthropic",
          ...profile,
        }))
      : [],
  };
}

function draftConfig() {
  return state.settingsDraft || state.config || mergeConfig();
}

function currentLanguage(preferred = draftConfig().general?.language) {
  if (preferred === "zh-CN" || preferred === "en-US") {
    return preferred;
  }
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

function t(en, zh) {
  return currentLanguage() === "zh-CN" ? zh : en;
}

function relativeTime(value) {
  if (!value) {
    return "";
  }
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return t("just now", "刚刚");
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  return weeks < 5 ? `${weeks}w` : `${Math.round(days / 30)}mo`;
}

function byUpdated(items) {
  return [...items].sort((left, right) => {
    const leftValue = left?.updatedAt || left?.createdAt || "";
    const rightValue = right?.updatedAt || right?.createdAt || "";
    return rightValue.localeCompare(leftValue);
  });
}

function rgb(hex) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) {
    return { r: 26, g: 28, b: 31 };
  }
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(from, to, weight) {
  const left = rgb(from);
  const right = rgb(to);
  const blend = (a, b) =>
    Math.round(a + (b - a) * Math.max(0, Math.min(1, Number(weight) || 0)));
  return `rgb(${blend(left.r, right.r)}, ${blend(left.g, right.g)}, ${blend(left.b, right.b)})`;
}

function applyAppearance(config = draftConfig()) {
  const merged = mergeConfig(config);
  const dark =
    merged.appearance.themeMode === "dark" ||
    (merged.appearance.themeMode === "system" &&
      (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false));
  const theme = dark ? merged.appearance.darkTheme : merged.appearance.lightTheme;
  const contrast = Math.max(0, Math.min(1, Number(theme.contrast || 0) / 100));
  const root = document.documentElement;

  const vars = {
    "--font-sans": merged.appearance.uiFontFamily,
    "--font-mono": merged.appearance.codeFontFamily,
    "--ui-font-size": `${merged.appearance.uiFontSize}px`,
    "--code-font-size": `${merged.appearance.codeFontSize}px`,
    "--bg": theme.background,
    "--bg-deep": mix(theme.background, theme.foreground, dark ? 0.12 : 0.04),
    "--panel-solid": theme.background,
    "--panel": rgba(theme.background, dark ? 0.88 : 0.9),
    "--sidebar": rgba(
      theme.background,
      theme.translucentSidebar ? (dark ? 0.72 : 0.78) : 0.96,
    ),
    "--text": theme.foreground,
    "--muted": mix(theme.foreground, theme.background, dark ? 0.48 : 0.56),
    "--accent": theme.accent,
    "--accent-strong": theme.accent,
    "--accent-soft": rgba(theme.accent, 0.12),
    "--line": rgba(theme.foreground, 0.08 + contrast * 0.08),
    "--line-strong": rgba(theme.foreground, 0.16 + contrast * 0.12),
    "--shadow": dark
      ? "0 20px 48px rgba(0, 0, 0, 0.3)"
      : `0 20px 48px ${rgba(theme.foreground, 0.06 + contrast * 0.05)}`,
  };

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  document.body.dataset.theme = dark ? "dark" : "light";
  document.body.dataset.pointerCursors = merged.appearance.pointerCursor ? "on" : "off";
  document.documentElement.lang = currentLanguage(merged.general.language);
}

function workspaceById(workspaceId) {
  return state.workspaces.find((workspace) => workspace.id === workspaceId) || null;
}

function activeThreads() {
  return state.threads.filter((thread) => !thread.archivedAt);
}

function archivedThreads() {
  return byUpdated(state.threads.filter((thread) => Boolean(thread.archivedAt)));
}

function currentThread() {
  return activeThreads().find((thread) => thread.id === state.activeThreadId) || null;
}

function currentWorkspace() {
  const thread = currentThread();
  if (thread) {
    return workspaceById(thread.workspaceId);
  }
  return workspaceById(state.activeWorkspaceId) || state.workspaces[0] || null;
}

function urlParams() {
  return new URLSearchParams(window.location.search);
}

function isMiniWindow() {
  return urlParams().get("mini") === "1";
}

function applyWindowMode() {
  document.body.dataset.miniWindow = isMiniWindow() ? "on" : "off";
}

function threadPath(thread) {
  return (
    thread?.cwd ||
    workspaceById(thread?.workspaceId)?.cwd ||
    state.config?.workingDirectory ||
    ""
  );
}

function canDeleteWorkspace(workspace) {
  return Boolean(workspace?.id) && workspace.cwd !== state.config?.workingDirectory;
}

function clearThreadNotice() {
  state.threadNotice = "";
}

function closeContextMenu() {
  state.contextMenu = null;
}

function openContextMenu(menu) {
  state.contextMenu = menu;
}

function toggleContextMenu(menu) {
  const current = state.contextMenu;
  if (
    current &&
    current.kind === menu.kind &&
    current.targetId === menu.targetId &&
    current.source === menu.source
  ) {
    closeContextMenu();
    return false;
  }
  openContextMenu(menu);
  return true;
}

function menuPositionFromElement(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.right - 8,
    y: rect.bottom + 6,
  };
}

function contextMenuItems(menu) {
  if (!menu) {
    return [];
  }

  if (menu.kind === "workspace") {
    const workspace = workspaceById(menu.targetId);
    if (!workspace) {
      return [];
    }
    return [
      { action: "new-thread-workspace", dataset: { workspaceId: workspace.id }, label: t("New chat", "新对话") },
      { action: "open-system-path", dataset: { path: workspace.cwd }, label: t("Open folder", "打开文件夹") },
      { action: "rename-workspace", dataset: { workspaceId: workspace.id }, label: t("Rename folder", "重命名文件夹") },
      { action: "pick-workspace-directory", dataset: { workspaceId: workspace.id }, label: t("Change folder", "更换文件夹") },
      ...(canDeleteWorkspace(workspace)
        ? [
            {
              action: "delete-workspace",
              dataset: { workspaceId: workspace.id },
              label: t("Delete folder", "删除文件夹"),
              danger: true,
            },
          ]
        : []),
    ];
  }

  if (menu.kind === "thread") {
    const thread = state.threads.find((item) => item.id === menu.targetId);
    if (!thread) {
      return [];
    }
    return [
      { action: "select-thread", dataset: { threadId: thread.id }, label: t("Open chat", "打开对话") },
      { action: "rename-thread", dataset: { threadId: thread.id }, label: t("Rename chat", "重命名对话") },
      { action: "open-system-path", dataset: { path: threadPath(thread) }, label: t("Open folder", "打开文件夹") },
      {
        action: "archive-thread",
        dataset: { threadId: thread.id },
        label: t(thread.archivedAt ? "Restore chat" : "Archive chat", thread.archivedAt ? "恢复对话" : "归档对话"),
      },
      {
        action: "delete-thread",
        dataset: { threadId: thread.id },
        label: t("Delete chat", "删除对话"),
        danger: true,
      },
    ];
  }

  return [];
}

function renderContextMenu() {
  const menu = state.contextMenu;
  const items = contextMenuItems(menu);
  if (!menu || !items.length) {
    menuLayerElement.innerHTML = "";
    menuLayerElement.classList.remove("context-menu-layer--open");
    return;
  }

  menuLayerElement.classList.add("context-menu-layer--open");
  menuLayerElement.innerHTML = `
    <div class="context-menu" style="left:${Math.round(menu.x)}px;top:${Math.round(menu.y)}px;">
      ${items
        .map((item) => {
          const dataset = Object.entries(item.dataset || {})
            .map(([key, value]) => `data-${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}="${esc(String(value))}"`)
            .join(" ");
          return `
            <button class="context-menu__item ${item.danger ? "context-menu__item--danger" : ""}" data-action="${item.action}" ${dataset}>
              <span>${esc(item.label)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  const menuElement = menuLayerElement.querySelector(".context-menu");
  if (!menuElement) {
    return;
  }

  const rect = menuElement.getBoundingClientRect();
  const nextLeft = Math.min(menu.x, window.innerWidth - rect.width - 12);
  const nextTop = Math.min(menu.y, window.innerHeight - rect.height - 12);
  menuElement.style.left = `${Math.max(12, nextLeft)}px`;
  menuElement.style.top = `${Math.max(12, nextTop)}px`;
}

function threadSummary(thread) {
  const latest = [...(thread.messages || [])]
    .reverse()
    .find((message) => String(message.displayText || message.text || "").trim());
  return latest
    ? String(latest.displayText || latest.text || "").replace(/\s+/g, " ").trim()
    : t("No messages yet", "还没有消息");
}

function messageDisplayText(message) {
  return String(message?.displayText || message?.text || "");
}

function attachmentSummaryLabel(attachment) {
  if (!attachment) {
    return "";
  }
  const suffix = attachment.kind === "text" ? "" : ` ${t("(binary)", "(二进制)")}`;
  return `${attachment.name || "file"}${suffix}`;
}

function liveRun(threadId) {
  return state.liveRuns[threadId] || null;
}

function liveRunStatusText(live) {
  if (!live) {
    return "";
  }
  if (live.error) {
    return t("Run failed", "运行失败");
  }
  if (live.lastTool) {
    return t(`Running tool: ${live.lastTool}`, `正在调用工具：${live.lastTool}`);
  }
  if (live.status === "starting") {
    return t("Starting model...", "模型启动中...");
  }
  if (live.status === "completed") {
    return t("Finalizing response...", "正在整理回复...");
  }
  return t("Model is running...", "模型正在运行...");
}

function liveRunHelperText(live) {
  if (!live || live.error) {
    return "";
  }
  if (live.lastTool) {
    return t(
      "The model is operating in the current workspace. The result will appear here automatically.",
      "模型正在当前工作区执行操作，结果会自动显示在这里。",
    );
  }
  return t(
    "The reply is being generated. You can wait here or stop the run at any time.",
    "回复正在生成中。你可以在这里等待，也可以随时停止本次运行。",
  );
}

function currentMessagesElement() {
  const element = document.querySelector("#messages");
  return element instanceof HTMLElement ? element : null;
}

function saveThreadViewport(threadId = currentThread()?.id, messages = currentMessagesElement()) {
  if (!messages || !threadId) {
    return null;
  }
  const maxScrollTop = Math.max(0, messages.scrollHeight - messages.clientHeight);
  const scrollTop = Math.max(0, Math.min(messages.scrollTop, maxScrollTop));
  const distanceFromBottom = maxScrollTop - scrollTop;
  state.threadViewport[threadId] = {
    atBottom: distanceFromBottom <= 40,
    distanceFromBottom,
    scrollTop,
    threadId,
  };
  return state.threadViewport[threadId];
}

function restoreThreadViewport(threadId) {
  const snapshot = state.threadViewport[threadId] || null;
  const messages = currentMessagesElement();
  if (!messages) {
    return;
  }
  requestAnimationFrame(() => {
    const maxScrollTop = Math.max(0, messages.scrollHeight - messages.clientHeight);
    if (!snapshot || snapshot.atBottom) {
      messages.scrollTop = maxScrollTop;
      return;
    }
    messages.scrollTop = Math.max(0, Math.min(snapshot.scrollTop, maxScrollTop));
  });
}

function stickThreadViewportToBottom(threadId = currentThread()?.id) {
  if (!threadId) {
    return;
  }
  state.threadViewport[threadId] = {
    atBottom: true,
    distanceFromBottom: 0,
    scrollTop: Number.MAX_SAFE_INTEGER,
    threadId,
  };
}

function modelProfiles() {
  return Array.isArray(draftConfig().modelProfiles) ? draftConfig().modelProfiles : [];
}

function getModelProfile(profileId) {
  return modelProfiles().find((profile) => profile.id === profileId) || null;
}

function normalizeModelValue(value) {
  return String(value || "").trim();
}

function isOpenAICompatibleProfile(profile) {
  return profile?.protocol === "openai";
}

function shouldUseProfileModelForOpenAI(threadModel, profile) {
  const normalizedThreadModel = normalizeModelValue(threadModel);
  const profileModel = normalizeModelValue(profile?.apiModel);
  if (!profile || !profileModel) {
    return false;
  }
  if (!normalizedThreadModel) {
    return true;
  }
  if (normalizedThreadModel === profileModel) {
    return false;
  }
  if (
    normalizeModelValue(draftConfig().defaultModelProfileId) === profile.id &&
    normalizedThreadModel === normalizeModelValue(draftConfig().defaultModel)
  ) {
    return true;
  }
  if (
    modelProfiles().some(
      (candidate) =>
        candidate.id !== profile.id &&
        normalizeModelValue(candidate.apiModel) === normalizedThreadModel,
    )
  ) {
    return true;
  }
  if (/^[^/\s]+(?:\/[^/\s]+){1,}$/i.test(normalizedThreadModel)) {
    return true;
  }
  return (
    MODEL_SUGGESTIONS.includes(normalizedThreadModel) ||
    /^claude[-/]/i.test(normalizedThreadModel)
  );
}

function effectiveThreadModelInputValue(thread, profileId = effectiveModelProfileId(thread)) {
  const profile = getModelProfile(profileId);
  const threadModel = normalizeModelValue(thread?.model);
  if (isOpenAICompatibleProfile(profile)) {
    const profileModel = normalizeModelValue(profile?.apiModel);
    if (profileModel && shouldUseProfileModelForOpenAI(threadModel, profile)) {
      return profileModel;
    }
    return threadModel || profileModel;
  }
  return threadModel;
}

function modelOptionsForThread(thread) {
  const selectedProfile = getModelProfile(effectiveModelProfileId(thread));
  return Array.from(
    new Set(
      [
        ...MODEL_SUGGESTIONS,
        effectiveThreadModelInputValue(thread),
        ...(selectedProfile?.apiModel ? [selectedProfile.apiModel] : []),
        ...modelProfiles().map((profile) => profile.apiModel),
      ]
        .map((value) => normalizeModelValue(value))
        .filter(Boolean),
    ),
  );
}

function submittedThreadModel(thread, modelProfileId, rawValue) {
  const selectedProfile = getModelProfile(modelProfileId || effectiveModelProfileId(thread));
  const typedValue = normalizeModelValue(rawValue);
  if (typedValue) {
    return typedValue;
  }
  if (isOpenAICompatibleProfile(selectedProfile)) {
    return normalizeModelValue(selectedProfile?.apiModel);
  }
  return "";
}

function effectiveModelProfileId(thread) {
  return thread?.modelProfileId || draftConfig().defaultModelProfileId || "";
}

function modelProfileLabel(thread) {
  const profile = getModelProfile(effectiveModelProfileId(thread));
  return profile?.name || profile?.apiModel || t("No profile", "未选择模型组");
}

function selectedThreadProfile(thread) {
  return getModelProfile(effectiveModelProfileId(thread));
}

function supportsThreadContextCompact(thread) {
  return isOpenAICompatibleProfile(selectedThreadProfile(thread));
}

function compactSummaryLabel(thread) {
  const count = Number(thread?.compactedMessageCount || 0);
  if (count > 0) {
    return t(
      `Earlier context was summarized. ${count} messages were compressed.`,
      `较早的上下文已被总结压缩，共压缩 ${count} 条消息。`,
    );
  }
  return t(
    "Earlier context was summarized for future turns.",
    "较早的上下文已经总结压缩，供后续对话继续使用。",
  );
}

function automationTemplateLabel(template) {
  return t(template.nameEn, template.nameZh);
}

function automationTemplateDescription(template) {
  return t(template.descriptionEn, template.descriptionZh);
}

function automationTemplatesForCategory(category = state.automationCategory) {
  return AUTOMATION_TEMPLATES.filter((template) => template.category === category);
}

function weekdayLabel(day) {
  return [
    t("Sun", "周日"),
    t("Mon", "周一"),
    t("Tue", "周二"),
    t("Wed", "周三"),
    t("Thu", "周四"),
    t("Fri", "周五"),
    t("Sat", "周六"),
  ][day] || String(day);
}

function formatAutomationFrequency(automation) {
  if (automation.frequency === "hourly") {
    const hours = Math.max(1, Number(automation.intervalHours || 1));
    return t(`Every ${hours}h`, `每 ${hours} 小时`);
  }
  if (automation.frequency === "weekly") {
    const weekdays = Array.isArray(automation.weekdays) && automation.weekdays.length
      ? automation.weekdays.map((day) => weekdayLabel(day)).join(" / ")
      : weekdayLabel(1);
    return `${weekdays} ${automation.timeOfDay || "09:00"}`;
  }
  return `${t("Daily", "每天")} ${automation.timeOfDay || "09:00"}`;
}

function formatAutomationRunAt(value) {
  if (!value) {
    return t("Not scheduled", "未安排");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("Invalid time", "时间无效");
  }
  return date.toLocaleString(currentLanguage() === "zh-CN" ? "zh-CN" : "en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function automationsByUpdated() {
  return [...(state.automations || [])].sort((left, right) => {
    const leftValue = left?.updatedAt || left?.createdAt || "";
    const rightValue = right?.updatedAt || right?.createdAt || "";
    return rightValue.localeCompare(leftValue);
  });
}

function automationWorkspaceName(automation) {
  return workspaceById(automation.workspaceId)?.name || t("Unknown workspace", "未知工作区");
}

function defaultAutomationComposer(template = null) {
  const workspace = currentWorkspace() || state.workspaces[0] || null;
  return {
    category: template?.category || state.automationCategory || AUTOMATION_CATEGORIES[0],
    description: template ? automationTemplateDescription(template) : "",
    enabled: true,
    frequency: template?.frequency || "daily",
    id: template?.id || "",
    intervalHours: template?.intervalHours || 24,
    mode: "create",
    modelProfileId: "",
    name: template ? automationTemplateLabel(template) : "",
    permissionMode: "",
    prompt: template ? t(template.promptEn, template.promptZh) : "",
    sourceAutomationId: "",
    timeOfDay: template?.timeOfDay || "09:00",
    weekdays: Array.isArray(template?.weekdays) ? [...template.weekdays] : [1],
    workspaceId: workspace?.id || "",
  };
}

function automationById(automationId) {
  return state.automations.find((automation) => automation.id === automationId) || null;
}

function upsertAutomation(automation) {
  const index = state.automations.findIndex((item) => item.id === automation.id);
  if (index === -1) {
    state.automations.push(automation);
  } else {
    state.automations[index] = automation;
  }
}

function removeAutomation(automationId) {
  state.automations = state.automations.filter((automation) => automation.id !== automationId);
}

function searchNeedle() {
  return String(state.search || "").trim().toLowerCase();
}

function matchesSearchText(...values) {
  const needle = searchNeedle();
  if (!needle) {
    return true;
  }
  return values
    .flat()
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

function allSearchThreads() {
  return byUpdated(state.threads);
}

function searchableThreads() {
  return allSearchThreads()
    .filter((thread) =>
      matchesSearchText(
        thread.title,
        threadSummary(thread),
        workspaceById(thread.workspaceId)?.name,
        threadPath(thread),
      ),
    )
    .slice(0, 12);
}

function nextSearchableThread(offset) {
  const threads = activeThreads();
  if (!threads.length) {
    return null;
  }
  const index = threads.findIndex((thread) => thread.id === state.activeThreadId);
  const nextIndex = index === -1 ? 0 : (index + offset + threads.length) % threads.length;
  return threads[nextIndex] || null;
}

function searchCommands() {
  const hasThread = Boolean(currentThread());
  return [
    {
      groupEn: "App",
      groupZh: "应用",
      id: "cmd-new-chat",
      keywords: ["new", "chat", "thread", "create"],
      shortcut: "Ctrl+N",
      subtitleEn: "Create a new chat in the current workspace",
      subtitleZh: "在当前工作区新建一个对话",
      titleEn: "New chat",
      titleZh: "新建对话",
    },
    {
      groupEn: "App",
      groupZh: "应用",
      id: "cmd-open-folder",
      keywords: ["folder", "workspace", "directory", "open"],
      shortcut: "Ctrl+O",
      subtitleEn: "Add or switch to another workspace folder",
      subtitleZh: "添加或切换到另一个工作区文件夹",
      titleEn: "Open folder",
      titleZh: "打开文件夹",
    },
    {
      groupEn: "App",
      groupZh: "应用",
      id: "cmd-open-settings",
      keywords: ["settings", "config", "preferences"],
      shortcut: "Ctrl+,",
      subtitleEn: "Open app settings",
      subtitleZh: "打开应用设置",
      titleEn: "Settings",
      titleZh: "设置",
    },
    {
      groupEn: "Chat",
      groupZh: "聊天",
      id: "cmd-new-quick-chat",
      keywords: ["quick", "chat", "new", "message"],
      shortcut: "Ctrl+Alt+N",
      subtitleEn: "Start a fresh chat and jump into it immediately",
      subtitleZh: "新建一个对话并立即进入",
      titleEn: "New quick chat",
      titleZh: "新建快速对话",
    },
    {
      disabled: !hasThread,
      groupEn: "Chat",
      groupZh: "聊天",
      id: "cmd-open-mini-window",
      keywords: ["mini", "window", "popup", "thread"],
      shortcut: "",
      subtitleEn: "Open the current chat in a compact pop-out window",
      subtitleZh: "把当前对话打开到一个更紧凑的弹出窗口",
      titleEn: "Open in mini window",
      titleZh: "在迷你窗口中打开",
    },
    {
      disabled: activeThreads().length < 2,
      groupEn: "Navigation",
      groupZh: "导航",
      id: "cmd-prev-chat",
      keywords: ["previous", "prev", "chat", "thread"],
      shortcut: "Ctrl+Shift+[",
      subtitleEn: "Go to the previous chat",
      subtitleZh: "跳转到上一个对话",
      titleEn: "Previous chat",
      titleZh: "上一个对话",
    },
    {
      disabled: activeThreads().length < 2,
      groupEn: "Navigation",
      groupZh: "导航",
      id: "cmd-next-chat",
      keywords: ["next", "chat", "thread"],
      shortcut: "Ctrl+Shift+]",
      subtitleEn: "Go to the next chat",
      subtitleZh: "跳转到下一个对话",
      titleEn: "Next chat",
      titleZh: "下一个对话",
    },
    {
      groupEn: "Navigation",
      groupZh: "导航",
      id: "cmd-focus-find",
      keywords: ["find", "search", "focus", "command"],
      shortcut: "Ctrl+F",
      subtitleEn: "Focus the search field",
      subtitleZh: "聚焦搜索输入框",
      titleEn: "Find",
      titleZh: "查找",
    },
  ]
    .filter((command) =>
      matchesSearchText(
        command.titleEn,
        command.titleZh,
        command.subtitleEn,
        command.subtitleZh,
        command.keywords,
      ),
    )
    .filter((command) => !command.disabled || !searchNeedle());
}

function groupSearchCommands() {
  return searchCommands().reduce((groups, command) => {
    const key = command.groupEn;
    if (!groups[key]) {
      groups[key] = {
        en: command.groupEn,
        items: [],
        zh: command.groupZh,
      };
    }
    groups[key].items.push(command);
    return groups;
  }, {});
}

function libraryPlugins() {
  return Array.isArray(state.libraryCatalog?.plugins) ? state.libraryCatalog.plugins : [];
}

function librarySkills() {
  return Array.isArray(state.libraryCatalog?.skills) ? state.libraryCatalog.skills : [];
}

function libraryRoots() {
  return state.libraryCatalog || {
    pluginRoots: {},
    skillRoots: {},
  };
}

function matchesLibrarySearch(item) {
  const needle = (state.librarySearch || "").trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [item.name, item.description, item.category, item.group, item.provider, item.slug]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

function filteredLibraryPlugins() {
  return libraryPlugins().filter((item) => {
    if (state.libraryProvider !== "all" && item.provider !== state.libraryProvider) {
      return false;
    }
    if (state.libraryCategory !== "all" && item.category !== state.libraryCategory) {
      return false;
    }
    return matchesLibrarySearch(item);
  });
}

function filteredLibrarySkills() {
  return librarySkills().filter((item) => {
    if (state.librarySource !== "all" && item.group !== state.librarySource) {
      return false;
    }
    return matchesLibrarySearch(item);
  });
}

function groupItems(items, key) {
  return items.reduce((groups, item) => {
    const bucket = item[key] || t("Other", "其他");
    if (!groups[bucket]) {
      groups[bucket] = [];
    }
    groups[bucket].push(item);
    return groups;
  }, {});
}

function orderGroupedEntries(groups, preferredOrder = []) {
  return Object.entries(groups).sort(([left], [right]) => {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);
    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) {
        return 1;
      }
      if (rightIndex === -1) {
        return -1;
      }
      return leftIndex - rightIndex;
    }
    return left.localeCompare(right);
  });
}

function defaultLibraryComposer(kind = state.libraryTab === "skills" ? "skill" : "plugin") {
  return {
    description:
      kind === "skill"
        ? "Local skill created from Glaude Vibe Coder."
        : "Local plugin created from Glaude Vibe Coder.",
    kind,
    name: "",
    slug: "",
  };
}

function ensureSelection() {
  const thread = activeThreads().find((item) => item.id === state.activeThreadId);
  if (thread) {
    state.activeWorkspaceId = thread.workspaceId;
    return;
  }
  const workspace =
    workspaceById(state.activeWorkspaceId) ||
    workspaceById(activeThreads()[0]?.workspaceId) ||
    state.workspaces[0] ||
    null;
  state.activeWorkspaceId = workspace?.id || null;
  state.activeThreadId = null;
  clearThreadNotice();
}

function upsertWorkspace(workspace) {
  const index = state.workspaces.findIndex((item) => item.id === workspace.id);
  if (index === -1) {
    state.workspaces.push(workspace);
  } else {
    state.workspaces[index] = workspace;
  }
  state.workspaces = byUpdated(state.workspaces);
}

function upsertThread(thread) {
  const index = state.threads.findIndex((item) => item.id === thread.id);
  if (index === -1) {
    state.threads.push(thread);
  } else {
    state.threads[index] = thread;
  }
  state.threads = byUpdated(state.threads);
}

function removeThread(threadId) {
  state.threads = state.threads.filter((thread) => thread.id !== threadId);
  delete state.liveRuns[threadId];
  delete state.pendingPrompts[threadId];
  delete state.pollTokens[threadId];
  if (state.activeThreadId === threadId) {
    clearThreadNotice();
  }
}

function removeWorkspace(workspaceId) {
  const relatedThreadIds = state.threads
    .filter((thread) => thread.workspaceId === workspaceId)
    .map((thread) => thread.id);
  relatedThreadIds.forEach((threadId) => removeThread(threadId));
  state.workspaces = state.workspaces.filter((workspace) => workspace.id !== workspaceId);
  ensureSelection();
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getValue(source, path, fallback = "") {
  const result = path.split(".").reduce((current, key) => current?.[key], source);
  return result === undefined ? fallback : result;
}

function setValue(source, path, value) {
  const keys = path.split(".");
  let current = source;
  keys.slice(0, -1).forEach((key) => {
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  });
  current[keys.at(-1)] = value;
}

function setDraftValue(path, value) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  setValue(state.settingsDraft, path, value);
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
  applyAppearance(state.settingsDraft);
}

function upsertMcpServerDraft(serverId, changes) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  const servers = [...state.settingsDraft.mcpServers];
  const index = servers.findIndex((server) => server.id === serverId);
  if (index === -1) {
    servers.push({
      authenticated: false,
      builtIn: false,
      command: "",
      enabled: true,
      id: serverId,
      name: serverId,
      notes: "",
      requiresAuth: false,
      ...changes,
    });
  } else {
    servers[index] = {
      ...servers[index],
      ...changes,
    };
  }
  state.settingsDraft.mcpServers = servers;
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

function updateEnvironmentDraft(workspaceId, changes) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  const profiles = [...state.settingsDraft.environments];
  const index = profiles.findIndex((profile) => profile.workspaceId === workspaceId);
  if (index === -1) {
    profiles.push({
      notes: "",
      shell: "powershell",
      startupCommand: "",
      workspaceId,
      ...changes,
    });
  } else {
    profiles[index] = {
      ...profiles[index],
      ...changes,
    };
  }
  state.settingsDraft.environments = profiles;
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

function removeEnvironmentDraft(workspaceId) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  state.settingsDraft.environments = state.settingsDraft.environments.filter(
    (profile) => profile.workspaceId !== workspaceId,
  );
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

function addModelProfileDraft() {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  state.settingsDraft.modelProfiles = [
    ...state.settingsDraft.modelProfiles,
    {
      apiKey: "",
      apiModel: "",
      baseUrl: "",
      id: crypto.randomUUID(),
      name: `Model ${state.settingsDraft.modelProfiles.length + 1}`,
      protocol: "anthropic",
    },
  ];
  if (!state.settingsDraft.defaultModelProfileId) {
    state.settingsDraft.defaultModelProfileId = state.settingsDraft.modelProfiles[0]?.id || "";
  }
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

function updateModelProfileDraft(profileId, changes) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  state.settingsDraft.modelProfiles = state.settingsDraft.modelProfiles.map((profile) =>
    profile.id === profileId ? { ...profile, ...changes } : profile,
  );
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

function removeModelProfileDraft(profileId) {
  state.settingsDraft = mergeConfig(clone(draftConfig()));
  state.settingsDraft.modelProfiles = state.settingsDraft.modelProfiles.filter(
    (profile) => profile.id !== profileId,
  );
  if (state.settingsDraft.defaultModelProfileId === profileId) {
    state.settingsDraft.defaultModelProfileId = state.settingsDraft.modelProfiles[0]?.id || "";
  }
  state.settingsNotice = t("Unsaved changes", "有未保存更改");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
    body:
      options.body === undefined || typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

async function saveSettings() {
  const payload = clone(draftConfig());
  if (state.apiKeyTouched) {
    payload.apiKey = state.clearApiKey ? "" : state.apiKeyDraft.trim();
  }
  const response = await requestJson("/api/config", {
    method: "POST",
    body: payload,
  });
  state.config = mergeConfig(response.config || {});
  state.settingsDraft = clone(state.config);
  state.apiKeyDraft = "";
  state.apiKeyTouched = false;
  state.clearApiKey = false;
  state.settingsNotice = t("Saved", "已保存");
  applyAppearance(state.config);
  render();
}

async function loadImportCandidates() {
  const response = await requestJson("/api/config/importable");
  state.importCandidates = Array.isArray(response.sources) ? response.sources : [];
  render();
}

async function importConfig(sourceId) {
  const response = await requestJson("/api/config/import", {
    method: "POST",
    body: {
      sourceId,
    },
  });
  state.config = mergeConfig(response.config || {});
  state.settingsDraft = clone(state.config);
  state.settingsNotice = t("Imported", "已导入");
  applyAppearance(state.config);
  render();
}

async function loadWorktrees() {
  const response = await requestJson("/api/worktrees");
  state.worktreeItems = Array.isArray(response.items) ? response.items : [];
  render();
}

async function loadLibraryCatalog() {
  const response = await requestJson("/api/library/catalog");
  state.libraryCatalog = {
    pluginRoots: response.pluginRoots || {},
    plugins: Array.isArray(response.plugins) ? response.plugins : [],
    skillRoots: response.skillRoots || {},
    skills: Array.isArray(response.skills) ? response.skills : [],
  };
  render();
}

async function bootstrap() {
  const payload = await requestJson("/api/bootstrap");
  applyWindowMode();
  state.config = mergeConfig(payload.config || {});
  state.settingsDraft = clone(state.config);
  state.automations = Array.isArray(payload.automations) ? payload.automations : [];
  state.threads = byUpdated(payload.threads || []);
  state.workspaces = byUpdated(payload.workspaces || []);
  state.version = payload.version || "";
  const params = urlParams();
  const threadId = params.get("thread");
  const workspaceId = params.get("workspace");
  const view = params.get("view");
  if (threadId && state.threads.some((thread) => thread.id === threadId)) {
    state.activeThreadId = threadId;
  }
  if (workspaceId && state.workspaces.some((workspace) => workspace.id === workspaceId)) {
    state.activeWorkspaceId = workspaceId;
  }
  if (view === "search" || view === "chat" || view === "plugins" || view === "automations" || view === "settings") {
    state.view = view;
  }
  ensureSelection();
  applyAppearance(state.config);
  render();
  activeThreads()
    .filter((thread) => thread.status === "running")
    .forEach((thread) => {
      void pollThread(thread.id);
    });
}

async function pickDirectory(initialPath = "") {
  const payload = await requestJson("/api/system/pick-directory", {
    method: "POST",
    body: {
      initialPath,
    },
  });
  return payload.canceled ? "" : payload.path || "";
}

async function openSystemPath(path) {
  if (!path) {
    return;
  }
  await requestJson("/api/system/open-path", {
    method: "POST",
    body: {
      path,
    },
  });
}

async function createLibrarySkill(payload) {
  const response = await requestJson("/api/library/skills", {
    method: "POST",
    body: payload,
  });
  state.libraryNotice = t("Skill created", "技能已创建");
  await loadLibraryCatalog();
  if (response.path) {
    await openSystemPath(response.path);
  }
}

async function createLibraryPlugin(payload) {
  const response = await requestJson("/api/library/plugins", {
    method: "POST",
    body: payload,
  });
  state.libraryNotice = t("Plugin created", "插件已创建");
  await loadLibraryCatalog();
  if (response.path) {
    await openSystemPath(response.path);
  }
}

async function createWorkspace(payload) {
  const response = await requestJson("/api/workspaces", {
    method: "POST",
    body: payload,
  });
  upsertWorkspace(response.workspace);
  state.activeWorkspaceId = response.workspace.id;
  return response.workspace;
}

async function updateWorkspace(workspaceId, payload) {
  const response = await requestJson(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "PATCH",
    body: payload,
  });
  upsertWorkspace(response.workspace);
  return response.workspace;
}

async function deleteWorkspace(workspaceId) {
  await requestJson(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
  });
  removeWorkspace(workspaceId);
}

async function createThread(payload) {
  const response = await requestJson("/api/threads", {
    method: "POST",
    body: payload,
  });
  upsertThread(response.thread);
  clearThreadNotice();
  state.activeThreadId = response.thread.id;
  state.activeWorkspaceId = response.thread.workspaceId;
  state.view = "chat";
  return response.thread;
}

async function updateThread(threadId, payload) {
  const response = await requestJson(`/api/threads/${encodeURIComponent(threadId)}`, {
    method: "PATCH",
    body: payload,
  });
  upsertThread(response.thread);
  return response.thread;
}

async function compactThread(threadId) {
  const response = await requestJson(`/api/threads/${encodeURIComponent(threadId)}/compact`, {
    method: "POST",
  });
  if (response.thread) {
    upsertThread(response.thread);
  }
  return response;
}

async function deleteThread(threadId) {
  await requestJson(`/api/threads/${encodeURIComponent(threadId)}`, {
    method: "DELETE",
  });
  removeThread(threadId);
  ensureSelection();
}

async function refreshAutomations() {
  const response = await requestJson("/api/automations");
  state.automations = Array.isArray(response.automations) ? response.automations : [];
  render();
}

async function createAutomationItem(payload) {
  const response = await requestJson("/api/automations", {
    method: "POST",
    body: payload,
  });
  if (response.automation) {
    upsertAutomation(response.automation);
  }
  return response.automation;
}

async function updateAutomationItem(automationId, payload) {
  const response = await requestJson(`/api/automations/${encodeURIComponent(automationId)}`, {
    method: "PATCH",
    body: payload,
  });
  if (response.automation) {
    upsertAutomation(response.automation);
  }
  return response.automation;
}

async function deleteAutomationItem(automationId) {
  await requestJson(`/api/automations/${encodeURIComponent(automationId)}`, {
    method: "DELETE",
  });
  removeAutomation(automationId);
}

async function runAutomationNow(automationId) {
  const response = await requestJson(`/api/automations/${encodeURIComponent(automationId)}/run`, {
    method: "POST",
  });
  if (response.automation) {
    upsertAutomation(response.automation);
  }
  if (response.thread) {
    upsertThread(response.thread);
    state.activeWorkspaceId = response.thread.workspaceId;
    state.activeThreadId = response.thread.id;
    state.view = "chat";
    if (response.thread.status === "running") {
      void pollThread(response.thread.id);
    }
  }
  return response;
}

function setLiveRun(threadId, run) {
  if (!run) {
    delete state.liveRuns[threadId];
    return;
  }
  state.liveRuns[threadId] = {
    ...run,
    threadId,
  };
}

async function stopThread(threadId) {
  await requestJson(`/api/threads/${encodeURIComponent(threadId)}/abort`, {
    method: "POST",
  });
}

async function pickThreadFiles(initialPath) {
  const response = await requestJson("/api/system/pick-files", {
    method: "POST",
    body: {
      initialPath,
    },
  });
  return Array.isArray(response.attachments) ? response.attachments : [];
}

async function pollThread(threadId) {
  const token = `${Date.now()}-${Math.random()}`;
  state.pollTokens[threadId] = token;

  while (state.pollTokens[threadId] === token) {
    let payload;
    try {
      payload = await requestJson(`/api/threads/${encodeURIComponent(threadId)}/live`);
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) {
        removeThread(threadId);
        setLiveRun(threadId, null);
        delete state.pollTokens[threadId];
        render();
        return;
      }
      throw error;
    }
    if (payload.thread) {
      upsertThread(payload.thread);
    }
    if (payload.active && payload.run) {
      setLiveRun(threadId, payload.run);
      render();
      await delay(900);
      continue;
    }

    setLiveRun(threadId, null);
    delete state.pollTokens[threadId];
    render();
    return;
  }
}

async function runThreadPrompt(threadId, prompt, attachments = []) {
  const response = await requestJson(`/api/threads/${encodeURIComponent(threadId)}/run`, {
    method: "POST",
    body: {
      attachments,
      prompt,
    },
  });
  upsertThread(response.thread);
  setLiveRun(threadId, response.run || null);
  state.composerAttachments = [];
  state.composerText = "";
  render();
  void pollThread(threadId);
}

async function openFolderCommand() {
  const path = await pickDirectory(currentWorkspace()?.cwd || state.config?.workingDirectory);
  if (!path) {
    return;
  }
  const workspace = await createWorkspace({ cwd: path });
  state.activeWorkspaceId = workspace.id;
  state.activeThreadId = null;
  state.view = "chat";
}

async function createQuickChat() {
  const workspaceId = currentWorkspace()?.id || state.workspaces[0]?.id;
  if (!workspaceId) {
    throw new Error(t("Add a workspace first.", "请先添加工作区。"));
  }
  const thread = await createThread({ workspaceId });
  state.view = "chat";
  return thread;
}

function focusSearchField(selectText = false) {
  requestAnimationFrame(() => {
    const input = document.querySelector("#search-command-input");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    input.focus();
    if (selectText) {
      input.select();
    }
  });
}

function openMiniWindow() {
  const thread = currentThread();
  const workspace = currentWorkspace();
  const url = new URL(window.location.href);
  url.searchParams.set("mini", "1");
  if (thread?.id) {
    url.searchParams.set("thread", thread.id);
  } else {
    url.searchParams.delete("thread");
  }
  if (workspace?.id) {
    url.searchParams.set("workspace", workspace.id);
  } else {
    url.searchParams.delete("workspace");
  }
  window.open(
    url.toString(),
    "_blank",
    "popup=yes,width=980,height=760,resizable=yes,scrollbars=yes",
  );
}

function moveToRelativeThread(offset) {
  const nextThread = nextSearchableThread(offset);
  if (!nextThread) {
    return;
  }
  state.activeThreadId = nextThread.id;
  state.activeWorkspaceId = nextThread.workspaceId;
  state.view = "chat";
}

async function runSearchCommand(commandId) {
  if (commandId === "cmd-new-chat" || commandId === "cmd-new-quick-chat") {
    await createQuickChat();
    return;
  }
  if (commandId === "cmd-open-folder") {
    await openFolderCommand();
    return;
  }
  if (commandId === "cmd-open-settings") {
    state.view = "settings";
    state.settingsSection = "general";
    return;
  }
  if (commandId === "cmd-open-mini-window") {
    openMiniWindow();
    return;
  }
  if (commandId === "cmd-prev-chat") {
    moveToRelativeThread(-1);
    return;
  }
  if (commandId === "cmd-next-chat") {
    moveToRelativeThread(1);
    return;
  }
  if (commandId === "cmd-focus-find") {
    state.view = "search";
    state.searchFocusRequested = true;
    state.searchSelectRequested = true;
  }
}

function renderMessages(thread) {
  const live = liveRun(thread.id);
  const items = [...(thread.messages || [])];

  if (live) {
    items.push({
      createdAt: live.updatedAt || new Date().toISOString(),
      id: "live-draft",
      isDraft: true,
      isError: Boolean(live.error),
      helperText: liveRunHelperText(live),
      role: live.error ? "system" : "assistant",
      text: live.error || live.assistantText || t("Thinking...", "思考中…"),
      thinking: live.assistantThinking || "",
    });
  }

  const liveDraft = items[items.length - 1];
  if (live && liveDraft?.id === "live-draft" && !live.error && !live.assistantText) {
    liveDraft.text = liveRunStatusText(live);
  }

  if (!items.length) {
    return `
      <div class="empty-state empty-state--tight">
        <div class="empty-state__badge">${t("Empty thread", "空线程")}</div>
        <h2 class="empty-state__title empty-state__title--compact">${t(
          "Start the first message.",
          "开始第一条消息。",
        )}</h2>
        <p class="empty-state__body">${t(
          "This thread already belongs to the selected workspace. The next messages will run in that folder.",
          "这个线程已经属于当前工作区。后续消息会在对应文件夹内运行。",
        )}</p>
      </div>
    `;
  }

  return items
    .map(
      (message) => `
        <article class="message message--${message.role}">
          <div class="message__meta">
            <span>${esc(
              message.role === "user"
                ? t("You", "你")
                : message.role === "assistant"
                  ? "Glaude"
                  : t("System", "系统"),
            )}</span>
            <span class="message__time">${relativeTime(message.createdAt)}</span>
            ${message.isDraft ? `<span class="meta-pill">${t("live", "实时")}</span>` : ""}
          </div>
          <div class="message__bubble ${message.isError ? "message__bubble--error" : ""}">
            ${
              message.isDraft
                ? `
                    <div class="draft-run-state">
                      <span class="draft-run-state__dot"></span>
                      <span>${esc(liveRunStatusText(live) || t("Model is running...", "模型正在运行..."))}</span>
                    </div>
                  `
                : ""
            }
            ${
              Array.isArray(message.attachments) && message.attachments.length
                ? `
                    <div class="message__attachments">
                      ${message.attachments
                        .map(
                          (attachment) => `
                            <span class="attachment-chip attachment-chip--message" title="${esc(
                              attachment.path || attachment.name || "",
                            )}">
                              <span class="attachment-chip__label">${esc(
                                attachmentSummaryLabel(attachment),
                              )}</span>
                            </span>
                          `,
                        )
                        .join("")}
                    </div>
                  `
                : ""
            }
            ${
              message.thinking && draftConfig().includeThinking
                ? `
                    <details class="thinking-block" ${message.isDraft ? "open" : ""}>
                      <summary>${t("Model thinking", "模型思路")}</summary>
                      <pre>${esc(message.thinking)}</pre>
                    </details>
                  `
                : ""
            }
            ${
              message.helperText
                ? `<div class="message__helper">${esc(message.helperText)}</div>`
                : ""
            }
            <pre class="message__text">${esc(messageDisplayText(message))}</pre>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSidebar() {
  const workspaceCards = state.workspaces.length
    ? state.workspaces
        .map((workspace) => {
          const threads = byUpdated(
            activeThreads().filter((thread) => thread.workspaceId === workspace.id),
          );
          return `
            <section class="workspace-group ${
              currentWorkspace()?.id === workspace.id ? "workspace-group--active" : ""
            }" data-context-menu="workspace" data-workspace-id="${workspace.id}">
              <div class="workspace-group__head">
                <button class="workspace-group__folder" data-action="select-workspace" data-workspace-id="${workspace.id}">
                  <span class="workspace-group__folder-icon"></span>
                  <span class="workspace-group__name">${esc(workspace.name)}</span>
                </button>
                <div class="workspace-group__actions">
                  <button class="icon-button" data-action="new-thread-workspace" data-workspace-id="${workspace.id}" title="${esc(
                    t("New chat", "新对话"),
                  )}">+</button>
                  <button class="icon-button icon-button--menu" data-action="toggle-workspace-menu" data-workspace-id="${workspace.id}" title="${esc(
                    t("Folder menu", "文件夹菜单"),
                  )}">...</button>
                </div>
              </div>
              <div class="workspace-group__path">${esc(workspace.cwd)}</div>
              <div class="workspace-group__threads">
                ${
                  threads.length
                    ? threads
                        .slice(0, 4)
                        .map(
                          (thread) => `
                            <div class="thread-row-shell" data-context-menu="thread" data-thread-id="${thread.id}">
                              <button class="thread-row ${
                                thread.id === state.activeThreadId ? "thread-row--active" : ""
                              }" data-action="select-thread" data-thread-id="${thread.id}">
                                <div class="thread-row__head">
                                  <span class="thread-row__title">${esc(thread.title)}</span>
                                  <span class="thread-row__time">${relativeTime(thread.updatedAt)}</span>
                                </div>
                                <div class="thread-row__preview">${esc(threadSummary(thread))}</div>
                              </button>
                              <button class="icon-button icon-button--menu thread-row__menu" data-action="toggle-thread-menu" data-thread-id="${thread.id}" title="${esc(
                                t("Chat menu", "对话菜单"),
                              )}">...</button>
                            </div>
                          `,
                        )
                        .join("")
                    : `<div class="workspace-group__empty">${t("No chats yet.", "还没有对话。")}</div>`
                }
              </div>
            </section>
          `;
        })
        .join("")
    : `<div class="empty-list">${t(
        "Add a folder to start.",
        "先添加一个文件夹开始使用。",
      )}</div>`;

  sidebarElement.innerHTML = `
    <div class="sidebar__brand">
      <div class="brand-mark">GV</div>
      <div class="brand-copy">
        <div class="brand-copy__eyebrow">${t("Local App", "本地应用")}</div>
            <div class="brand-copy__title">Glaude Vibe Coder</div>
      </div>
    </div>
    <nav class="sidebar__nav">
      <button class="sidebar-nav__item sidebar-nav__item--primary" data-action="new-thread-global">
        <span class="sidebar-nav__icon"></span>
        <span>${t("New chat", "新对话")}</span>
      </button>
      <button class="sidebar-nav__item ${state.view === "search" ? "sidebar-nav__item--active" : ""}" data-action="open-view" data-view="search">
        <span class="sidebar-nav__icon sidebar-nav__icon--search"></span>
        <span>${t("Search", "搜索")}</span>
      </button>
      <button class="sidebar-nav__item ${state.view === "plugins" ? "sidebar-nav__item--active" : ""}" data-action="open-view" data-view="plugins">
        <span class="sidebar-nav__icon sidebar-nav__icon--grid"></span>
        <span>${t("Plugins", "插件")}</span>
      </button>
      <button class="sidebar-nav__item ${state.view === "automations" ? "sidebar-nav__item--active" : ""}" data-action="open-view" data-view="automations">
        <span class="sidebar-nav__icon sidebar-nav__icon--clock"></span>
        <span>${t("Automations", "自动化")}</span>
      </button>
    </nav>
    <section class="sidebar__threads">
      <div class="sidebar__section-head">
        <div class="sidebar__section-label">${t("Threads", "会话")}</div>
        <button class="mini-button" data-action="add-workspace">${t("Add folder", "添加文件夹")}</button>
      </div>
      <div class="workspace-list">${workspaceCards}</div>
    </section>
    <div class="sidebar__footer">
      <button class="sidebar-nav__item ${state.view === "settings" ? "sidebar-nav__item--active" : ""}" data-action="open-view" data-view="settings">
        <span class="sidebar-nav__icon sidebar-nav__icon--gear"></span>
        <span>${t("Settings", "设置")}</span>
      </button>
    </div>
  `;
}

function renderWorkspaceHome() {
  const workspace = currentWorkspace();
  if (!workspace) {
    screenElement.innerHTML = `
      <section class="panel-view panel-view--centered">
        <div class="empty-state">
          <div class="empty-state__badge">${t("No workspace", "没有工作区")}</div>
          <h1 class="empty-state__title">${t("Choose a folder first.", "先选择一个文件夹。")}</h1>
          <p class="empty-state__body">${t(
            "Add a folder in the sidebar, then create chats inside that workspace.",
            "先在左侧添加文件夹，再在对应工作区里创建对话。",
          )}</p>
        </div>
      </section>
    `;
    return;
  }

  const threads = byUpdated(
    activeThreads().filter((thread) => thread.workspaceId === workspace.id),
  ).slice(0, 6);

  screenElement.innerHTML = `
    <section class="chat-view">
      <header class="chat-view__header" data-context-menu="workspace" data-workspace-id="${workspace.id}">
        <div>
          <div class="chat-view__eyebrow">${t("Workspace", "工作区")}</div>
          <h1 class="chat-view__title">${esc(workspace.name)}</h1>
          <div class="chat-view__subtitle">${esc(workspace.cwd)}</div>
        </div>
        <div class="chat-view__header-tools">
          <button class="ghost-button" data-action="open-system-path" data-path="${esc(workspace.cwd)}">${t(
            "Open folder",
            "打开文件夹",
          )}</button>
          <button class="primary-button" data-action="new-thread-current">${t(
            "New chat",
            "新对话",
          )}</button>
          <button class="icon-button icon-button--menu" data-action="toggle-workspace-menu" data-workspace-id="${workspace.id}" title="${esc(
            t("Folder menu", "文件夹菜单"),
          )}">...</button>
        </div>
      </header>
      <div class="workspace-home">
        <div class="empty-state empty-state--tight">
          <div class="empty-state__badge">${t("Workspace threads", "工作区线程")}</div>
          <h2 class="empty-state__title empty-state__title--compact">${t(
            "Each folder can hold multiple chats.",
            "每个文件夹都可以承载多个对话。",
          )}</h2>
          <p class="empty-state__body">${t(
            "New chats created here will inherit this workspace folder automatically.",
            "在这里创建的新对话会自动继承当前工作区文件夹。",
          )}</p>
        </div>
        <section>
          <div class="workspace-home__section-title">${t("Recent chats", "最近对话")}</div>
          <div class="workspace-home__grid">
            ${
              threads.length
                ? threads
                    .map(
                      (thread) => `
                        <div class="summary-card-shell" data-context-menu="thread" data-thread-id="${thread.id}">
                          <button class="summary-card" data-action="select-thread" data-thread-id="${thread.id}">
                            <div class="summary-card__head">
                              <span class="summary-card__title">${esc(thread.title)}</span>
                              <span class="summary-card__time">${relativeTime(thread.updatedAt)}</span>
                            </div>
                            <div class="summary-card__body">${esc(threadSummary(thread))}</div>
                          </button>
                          <button class="icon-button icon-button--menu summary-card__menu" data-action="toggle-thread-menu" data-thread-id="${thread.id}" title="${esc(
                            t("Chat menu", "对话菜单"),
                          )}">...</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<div class="summary-card">${t("No chats in this workspace yet.", "这个工作区还没有对话。")}</div>`
            }
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderThreadView(thread) {
  const live = liveRun(thread.id);
  const selectedProfileId = effectiveModelProfileId(thread);
  const displayedModel = effectiveThreadModelInputValue(thread, selectedProfileId);
  const modelOptions = modelOptionsForThread(thread);
  const composerAttachments = Array.isArray(state.composerAttachments)
    ? state.composerAttachments
    : [];
  const canCompact = supportsThreadContextCompact(thread);
  const compactSummary = String(thread.compactSummary || "").trim();
  const threadNotice = String(state.threadNotice || "").trim();
  thread = {
    ...thread,
    model: displayedModel || thread.model,
  };
  screenElement.innerHTML = `
    <section class="chat-view">
      <header class="chat-view__header" data-context-menu="thread" data-thread-id="${thread.id}">
        <div>
          <div class="chat-view__eyebrow">${esc(workspaceById(thread.workspaceId)?.name || t("Workspace", "工作区"))}</div>
          <h1 class="chat-view__title">${esc(thread.title)}</h1>
          <div class="chat-view__subtitle">${esc(threadPath(thread))}</div>
        </div>
        <div class="chat-view__header-tools">
          <span class="header-pill">${esc(live ? t("running", "运行中") : thread.status || "idle")}</span>
          <button class="ghost-button" data-action="open-system-path" data-path="${esc(threadPath(thread))}">${t(
            "Open folder",
            "打开文件夹",
          )}</button>
          <button class="icon-button icon-button--menu" data-action="toggle-thread-menu" data-thread-id="${thread.id}" title="${esc(
            t("Chat menu", "对话菜单"),
          )}">...</button>
        </div>
      </header>
      ${
        live
          ? `
              <div class="run-banner">
                <div class="run-banner__title">
                  <span class="run-banner__dot"></span>
                  <span>${esc(liveRunStatusText(live))}</span>
                </div>
                <div class="run-banner__body">${esc(liveRunHelperText(live))}</div>
              </div>
            `
          : ""
      }
      ${
        threadNotice
          ? `
              <div class="run-banner run-banner--notice">
                <div class="run-banner__title">${esc(t("Context update", "上下文状态"))}</div>
                <div class="run-banner__body">${esc(threadNotice)}</div>
              </div>
            `
          : ""
      }
      ${
        compactSummary
          ? `
              <section class="compact-summary">
                <div class="compact-summary__head">
                  <span class="status-pill">${esc(t("Compacted context", "已压缩上下文"))}</span>
                  <span class="compact-summary__meta">${esc(compactSummaryLabel(thread))}</span>
                  ${
                    thread.compactUpdatedAt
                      ? `<span class="compact-summary__meta">${esc(relativeTime(thread.compactUpdatedAt))}</span>`
                      : ""
                  }
                </div>
                <pre class="compact-summary__text">${esc(compactSummary)}</pre>
              </section>
            `
          : ""
      }
      <div id="messages" class="messages">${renderMessages(thread)}</div>
      <footer class="composer">
        <div class="composer__controls">
          <label class="field">
            <span>${t("Model profile", "模型组")}</span>
            <select id="thread-model-profile">
              <option value="">${esc(t("Use default profile", "使用默认模型组"))}</option>
              ${modelProfiles()
                .map(
                  (profile) => `
                    <option value="${esc(profile.id)}" ${
                      profile.id === selectedProfileId ? "selected" : ""
                    }>${esc(profile.name || profile.apiModel || "Model profile")}</option>
                  `,
                )
                .join("")}
            </select>
          </label>
          <label class="field">
            <span>${t("Model", "模型")}</span>
            <input id="thread-model" value="${esc(displayedModel)}" list="model-options" placeholder="${esc(
              t("Use CLI default", "使用 CLI 默认值"),
            )}" />
          </label>
          <label class="field">
            <span>${t("Permission mode", "权限模式")}</span>
            <select id="thread-permission-mode">
              ${["default", "plan", "acceptEdits", "dontAsk", "bypassPermissions"]
                .map(
                  (mode) => `
                    <option value="${mode}" ${
                      mode === (thread.permissionMode || state.config.defaultPermissionMode)
                        ? "selected"
                        : ""
                    }>${mode}</option>
                  `,
                )
                .join("")}
            </select>
          </label>
        </div>
        <label class="field">
          <span>${t("Message", "消息")}</span>
          <textarea id="composer-input" rows="5" placeholder="${esc(
            t(
              "Ask Glaude to inspect, edit, explain, or run something...",
              "让 Glaude 帮你检查、修改、解释或执行某件事…",
            ),
          )}">${esc(state.composerText)}</textarea>
        </label>
        <div class="composer__attachments">
          ${
            composerAttachments.length
              ? composerAttachments
                  .map(
                    (attachment) => `
                      <span class="attachment-chip" title="${esc(
                        attachment.path || attachment.name || "",
                      )}">
                        <span class="attachment-chip__label">${esc(
                          attachmentSummaryLabel(attachment),
                        )}</span>
                        <button
                          type="button"
                          class="attachment-chip__remove"
                          data-action="remove-composer-attachment"
                          data-attachment-id="${esc(attachment.id)}"
                          aria-label="${esc(t("Remove file", "移除文件"))}"
                        >×</button>
                      </span>
                    `,
                  )
                  .join("")
              : `<span class="composer__attachments-empty">${esc(
                  t("No files attached for this turn.", "当前这次发送还没有附件。"),
                )}</span>`
          }
        </div>
        <div class="composer__footer">
          <div class="status-row">
            ${live ? `<span class="status-pill status-pill--running">${esc(liveRunStatusText(live))}</span>` : ""}
            <span class="status-pill">${esc(thread.permissionMode || state.config.defaultPermissionMode)}</span>
            <span class="status-pill">${esc(modelProfileLabel(thread))}</span>
            <span class="status-pill">${esc(thread.model || state.config.defaultModel || t("CLI default", "CLI 默认"))}</span>
            ${
              live?.lastTool
                ? `<span class="status-pill">${esc(`${t("tool", "工具")}: ${live.lastTool}`)}</span>`
                : ""
            }
          </div>
          <div class="composer__actions">
            ${
              canCompact
                ? `<button class="ghost-button" data-action="compact-thread" data-thread-id="${thread.id}" ${
                    live ? "disabled" : ""
                  }>${t("Compact context", "压缩上下文")}</button>`
                : ""
            }
            <button class="ghost-button" data-action="attach-files" data-thread-id="${thread.id}">${t(
              "Add file",
              "添加文件",
            )}</button>
            <button class="ghost-button" data-action="select-workspace" data-workspace-id="${thread.workspaceId}">${t(
              "Back to workspace",
              "返回工作区",
            )}</button>
            ${
              live
                ? `<button class="primary-button primary-button--danger" data-action="stop-run" data-thread-id="${thread.id}">${t(
                    "Stop",
                    "停止",
                  )}</button>`
                : `<button class="primary-button" data-action="send-message" data-thread-id="${thread.id}">${t(
                    "Send",
                    "发送",
                  )}</button>`
            }
          </div>
        </div>
        <datalist id="model-options">
          ${modelOptions.map((model) => `<option value="${esc(model)}"></option>`).join("")}
        </datalist>
      </footer>
    </section>
  `;
  restoreThreadViewport(thread.id);
}

function renderSearchView() {
  screenElement.innerHTML = `
    <section class="panel-view">
      <header class="panel-view__header">
        <div class="chat-view__eyebrow">${t("Search", "搜索")}</div>
        <h1 class="chat-view__title">${t("Search is next.", "搜索页下一步补全。")}</h1>
        <p class="panel-view__body">${t(
          "I am restoring the app in small, safe patches. Search results and filtering come next.",
          "我在按小步恢复应用。搜索结果和筛选会在下一步接上。",
        )}</p>
      </header>
    </section>
  `;
}

function renderSearchCommandItem(command) {
  return `
    <button class="search-command" data-action="run-search-command" data-command-id="${esc(command.id)}" ${command.disabled ? "disabled" : ""}>
      <div class="search-command__copy">
        <div class="search-command__title">${esc(t(command.titleEn, command.titleZh))}</div>
        <div class="search-command__subtitle">${esc(t(command.subtitleEn, command.subtitleZh))}</div>
      </div>
      ${
        command.shortcut
          ? `<span class="search-shortcut">${esc(command.shortcut)}</span>`
          : ""
      }
    </button>
  `;
}

function renderSearchThreadResult(thread) {
  return `
    <button class="search-result" data-action="select-thread" data-thread-id="${esc(thread.id)}">
      <div class="search-result__head">
        <span class="search-result__title">${esc(thread.title)}</span>
        <span class="search-result__time">${esc(relativeTime(thread.updatedAt))}</span>
      </div>
      <div class="search-result__body">${esc(threadSummary(thread))}</div>
      <div class="search-result__meta">${esc(
        [workspaceById(thread.workspaceId)?.name, threadPath(thread)].filter(Boolean).join(" 路 "),
      )}</div>
    </button>
  `;
}

function renderSearchWorkbench() {
  const grouped = groupSearchCommands();
  const threadResults = searchableThreads();

  screenElement.innerHTML = `
    <section class="search-view">
      <header class="search-view__hero">
        <input
          id="search-command-input"
          class="search-view__input"
          data-search-query="true"
          value="${esc(state.search)}"
          placeholder="${esc(t("Type command or search chats", "输入命令或搜索对话"))}"
          autocomplete="off"
        />
      </header>
      <div class="search-view__results">
        ${Object.values(grouped)
          .map(
            (group) => `
              <section class="search-section">
                <div class="search-section__label">${esc(t(group.en, group.zh))}</div>
                <div class="search-command-list">
                  ${group.items.map((command) => renderSearchCommandItem(command)).join("")}
                </div>
              </section>
            `,
          )
          .join("")}
        <section class="search-section">
          <div class="search-section__label">${esc(t("Chats", "对话"))}</div>
          <div class="search-results">
            ${
              threadResults.length
                ? threadResults.map((thread) => renderSearchThreadResult(thread)).join("")
                : `<div class="empty-list">${t("No chats matched your search.", "没有匹配的对话。")}</div>`
            }
          </div>
        </section>
      </div>
    </section>
  `;

  if (state.searchFocusRequested) {
    const shouldSelect = state.searchSelectRequested;
    state.searchFocusRequested = false;
    state.searchSelectRequested = false;
    focusSearchField(shouldSelect);
  }
}

function renderLibraryCard(item, kind) {
  const meta =
    kind === "plugin"
      ? `${item.provider}${item.sourceSkillSlugs?.length ? ` · ${item.sourceSkillSlugs.join(", ")}` : ""}`
      : item.pluginName || item.group;
  return `
    <article class="library-card library-card--${kind}">
      <div class="library-card__icon">${esc((item.name || "?").slice(0, 2).toUpperCase())}</div>
      <div class="library-card__copy">
        <div class="library-card__title-row">
          <div class="library-card__title">${esc(item.name)}</div>
          <button
            class="library-card__state ${item.installed ? "library-card__state--installed" : ""}"
            data-action="open-library-path"
            data-path="${esc(item.path || "")}"
            title="${esc(
              item.path ? t("Open location", "打开位置") : t("Installed", "已安装"),
            )}"
          >${item.installed ? "✓" : "+"}</button>
        </div>
        <div class="library-card__description">${esc(item.description || "")}</div>
        <div class="library-card__meta">${esc(meta || "")}</div>
      </div>
    </article>
  `;
}

function renderLibrarySection(title, items, kind) {
  return `
    <section class="library-section">
      <div class="library-section__title">${esc(title)}</div>
      <div class="library-grid">
        ${items.map((item) => renderLibraryCard(item, kind)).join("")}
      </div>
    </section>
  `;
}

function renderPluginsView() {
  const catalog = state.libraryCatalog;
  const plugins = filteredLibraryPlugins();
  const skills = filteredLibrarySkills();
  const pluginGroups = groupItems(plugins, "category");
  const skillGroups = groupItems(skills, "group");
  const recommendedSkills = skills.filter((item) =>
    ["code", "brainstorming", "playwright", "openai-docs", "skill-installer"].includes(item.slug),
  );
  const providerOptions = ["all", ...new Set(libraryPlugins().map((item) => item.provider).filter(Boolean))];
  const categoryOptions = ["all", ...new Set(libraryPlugins().map((item) => item.category).filter(Boolean))];
  const sourceOptions = ["all", ...new Set(librarySkills().map((item) => item.group).filter(Boolean))];
  const currentTab = state.libraryTab;
  const searchPlaceholder =
    currentTab === "plugins"
      ? t("Search plugins", "搜索插件")
      : t("Search skills", "搜索技能");

  screenElement.innerHTML = `
    <section class="library-view">
      <header class="library-view__hero">
        <div class="library-view__topbar">
          <div class="library-tabs">
            <button class="library-tabs__item ${currentTab === "plugins" ? "library-tabs__item--active" : ""}" data-action="open-library-tab" data-library-tab="plugins">${t(
              "Plugins",
              "插件",
            )}</button>
            <button class="library-tabs__item ${currentTab === "skills" ? "library-tabs__item--active" : ""}" data-action="open-library-tab" data-library-tab="skills">${t(
              "Skills",
              "技能",
            )}</button>
          </div>
          <div class="library-toolbar">
            <button class="ghost-button" data-action="manage-library">${t("Manage", "管理")}</button>
            <button class="ghost-button" data-action="create-library-item">${t("Create", "创建")}</button>
            <button class="icon-button icon-button--menu" data-action="refresh-library" title="${esc(
              t("Refresh", "刷新"),
            )}">...</button>
          </div>
        </div>
        <h1 class="library-view__title">${t("Make Glaude work your way", "让 Glaude 按你的方式工作")}</h1>
        <div class="library-search-row">
          <input class="library-search" data-library-filter="search" value="${esc(
            state.librarySearch,
          )}" placeholder="${esc(searchPlaceholder)}" />
          ${
            currentTab === "plugins"
              ? `
                <select data-library-filter="provider">
                  ${providerOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.libraryProvider ? "selected" : ""
                      }>${esc(value === "all" ? t("All publishers", "全部来源") : value)}</option>`,
                    )
                    .join("")}
                </select>
                <select data-library-filter="category">
                  ${categoryOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.libraryCategory ? "selected" : ""
                      }>${esc(value === "all" ? t("All categories", "全部分类") : value)}</option>`,
                    )
                    .join("")}
                </select>
              `
              : `
                <select data-library-filter="source">
                  ${sourceOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.librarySource ? "selected" : ""
                      }>${esc(value === "all" ? t("All sources", "全部来源") : value)}</option>`,
                    )
                    .join("")}
                </select>
              `
          }
        </div>
        ${
          state.libraryNotice
            ? `<div class="library-view__notice">${esc(state.libraryNotice)}</div>`
            : ""
        }
      </header>
      <div class="library-view__body">
        ${
          !catalog
            ? `<div class="empty-list">${t("Loading library…", "正在加载目录…")}</div>`
            : currentTab === "plugins"
              ? Object.keys(pluginGroups).length
                ? Object.entries(pluginGroups)
                    .map(([group, items]) => renderLibrarySection(group, items, "plugin"))
                    .join("")
                : `<div class="empty-list">${t("No plugins found", "没有找到插件")}</div>`
              : `
                  ${
                    recommendedSkills.length
                      ? renderLibrarySection(t("Recommended", "推荐"), recommendedSkills, "skill")
                      : ""
                  }
                  ${
                    Object.keys(skillGroups).length
                      ? Object.entries(skillGroups)
                          .map(([group, items]) => renderLibrarySection(group, items, "skill"))
                          .join("")
                      : `<div class="empty-list">${t("No skills found", "没有找到技能")}</div>`
                  }
                `
        }
      </div>
    </section>
  `;
}

function renderLibraryListItem(item, kind) {
  const meta =
    kind === "plugin"
      ? [item.provider, item.category].filter(Boolean).join(" · ")
      : item.pluginName || item.group || "";
  const actionLabel = item.installed ? "✓" : "+";
  const actionTitle = item.installed
    ? t("Open location", "打开位置")
    : kind === "plugin"
      ? t("Create plugin", "创建插件")
      : t("Create skill", "创建技能");
  return `
    <article class="library-item library-item--${kind}">
      <div class="library-item__icon">${esc((item.name || "?").slice(0, 2).toUpperCase())}</div>
      <div class="library-item__content">
        <div class="library-item__title">${esc(item.name)}</div>
        <div class="library-item__description">${esc(item.description || meta || "")}</div>
        ${meta ? `<div class="library-item__meta">${esc(meta)}</div>` : ""}
      </div>
      <button
        class="library-item__action ${item.installed ? "library-item__action--installed" : ""}"
        data-action="open-library-path"
        data-path="${esc(item.path || "")}"
        title="${esc(actionTitle)}"
      >${actionLabel}</button>
    </article>
  `;
}

function renderLibraryListSection(title, items, kind) {
  return `
    <section class="library-section">
      <div class="library-section__title">${esc(title)}</div>
      <div class="library-list">
        ${items.map((item) => renderLibraryListItem(item, kind)).join("")}
      </div>
    </section>
  `;
}

function renderLibraryComposerPanel() {
  if (!state.libraryComposer) {
    return "";
  }
  const noun = state.libraryComposer.kind === "skill" ? t("skill", "技能") : t("plugin", "插件");
  return `
    <section class="library-composer">
      <div class="library-composer__header">
        <div>
          <div class="library-composer__eyebrow">${t("Create", "创建")}</div>
          <div class="library-composer__title">${t("New", "新建")} ${noun}</div>
        </div>
        <button class="ghost-button" data-action="close-library-composer">${t("Cancel", "取消")}</button>
      </div>
      <div class="library-composer__grid">
        <label class="field">
          <span>${t("Name", "名称")}</span>
          <input data-library-composer="name" value="${esc(state.libraryComposer.name)}" placeholder="${esc(
            state.libraryComposer.kind === "skill" ? "My Skill" : "My Plugin",
          )}" />
        </label>
        <label class="field">
          <span>${t("Identifier", "标识")}</span>
          <input data-library-composer="slug" value="${esc(state.libraryComposer.slug)}" placeholder="${esc(
            state.libraryComposer.kind === "skill" ? "my-skill" : "my-plugin",
          )}" />
        </label>
      </div>
      <label class="field">
        <span>${t("Description", "描述")}</span>
        <textarea data-library-composer="description" rows="3" placeholder="${esc(
          t("Add a short description", "填写简短描述"),
        )}">${esc(state.libraryComposer.description)}</textarea>
      </label>
      <div class="library-composer__actions">
        <button class="primary-button" data-action="submit-library-composer">${t("Create", "创建")} ${noun}</button>
      </div>
    </section>
  `;
}

function renderPluginsWorkspace() {
  const catalog = state.libraryCatalog;
  const plugins = filteredLibraryPlugins();
  const skills = filteredLibrarySkills();
  const providerOptions = ["all", ...new Set(libraryPlugins().map((item) => item.provider).filter(Boolean))];
  const categoryOptions = ["all", ...new Set(libraryPlugins().map((item) => item.category).filter(Boolean))];
  const sourceOptions = ["all", ...new Set(librarySkills().map((item) => item.group).filter(Boolean))];
  const recommendedSkills = skills.filter((item) =>
    ["code", "brainstorming", "playwright", "openai-docs", "skill-installer"].includes(item.slug),
  );
  const pluginGroups = orderGroupedEntries(groupItems(plugins, "category"), [
    "Coding",
    "Design",
    "Productivity",
    "Automation",
    "Data",
    "Files",
    "Media",
    "Utilities",
  ]);
  const skillGroups = orderGroupedEntries(
    groupItems(
      skills.filter((item) => !recommendedSkills.some((recommended) => recommended.id === item.id)),
      "group",
    ),
    ["System", "Personal", "Plugin"],
  );
  const currentTab = state.libraryTab;
  const searchPlaceholder =
    currentTab === "plugins" ? t("Search plugins", "搜索插件") : t("Search skills", "搜索技能");

  screenElement.innerHTML = `
    <section class="library-view library-view--directory">
      <header class="library-view__hero">
        <div class="library-view__topbar">
          <div class="library-tabs">
            <button class="library-tabs__item ${currentTab === "plugins" ? "library-tabs__item--active" : ""}" data-action="open-library-tab" data-library-tab="plugins">${t(
              "Plugins",
              "插件",
            )}</button>
            <button class="library-tabs__item ${currentTab === "skills" ? "library-tabs__item--active" : ""}" data-action="open-library-tab" data-library-tab="skills">${t(
              "Skills",
              "技能",
            )}</button>
          </div>
          <div class="library-toolbar">
            <button class="ghost-button" data-action="manage-library">${t("Manage", "管理")}</button>
            <button class="ghost-button ghost-button--split" data-action="toggle-library-composer">
              <span>${t("Create", "创建")}</span>
              <span class="ghost-button__caret">▾</span>
            </button>
            <button class="icon-button icon-button--menu" data-action="refresh-library" title="${esc(
              t("Refresh", "刷新"),
            )}">...</button>
          </div>
        </div>
        <h1 class="library-view__title">${t("Make Glaude work your way", "让 Glaude 按你的方式工作")}</h1>
        <div class="library-search-row">
          <input class="library-search" data-library-filter="search" value="${esc(
            state.librarySearch,
          )}" placeholder="${esc(searchPlaceholder)}" />
          ${
            currentTab === "plugins"
              ? `
                <select data-library-filter="provider">
                  ${providerOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.libraryProvider ? "selected" : ""
                      }>${esc(value === "all" ? t("All publishers", "全部发布者") : value)}</option>`,
                    )
                    .join("")}
                </select>
                <select data-library-filter="category">
                  ${categoryOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.libraryCategory ? "selected" : ""
                      }>${esc(value === "all" ? t("All categories", "全部分类") : value)}</option>`,
                    )
                    .join("")}
                </select>
              `
              : `
                <select data-library-filter="source">
                  ${sourceOptions
                    .map(
                      (value) => `<option value="${esc(value)}" ${
                        value === state.librarySource ? "selected" : ""
                      }>${esc(value === "all" ? t("All sources", "全部来源") : value)}</option>`,
                    )
                    .join("")}
                </select>
              `
          }
        </div>
        ${renderLibraryComposerPanel()}
        ${
          state.libraryNotice
            ? `<div class="library-view__notice">${esc(state.libraryNotice)}</div>`
            : ""
        }
      </header>
      <div class="library-view__body">
        ${
          !catalog
            ? `<div class="empty-list">${t("Loading library...", "正在加载目录...")}</div>`
            : currentTab === "plugins"
              ? pluginGroups.length
                ? pluginGroups
                    .map(([group, items]) => renderLibraryListSection(group, items, "plugin"))
                    .join("")
                : `<div class="empty-list">${t("No plugins found", "没有找到插件")}</div>`
              : `
                  <section class="library-section">
                    <div class="library-section__title">${t("Recommended", "推荐")}</div>
                    ${
                      recommendedSkills.length
                        ? `<div class="library-list">${recommendedSkills
                            .map((item) => renderLibraryListItem(item, "skill"))
                            .join("")}</div>`
                        : `<div class="library-section__empty">${t("No skills found", "没有找到技能")}</div>`
                    }
                  </section>
                  ${
                    skillGroups.length
                      ? skillGroups
                          .map(([group, items]) => renderLibraryListSection(group, items, "skill"))
                          .join("")
                      : `<div class="empty-list">${t("No skills found", "没有找到技能")}</div>`
                  }
                `
        }
      </div>
    </section>
  `;
}

function renderAutomationsView() {
  screenElement.innerHTML = `
    <section class="panel-view">
      <header class="panel-view__header">
        <div class="chat-view__eyebrow">${t("Automations", "自动化")}</div>
        <h1 class="chat-view__title">${t("Automation page restored.", "自动化页面已恢复。")}</h1>
        <p class="panel-view__body">${t(
          "The navigation now works again. Runtime-backed automation actions will be added after chat and settings are stable.",
          "导航已经恢复。等聊天和设置页稳定之后，我再补运行时联动的自动化动作。",
        )}</p>
      </header>
    </section>
  `;
}

function renderAutomationTemplateCard(template) {
  return `
    <button class="automation-template-card" data-action="use-automation-template" data-template-id="${esc(template.id)}">
      <span class="automation-template-card__icon">${esc(template.icon || "•")}</span>
      <span class="automation-template-card__title">${esc(automationTemplateLabel(template))}</span>
      <span class="automation-template-card__description">${esc(automationTemplateDescription(template))}</span>
    </button>
  `;
}

function renderAutomationComposerPanel() {
  const composer = state.automationComposer;
  if (!composer) {
    return "";
  }

  const workspaceOptions = state.workspaces
    .map(
      (workspace) => `
        <option value="${esc(workspace.id)}" ${workspace.id === composer.workspaceId ? "selected" : ""}>
          ${esc(workspace.name)}
        </option>
      `,
    )
    .join("");
  const modelOptions = [
    `<option value="">${esc(t("Use default model profile", "使用默认模型组"))}</option>`,
    ...modelProfiles().map(
      (profile) => `
        <option value="${esc(profile.id)}" ${profile.id === composer.modelProfileId ? "selected" : ""}>
          ${esc(profile.name || profile.apiModel || profile.id)}
        </option>
      `,
    ),
  ].join("");
  const permissionOptions = [
    ["", t("Use default permission mode", "使用默认权限模式")],
    ["default", "default"],
    ["acceptEdits", "acceptEdits"],
    ["bypassPermissions", "bypassPermissions"],
    ["plan", "plan"],
  ]
    .map(
      ([value, label]) => `
        <option value="${esc(value)}" ${value === composer.permissionMode ? "selected" : ""}>${esc(label)}</option>
      `,
    )
    .join("");

  return `
    <section class="automation-composer">
      <div class="automation-composer__head">
        <div>
          <div class="chat-view__eyebrow">${esc(t("New automation", "新建自动化"))}</div>
          <h2 class="automation-section__heading">${esc(
            composer.mode === "edit" ? t("Edit automation", "编辑自动化") : t("Create automation", "创建自动化"),
          )}</h2>
        </div>
        <div class="automation-composer__actions">
          <button class="ghost-button" data-action="cancel-automation-composer">${t("Cancel", "取消")}</button>
          <button class="primary-button" data-action="save-automation-composer">${t("Save automation", "保存自动化")}</button>
        </div>
      </div>
      <div class="automation-form-grid">
        <label class="settings-card">
          <span class="settings-card__title">${t("Name", "名称")}</span>
          <input data-automation-composer="name" value="${esc(composer.name || "")}" placeholder="${esc(t("Automation name", "自动化名称"))}" />
        </label>
        <label class="settings-card">
          <span class="settings-card__title">${t("Category", "分类")}</span>
          <select data-automation-composer="category">
            ${AUTOMATION_CATEGORIES.map(
              (category) => `
                <option value="${esc(category)}" ${composer.category === category ? "selected" : ""}>${esc(category)}</option>
              `,
            ).join("")}
          </select>
        </label>
        <label class="settings-card">
          <span class="settings-card__title">${t("Workspace", "工作区")}</span>
          <select data-automation-composer="workspaceId">${workspaceOptions}</select>
        </label>
        <label class="settings-card">
          <span class="settings-card__title">${t("Model profile", "模型组")}</span>
          <select data-automation-composer="modelProfileId">${modelOptions}</select>
        </label>
        <label class="settings-card">
          <span class="settings-card__title">${t("Frequency", "频率")}</span>
          <select data-automation-composer="frequency">
            <option value="daily" ${composer.frequency === "daily" ? "selected" : ""}>${t("Daily", "每天")}</option>
            <option value="hourly" ${composer.frequency === "hourly" ? "selected" : ""}>${t("Hourly", "每小时")}</option>
            <option value="weekly" ${composer.frequency === "weekly" ? "selected" : ""}>${t("Weekly", "每周")}</option>
          </select>
        </label>
        <label class="settings-card">
          <span class="settings-card__title">${t("Permission mode", "权限模式")}</span>
          <select data-automation-composer="permissionMode">${permissionOptions}</select>
        </label>
        ${
          composer.frequency === "hourly"
            ? `
              <label class="settings-card">
                <span class="settings-card__title">${t("Interval hours", "间隔小时")}</span>
                <input data-automation-composer="intervalHours" type="number" min="1" max="168" value="${esc(composer.intervalHours || 24)}" />
              </label>
            `
            : `
              <label class="settings-card">
                <span class="settings-card__title">${t("Run at", "运行时间")}</span>
                <input data-automation-composer="timeOfDay" type="time" value="${esc(composer.timeOfDay || "09:00")}" />
              </label>
            `
        }
        ${
          composer.frequency === "weekly"
            ? `
              <div class="settings-card">
                <span class="settings-card__title">${t("Weekdays", "星期")}</span>
                <div class="automation-weekdays">
                  ${[1, 2, 3, 4, 5, 6, 0]
                    .map(
                      (day) => `
                        <label class="automation-weekday">
                          <input type="checkbox" data-automation-weekday="${day}" ${composer.weekdays?.includes(day) ? "checked" : ""} />
                          <span>${esc(weekdayLabel(day))}</span>
                        </label>
                      `,
                    )
                    .join("")}
                </div>
              </div>
            `
            : ""
        }
        <label class="settings-card automation-form-grid__full">
          <span class="settings-card__title">${t("Description", "描述")}</span>
          <input data-automation-composer="description" value="${esc(composer.description || "")}" placeholder="${esc(t("Short summary for the sidebar", "用于列表展示的简短说明"))}" />
        </label>
        <label class="settings-card automation-form-grid__full">
          <span class="settings-card__title">${t("Prompt", "提示词")}</span>
          <textarea data-automation-composer="prompt" rows="5" placeholder="${esc(t("What should the automation do each time it runs?", "每次执行时它要做什么？"))}">${esc(composer.prompt || "")}</textarea>
        </label>
      </div>
    </section>
  `;
}

function renderAutomationCard(automation) {
  return `
    <article class="automation-card">
      <div class="automation-card__head">
        <div>
          <div class="automation-card__title-row">
            <h3 class="automation-card__title">${esc(automation.name)}</h3>
            <span class="automation-card__badge ${automation.enabled ? "" : "automation-card__badge--muted"}">${esc(
              automation.enabled ? t("Active", "启用中") : t("Paused", "已暂停"),
            )}</span>
          </div>
          <div class="automation-card__meta">
            <span>${esc(automationWorkspaceName(automation))}</span>
            <span>${esc(formatAutomationFrequency(automation))}</span>
          </div>
        </div>
        <div class="automation-card__toolbar">
          <button class="ghost-button" data-action="run-automation" data-automation-id="${esc(automation.id)}">${t("Run now", "立即运行")}</button>
          <button class="ghost-button" data-action="edit-automation" data-automation-id="${esc(automation.id)}">${t("Edit", "编辑")}</button>
          <button class="ghost-button" data-action="toggle-automation-enabled" data-automation-id="${esc(automation.id)}">${automation.enabled ? t("Pause", "暂停") : t("Resume", "恢复")}</button>
          <button class="ghost-button ghost-button--danger" data-action="delete-automation" data-automation-id="${esc(automation.id)}">${t("Delete", "删除")}</button>
        </div>
      </div>
      <p class="automation-card__description">${esc(
        automation.description || t("No description yet.", "还没有描述。"),
      )}</p>
      <div class="automation-card__footer">
        <span>${esc(t("Next run", "下次运行"))}: ${esc(formatAutomationRunAt(automation.nextRunAt))}</span>
        <span>${esc(t("Last run", "上次运行"))}: ${esc(formatAutomationRunAt(automation.lastRunAt))}</span>
      </div>
    </article>
  `;
}

function renderAutomationsWorkbench() {
  const category = state.automationCategory || AUTOMATION_CATEGORIES[0];
  const templates = automationTemplatesForCategory(category);
  const savedAutomations = automationsByUpdated().filter(
    (automation) => !category || automation.category === category,
  );

  screenElement.innerHTML = `
    <section class="automation-view">
      <header class="automation-view__hero">
        <div>
          <h1 class="library-view__title">${t("Automations", "自动化")}</h1>
          <p class="panel-view__body automation-view__subtitle">${t(
            "Automate work by setting up scheduled threads that run against a workspace.",
            "通过设置定时线程来自动执行工作任务，并让它们针对指定工作区运行。",
          )}</p>
        </div>
        <div class="automation-view__hero-actions">
          <button class="primary-button" data-action="new-automation">${t("New automation", "新建自动化")}</button>
        </div>
      </header>
      ${renderAutomationComposerPanel()}
      ${
        state.automationNotice
          ? `<div class="library-view__notice">${esc(state.automationNotice)}</div>`
          : ""
      }
      <div class="automation-layout">
        <aside class="automation-category-rail">
          ${AUTOMATION_CATEGORIES.map(
            (item) => `
              <button class="automation-category ${item === category ? "automation-category--active" : ""}" data-action="set-automation-category" data-automation-category="${esc(item)}">
                ${esc(item)}
              </button>
            `,
          ).join("")}
        </aside>
        <div class="automation-content">
          <section class="automation-section">
            <div class="automation-section__header">
              <h2 class="automation-section__heading">${esc(category)}</h2>
            </div>
            ${
              templates.length
                ? `<div class="automation-template-grid">${templates
                    .map((template) => renderAutomationTemplateCard(template))
                    .join("")}</div>`
                : `<div class="empty-list">${t("No templates in this category yet.", "这个分类下还没有模板。")}</div>`
            }
          </section>
          <section class="automation-section">
            <div class="automation-section__header">
              <h2 class="automation-section__heading">${t("Saved automations", "已保存自动化")}</h2>
            </div>
            ${
              savedAutomations.length
                ? `<div class="automation-card-list">${savedAutomations
                    .map((automation) => renderAutomationCard(automation))
                    .join("")}</div>`
                : `<div class="empty-list">${t(
                    "No automations created in this category yet.",
                    "这个分类下还没有创建任何自动化。",
                  )}</div>`
            }
          </section>
        </div>
      </div>
    </section>
  `;
}

function settingCard(titleEn, titleZh, hintEn, hintZh, control) {
  return `
    <label class="settings-card">
      <span class="settings-card__title">${esc(t(titleEn, titleZh))}</span>
      <span class="settings-card__hint">${esc(t(hintEn, hintZh))}</span>
      ${control}
    </label>
  `;
}

function infoCard(titleEn, titleZh, hintEn, hintZh, content) {
  return `
    <section class="settings-card settings-card--info">
      <span class="settings-card__title">${esc(t(titleEn, titleZh))}</span>
      <span class="settings-card__hint">${esc(t(hintEn, hintZh))}</span>
      <div class="settings-card__meta">${content}</div>
    </section>
  `;
}

function settingSelect(path, value, options) {
  return `
    <select data-setting="${path}">
      ${options
        .map(
          ([optionValue, en, zh]) => `
            <option value="${esc(optionValue)}" ${optionValue === value ? "selected" : ""}>
              ${esc(t(en, zh))}
            </option>
          `,
        )
        .join("")}
    </select>
  `;
}

function settingToggle(path, value) {
  return `<input data-setting="${path}" type="checkbox" ${value ? "checked" : ""} />`;
}

function settingInput(path, value, type = "text", placeholder = "") {
  return `<input data-setting="${path}" type="${type}" value="${esc(value ?? "")}" placeholder="${esc(placeholder)}" />`;
}

function settingChoices(path, value, options) {
  return `
    <div class="composer__actions">
      ${options
        .map(
          ([optionValue, en, zh]) => `
            <button
              class="${optionValue === value ? "primary-button" : "ghost-button"}"
              type="button"
              data-action="choose-setting"
              data-setting="${path}"
              data-value="${esc(optionValue)}"
            >
              ${esc(t(en, zh))}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderGeneralSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("General", "通用")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Default open destination",
          "默认打开目标",
          "Where files and folders open by default.",
          "默认打开文件和文件夹的位置。",
          settingSelect("general.defaultOpenDestination", config.general.defaultOpenDestination, [
            ["fileExplorer", "File Explorer", "文件资源管理器"],
            ["workspaceHome", "Workspace home", "工作区主页"],
          ]),
        )}
        ${settingCard(
          "Agent environment",
          "Agent 环境",
          "Choose where the agent runs on Windows.",
          "选择 Windows 上的运行环境。",
          settingSelect("general.agentEnvironment", config.general.agentEnvironment, [
            ["windowsNative", "Windows native", "Windows 原生"],
            ["workspaceBound", "Workspace bound", "绑定工作区"],
          ]),
        )}
        ${settingCard(
          "Integrated terminal shell",
          "集成终端 Shell",
          "Choose which shell opens in the integrated terminal.",
          "选择集成终端默认 Shell。",
          settingSelect("general.integratedTerminalShell", config.general.integratedTerminalShell, [
            ["powershell", "PowerShell", "PowerShell"],
            ["cmd", "Command Prompt", "命令提示符"],
            ["gitbash", "Git Bash", "Git Bash"],
          ]),
        )}
        ${settingCard(
          "Language",
          "语言",
          "Language for the app UI and runtime preference.",
          "应用界面和运行时偏好的语言。",
          settingSelect("general.language", config.general.language, [
            ["auto", "Auto detect", "自动检测"],
            ["zh-CN", "Chinese", "中文"],
            ["en-US", "English", "英文"],
          ]),
        )}
        ${settingCard(
          "Speed",
          "速度",
          "Choose how quickly inference runs across threads.",
          "选择跨线程运行的推理速度。",
          settingSelect("general.speed", config.general.speed, [
            ["standard", "Standard", "标准"],
            ["fast", "Fast", "快速"],
          ]),
        )}
        ${settingCard(
          "Follow-up behavior",
          "追问行为",
          "How new prompts behave while a run is active.",
          "当线程还在运行时，新提示词如何处理。",
          settingChoices("general.followUpBehavior", config.general.followUpBehavior, [
            ["queue", "Queue", "排队"],
            ["steer", "Steer", "接管"],
          ]),
        )}
        ${settingCard(
          "Require Ctrl+Enter for long prompts",
          "长提示词使用 Ctrl+Enter 发送",
          "When enabled, multiline prompts require Ctrl+Enter to send.",
          "启用后，多行提示词需要 Ctrl+Enter 才发送。",
          settingToggle(
            "general.requireCtrlEnterForLongPrompts",
            config.general.requireCtrlEnterForLongPrompts,
          ),
        )}
        ${settingCard(
          "Completion notifications",
          "完成通知",
          "Choose when completion notifications should appear.",
          "选择何时显示完成通知。",
          settingSelect(
            "general.notifications.completion",
            config.general.notifications.completion,
            [
              ["onlyWhenUnfocused", "Only when unfocused", "仅在未聚焦时"],
              ["always", "Always", "始终"],
              ["never", "Never", "从不"],
            ],
          ),
        )}
        ${infoCard(
          "Author",
          "作者",
          "Maintainer and contact information for this app.",
          "此应用的维护者与联系方式。",
          `
            <div><strong>宫丰霖</strong></div>
            <div><a class="settings-link" href="mailto:gongfenglin@sdust.edu.cn">gongfenglin@sdust.edu.cn</a></div>
            <div><a class="settings-link" href="https://2830500285.github.io/" target="_blank" rel="noreferrer">https://2830500285.github.io/</a></div>
          `,
        )}
      </div>
      <div class="settings-actions">
        <span class="meta-pill">${esc(state.settingsNotice || t("No pending changes", "当前没有待保存更改"))}</span>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderAppearanceSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Appearance", "外观")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Theme",
          "主题",
          "Use light, dark, or match your system.",
          "使用浅色、深色或跟随系统。",
          settingChoices("appearance.themeMode", config.appearance.themeMode, [
            ["light", "Light", "浅色"],
            ["dark", "Dark", "深色"],
            ["system", "System", "系统"],
          ]),
        )}
        ${settingCard(
          "UI font size",
          "界面字体大小",
          "Adjust the base font size for the app UI.",
          "调整应用界面的基础字体大小。",
          settingInput("appearance.uiFontSize", config.appearance.uiFontSize, "number"),
        )}
        ${settingCard(
          "Code font size",
          "代码字体大小",
          "Adjust code and technical text font size.",
          "调整代码和技术文本字体大小。",
          settingInput("appearance.codeFontSize", config.appearance.codeFontSize, "number"),
        )}
        ${settingCard(
          "UI font stack",
          "界面字体栈",
          "Set the UI font family stack.",
          "设置界面字体栈。",
          settingInput("appearance.uiFontFamily", config.appearance.uiFontFamily),
        )}
        ${settingCard(
          "Code font stack",
          "代码字体栈",
          "Set the code font family stack.",
          "设置代码字体栈。",
          settingInput("appearance.codeFontFamily", config.appearance.codeFontFamily),
        )}
        ${settingCard(
          "Pointer cursors",
          "指针光标",
          "Use pointer cursors on interactive elements.",
          "为交互元素使用手型光标。",
          settingToggle("appearance.pointerCursor", config.appearance.pointerCursor),
        )}
        ${settingCard(
          "Translucent sidebar",
          "半透明侧边栏",
          "Use translucent sidebar styling in light mode.",
          "在浅色模式下使用半透明侧边栏。",
          settingToggle(
            "appearance.lightTheme.translucentSidebar",
            config.appearance.lightTheme.translucentSidebar,
          ),
        )}
      </div>
      <div class="settings-actions">
        <span class="meta-pill">${esc(state.settingsNotice || t("Live preview enabled", "已启用实时预览"))}</span>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderConfigurationSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Configuration", "配置")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Config scope",
          "配置范围",
          "Choose where app-level config should apply.",
          "选择应用级配置生效范围。",
          settingSelect("configuration.configScope", config.configuration.configScope, [
            ["user", "User config", "用户配置"],
            ["project", "Project config", "项目配置"],
          ]),
        )}
        ${settingCard(
          "Approval policy",
          "审批策略",
          "Choose when the agent asks for approval.",
          "选择何时请求审批。",
          settingSelect("configuration.approvalPolicy", config.configuration.approvalPolicy, [
            ["on-request", "On request", "按需请求"],
            ["on-failure", "On failure", "失败时请求"],
            ["never", "Never", "从不"],
          ]),
        )}
        ${settingCard(
          "Sandbox mode",
          "沙箱模式",
          "Choose how much the runtime can modify.",
          "选择运行时的修改权限范围。",
          settingSelect("configuration.sandboxMode", config.configuration.sandboxMode, [
            ["workspace-write", "Workspace write", "工作区可写"],
            ["read-only", "Read only", "只读"],
            ["full-access", "Full access", "完全访问"],
          ]),
        )}
        ${settingCard(
          "Default model",
          "默认模型",
          "Used when a thread does not override its own model.",
          "当线程没有单独指定模型时使用。",
          settingInput("defaultModel", config.defaultModel),
        )}
        ${settingCard(
          "Default permission mode",
          "默认权限模式",
          "Used when a thread does not override permission mode.",
          "当线程没有单独指定权限模式时使用。",
          settingSelect("defaultPermissionMode", config.defaultPermissionMode, [
            ["default", "default", "default"],
            ["plan", "plan", "plan"],
            ["acceptEdits", "acceptEdits", "acceptEdits"],
            ["dontAsk", "dontAsk", "dontAsk"],
            ["bypassPermissions", "bypassPermissions", "bypassPermissions"],
          ]),
        )}
        ${settingCard(
          "Include model thinking",
          "显示模型思路",
          "Show captured thinking blocks in live messages.",
          "在实时消息中显示模型思路块。",
          settingToggle("includeThinking", config.includeThinking),
        )}
        ${settingCard(
          "API key",
          "API Key",
          state.config?.hasApiKey
            ? "A key is already stored. Leave blank to keep it."
            : "Paste a key to store it in the local app config.",
          state.config?.hasApiKey
            ? "当前已有存储的 Key。留空则保持不变。"
            : "粘贴 Key 后会保存在本地应用配置里。",
          `<input id="api-key-input" type="password" value="${esc(state.apiKeyDraft)}" placeholder="${esc(
            state.config?.hasApiKey ? t("Stored key present", "当前已有已存储 Key") : "sk-...",
          )}" />`,
        )}
      </div>
      <section>
        <div class="workspace-home__section-title">${t("Import external config", "导入外部配置")}</div>
        <div class="search-results">
          ${
            state.importCandidates.length
              ? state.importCandidates
                  .map(
                    (source) => `
                      <article class="archived-card">
                        <div class="summary-card__title">${esc(source.label || source.id)}</div>
                        <div class="archived-card__body">${esc(source.path || "")}</div>
                        <div class="archived-card__actions">
                          <button class="ghost-button" data-action="open-system-path" data-path="${esc(source.path || "")}">${t(
                            "Open path",
                            "打开路径",
                          )}</button>
                          <button class="primary-button" data-action="import-config" data-source-id="${esc(source.id)}">${t(
                            "Import",
                            "导入",
                          )}</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<div class="empty-list">${t("No importable configs found yet.", "暂时没有可导入的配置。")}</div>`
          }
        </div>
      </section>
      <div class="settings-actions">
        <span class="meta-pill">${esc(state.settingsNotice || t("Configuration ready", "配置已就绪"))}</span>
        <button class="ghost-button" data-action="clear-api-key">${t("Clear key", "清空 Key")}</button>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderModelsSettings() {
  const config = draftConfig();
  const profiles = modelProfiles();
  const defaultOptions = [["", "No default profile", "不设置默认模型组"], ...profiles.map((profile) => [
    profile.id,
    profile.name || profile.apiModel || "Model profile",
    profile.name || profile.apiModel || "模型配置",
  ])];

  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Models", "模型")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Default model profile",
          "默认模型组",
          "Used when a thread does not choose its own model profile.",
          "当线程没有单独选择模型组时使用。",
          settingSelect("defaultModelProfileId", config.defaultModelProfileId || "", defaultOptions),
        )}
        ${settingCard(
          "Legacy default model",
          "旧版默认模型",
          "Optional fallback for Anthropic CLI mode when no profile-specific model is set.",
          "当 Anthropic CLI 模式未设置模型组专属模型时的兜底值。",
          settingInput("defaultModel", config.defaultModel, "text", "claude-sonnet-4-5"),
        )}
      </div>
      <section>
        <div class="workspace-home__section-title">${t("Model profiles", "模型配置列表")}</div>
        <div class="archived-list">
          ${
            profiles.length
              ? profiles
                  .map(
                    (profile) => `
                      <article class="archived-card">
                        <div class="archived-card__actions">
                          <div class="summary-card__title">${esc(profile.name || profile.apiModel || "Model profile")}</div>
                          <button class="ghost-button ghost-button--danger" data-action="remove-model-profile" data-profile-id="${esc(profile.id)}">${t(
                            "Delete",
                            "删除",
                          )}</button>
                        </div>
                        <div class="settings-card-list">
                          ${settingCard(
                            "Profile name",
                            "配置名称",
                            "Display name used in the app.",
                            "在应用里显示的名称。",
                            `<input data-model-profile-id="${esc(profile.id)}" data-model-profile-key="name" type="text" value="${esc(profile.name || "")}" placeholder="${esc(
                              t("DeepSeek Reasoner", "DeepSeek 推理"),
                            )}" />`,
                          )}
                          ${settingCard(
                            "Protocol",
                            "协议",
                            "Anthropic uses the built-in CLI runtime. OpenAI compatible calls chat/completions directly.",
                            "Anthropic 使用内置 CLI。OpenAI Compatible 会直接调用 chat/completions。",
                            `<select data-model-profile-id="${esc(profile.id)}" data-model-profile-key="protocol">
                              <option value="anthropic" ${profile.protocol === "anthropic" ? "selected" : ""}>Anthropic</option>
                              <option value="openai" ${profile.protocol === "openai" ? "selected" : ""}>OpenAI Compatible</option>
                            </select>`,
                          )}
                          ${settingCard(
                            "URL",
                            "URL",
                            "Anthropic: base API URL. OpenAI compatible: base URL or full /chat/completions endpoint.",
                            "Anthropic 填基础 API URL。OpenAI Compatible 可填基础 URL 或完整 /chat/completions 地址。",
                            `<input data-model-profile-id="${esc(profile.id)}" data-model-profile-key="baseUrl" type="text" value="${esc(profile.baseUrl || "")}" placeholder="${esc(
                              profile.protocol === "openai"
                                ? "https://api.openai.com/v1"
                                : "https://api.anthropic.com",
                            )}" />`,
                          )}
                          ${settingCard(
                            "API key",
                            "API Key",
                            "Saved locally and reused when the app reopens.",
                            "保存在本地，重新打开应用时会继续复用。",
                            `<input data-model-profile-id="${esc(profile.id)}" data-model-profile-key="apiKey" type="password" value="${esc(profile.apiKey || "")}" placeholder="sk-..." />`,
                          )}
                          ${settingCard(
                            "API model",
                            "API Model",
                            "Exact model name sent to the provider.",
                            "实际发送给服务商的模型名。",
                            `<input data-model-profile-id="${esc(profile.id)}" data-model-profile-key="apiModel" type="text" value="${esc(profile.apiModel || "")}" placeholder="${esc(
                              profile.protocol === "openai" ? "gpt-4.1-mini / deepseek-chat" : "claude-sonnet-4-5",
                            )}" />`,
                          )}
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<div class="empty-list">${t(
                  "No model profiles yet. Add one for Anthropic, OpenAI, DeepSeek, or other compatible endpoints.",
                  "还没有模型配置。可以添加 Anthropic、OpenAI、DeepSeek 或其他兼容端点。",
                )}</div>`
          }
        </div>
      </section>
      <div class="settings-actions">
        <span class="meta-pill">${esc(state.settingsNotice || t("Model settings ready", "模型设置已就绪"))}</span>
        <button class="ghost-button" data-action="add-model-profile">${t("Add profile", "新增模型组")}</button>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderWorktreesSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Worktrees", "Worktrees")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Automatically delete old worktrees",
          "自动删除旧 Worktree",
          "Recommended for most users.",
          "推荐大多数用户开启。",
          settingToggle("worktrees.autoDeleteOldWorktrees", config.worktrees.autoDeleteOldWorktrees),
        )}
        ${settingCard(
          "Auto-delete limit",
          "自动删除保留数量",
          "How many worktrees to keep before pruning old ones.",
          "在清理旧 worktree 前最多保留多少个。",
          settingInput("worktrees.autoDeleteLimit", config.worktrees.autoDeleteLimit, "number"),
        )}
      </div>
      <section>
        <div class="workspace-home__section-title">${t("Detected worktrees", "检测到的 Worktrees")}</div>
        <div class="search-results">
          ${
            state.worktreeItems.length
              ? state.worktreeItems
                  .map(
                    (item) => `
                      <article class="archived-card">
                        <div class="summary-card__title">${esc(item.workspaceName || item.path || "worktree")}</div>
                        <div class="archived-card__body">${esc(item.path || "")}</div>
                        <div class="archived-card__body">${esc(
                          [item.branch, item.head].filter(Boolean).join(" · "),
                        )}</div>
                        <div class="archived-card__actions">
                          ${item.current ? `<span class="meta-pill">${t("current", "当前")}</span>` : ""}
                          ${item.locked ? `<span class="meta-pill">${t("locked", "锁定")}</span>` : ""}
                          <button class="ghost-button" data-action="open-system-path" data-path="${esc(item.path || "")}">${t(
                            "Open",
                            "打开",
                          )}</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<div class="empty-list">${t("No worktrees detected yet.", "暂未检测到 worktree。")}</div>`
          }
        </div>
      </section>
      <div class="settings-actions">
        <button class="ghost-button" data-action="refresh-worktrees">${t("Refresh", "刷新")}</button>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderArchivedSettings() {
  const threads = archivedThreads();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Archived chats", "归档对话")}</h1>
      <div class="archived-list">
        ${
          threads.length
            ? threads
                .map(
                  (thread) => `
                    <article class="archived-card">
                      <div class="archived-card__eyebrow">${esc(
                        workspaceById(thread.workspaceId)?.name || t("Workspace", "工作区"),
                      )}</div>
                      <div class="summary-card__title">${esc(thread.title)}</div>
                      <div class="archived-card__body">${esc(threadSummary(thread))}</div>
                      <div class="archived-card__actions">
                        <button class="ghost-button" data-action="restore-thread" data-thread-id="${thread.id}">${t(
                          "Restore",
                          "恢复",
                        )}</button>
                        <button class="ghost-button ghost-button--danger" data-action="delete-thread" data-thread-id="${thread.id}">${t(
                          "Delete",
                          "删除",
                        )}</button>
                      </div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="empty-list">${t("No archived chats.", "没有归档对话。")}</div>`
        }
      </div>
    </section>
  `;
}

function renderMcpSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("MCP servers", "MCP 服务")}</h1>
      <div class="archived-list">
        ${config.mcpServers
          .map(
            (server) => `
              <article class="archived-card">
                <div class="summary-card__title">${esc(server.name)}</div>
                <div class="archived-card__body">${esc(server.id)}</div>
                <div class="settings-card-list">
                  ${settingCard(
                    "Enabled",
                    "启用",
                    "Turn this MCP server on or off.",
                    "启用或关闭这个 MCP 服务。",
                    `<input data-server-id="${esc(server.id)}" data-server-key="enabled" type="checkbox" ${server.enabled ? "checked" : ""} />`,
                  )}
                  ${settingCard(
                    "Authenticated",
                    "已认证",
                    "Stored auth state for this server.",
                    "这个服务的认证状态。",
                    `<input data-server-id="${esc(server.id)}" data-server-key="authenticated" type="checkbox" ${server.authenticated ? "checked" : ""} />`,
                  )}
                  ${settingCard(
                    "Command",
                    "命令",
                    "Custom launch command if needed.",
                    "如有需要可自定义启动命令。",
                    `<input data-server-id="${esc(server.id)}" data-server-key="command" value="${esc(server.command || "")}" />`,
                  )}
                </div>
                <label class="field">
                  <span>${t("Notes", "备注")}</span>
                  <textarea data-server-id="${esc(server.id)}" data-server-key="notes" rows="3">${esc(server.notes || "")}</textarea>
                </label>
                <div class="archived-card__actions">
                  ${server.requiresAuth ? `<span class="meta-pill">${t("Auth required", "需要认证")}</span>` : ""}
                  ${server.builtIn ? `<span class="meta-pill">${t("Built in", "内置")}</span>` : ""}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="settings-actions">
        <button class="ghost-button" data-action="add-mcp-server">${t("Add server", "添加服务")}</button>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderGitSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Git", "Git")}</h1>
      <div class="settings-card-list">
        ${settingCard(
          "Branch prefix",
          "分支前缀",
          "Prefix used when creating new branches.",
          "创建新分支时使用的前缀。",
          settingInput("git.branchPrefix", config.git.branchPrefix),
        )}
        ${settingCard(
          "Pull request merge method",
          "PR 合并方式",
          "Choose how pull requests should merge by default.",
          "选择默认的 PR 合并方式。",
          settingChoices("git.pullRequestMergeMethod", config.git.pullRequestMergeMethod, [
            ["merge", "Merge", "Merge"],
            ["squash", "Squash", "Squash"],
            ["rebase", "Rebase", "Rebase"],
          ]),
        )}
        ${settingCard(
          "Show PR icons in sidebar",
          "侧栏显示 PR 图标",
          "Display PR status icons in thread rows.",
          "在线程行里显示 PR 状态图标。",
          settingToggle("git.showPrIcons", config.git.showPrIcons),
        )}
        ${settingCard(
          "Always force push",
          "始终强制推送",
          "Use force-with-lease when pushing from the app.",
          "从应用推送时使用 force-with-lease。",
          settingToggle("git.alwaysForcePush", config.git.alwaysForcePush),
        )}
        ${settingCard(
          "Create draft pull requests",
          "创建草稿 PR",
          "Use draft pull requests by default.",
          "默认创建草稿 PR。",
          settingToggle("git.createDraftPullRequests", config.git.createDraftPullRequests),
        )}
      </div>
      <label class="field">
        <span>${t("Commit instructions", "Commit 指令")}</span>
        <textarea data-setting="git.commitInstructions" rows="5">${esc(config.git.commitInstructions || "")}</textarea>
      </label>
      <label class="field">
        <span>${t("Pull request instructions", "PR 指令")}</span>
        <textarea data-setting="git.pullRequestInstructions" rows="5">${esc(config.git.pullRequestInstructions || "")}</textarea>
      </label>
      <div class="settings-actions">
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderEnvironmentsSettings() {
  const config = draftConfig();
  return `
    <section class="settings-section">
      <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
      <h1 class="settings-section__title">${t("Environments", "环境")}</h1>
      <div class="archived-list">
        ${state.workspaces
          .map((workspace) => {
            const profile = config.environments.find(
              (item) => item.workspaceId === workspace.id,
            );
            return `
              <article class="archived-card">
                <div class="summary-card__title">${esc(workspace.name)}</div>
                <div class="archived-card__body">${esc(workspace.cwd)}</div>
                ${
                  profile
                    ? `
                        <div class="settings-card-list">
                          ${settingCard(
                            "Shell",
                            "Shell",
                            "Default shell for this workspace profile.",
                            "这个工作区配置使用的默认 Shell。",
                            `<select data-env-workspace="${workspace.id}" data-env-key="shell">
                              ${["powershell", "cmd", "gitbash"]
                                .map(
                                  (shell) => `
                                    <option value="${shell}" ${shell === profile.shell ? "selected" : ""}>${shell}</option>
                                  `,
                                )
                                .join("")}
                            </select>`,
                          )}
                          ${settingCard(
                            "Startup command",
                            "启动命令",
                            "Optional command to run when entering this environment.",
                            "进入这个环境时可选的启动命令。",
                            `<input data-env-workspace="${workspace.id}" data-env-key="startupCommand" value="${esc(profile.startupCommand || "")}" />`,
                          )}
                        </div>
                        <label class="field">
                          <span>${t("Notes", "备注")}</span>
                          <textarea data-env-workspace="${workspace.id}" data-env-key="notes" rows="3">${esc(profile.notes || "")}</textarea>
                        </label>
                        <div class="archived-card__actions">
                          <button class="ghost-button ghost-button--danger" data-action="remove-environment-profile" data-workspace-id="${workspace.id}">${t(
                            "Remove profile",
                            "移除配置",
                          )}</button>
                        </div>
                      `
                    : `
                        <div class="archived-card__actions">
                          <button class="ghost-button" data-action="add-environment-profile" data-workspace-id="${workspace.id}">${t(
                            "Enable profile",
                            "启用配置",
                          )}</button>
                        </div>
                      `
                }
              </article>
            `;
          })
          .join("")}
      </div>
      <div class="settings-actions">
        <button class="ghost-button" data-action="add-project-environment">${t("Add project", "添加项目")}</button>
        <button class="primary-button" data-action="save-settings">${t("Save", "保存")}</button>
      </div>
    </section>
  `;
}

function renderSettingsPlaceholder() {
  screenElement.innerHTML = `
    <section class="settings-shell">
      <aside class="settings-shell__nav">
        <button class="settings-shell__back" data-action="open-view" data-view="chat">${t(
          "Back to app",
          "返回应用",
        )}</button>
        <nav class="settings-nav">
          ${SETTINGS_SECTIONS.map(
            ([id, en, zh]) => `
              <button class="settings-nav__item ${
                state.settingsSection === id ? "settings-nav__item--active" : ""
              }" data-action="open-settings-section" data-section="${id}">${esc(t(en, zh))}</button>
            `,
          ).join("")}
        </nav>
      </aside>
      <div class="settings-shell__content">
        ${
          state.settingsSection === "general"
            ? renderGeneralSettings()
            : state.settingsSection === "appearance"
              ? renderAppearanceSettings()
              : state.settingsSection === "configuration"
                ? renderConfigurationSettings()
                : state.settingsSection === "models"
                  ? renderModelsSettings()
                : state.settingsSection === "mcp"
                  ? renderMcpSettings()
                  : state.settingsSection === "git"
                    ? renderGitSettings()
                    : state.settingsSection === "environments"
                      ? renderEnvironmentsSettings()
                : state.settingsSection === "worktrees"
                  ? renderWorktreesSettings()
                  : state.settingsSection === "archived"
                    ? renderArchivedSettings()
              : `
                  <section class="settings-section">
                    <div class="chat-view__eyebrow">${t("Settings", "设置")}</div>
                    <h1 class="settings-section__title">${esc(
                      t(
                        SETTINGS_SECTIONS.find(([id]) => id === state.settingsSection)?.[1] || "Settings",
                        SETTINGS_SECTIONS.find(([id]) => id === state.settingsSection)?.[2] || "设置",
                      ),
                    )}</h1>
                    <p class="panel-view__body">${t(
                      "This section is queued next. I am enabling the settings pages one group at a time so the app stays stable after each patch.",
                      "这个分区排在下一步。我正在按分组逐个启用设置页，保证每次补丁之后应用都保持稳定。",
                    )}</p>
                  </section>
                `
        }
      </div>
    </section>
  `;
}

function render() {
  ensureSelection();
  renderSidebar();
  if (state.view === "search") {
    renderSearchWorkbench();
    renderContextMenu();
    return;
  }
  if (state.view === "plugins") {
    renderPluginsWorkspace();
    renderContextMenu();
    return;
  }
  if (state.view === "automations") {
    renderAutomationsWorkbench();
    renderContextMenu();
    return;
  }
  if (state.view === "settings") {
    renderSettingsPlaceholder();
    renderContextMenu();
    return;
  }

  const thread = currentThread();
  if (thread) {
    renderThreadView(thread);
    renderContextMenu();
    return;
  }
  renderWorkspaceHome();
  renderContextMenu();
}

function attachEvents() {
  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-library-filter]")) {
      const key = target.dataset.libraryFilter;
      if (!key) {
        return;
      }
      const nextValue = target.value || "";
      if (key === "search") {
        state.librarySearch = nextValue;
      }
      if (key === "provider") {
        state.libraryProvider = nextValue;
      }
      if (key === "category") {
        state.libraryCategory = nextValue;
      }
      if (key === "source") {
        state.librarySource = nextValue;
      }
      render();
      return;
    }

    if (target.matches("[data-library-composer]")) {
      if (!state.libraryComposer) {
        return;
      }
      const key = target.dataset.libraryComposer;
      if (!key) {
        return;
      }
      const previousName = state.libraryComposer.name || "";
      const previousSlug = state.libraryComposer.slug || "";
      state.libraryComposer[key] = target.value || "";
      if (
        key === "name" &&
        (!previousSlug || previousSlug === slugify(previousName))
      ) {
        const nextSlug = slugify(target.value || "");
        state.libraryComposer.slug = nextSlug;
        const slugInput = document.querySelector("[data-library-composer='slug']");
        if (slugInput instanceof HTMLInputElement) {
          slugInput.value = nextSlug;
        }
      }
      return;
    }

    if (target.matches("[data-search-query]")) {
      state.search = target.value || "";
      state.searchFocusRequested = true;
      render();
      return;
    }

    if (target.matches("[data-automation-composer]")) {
      if (!state.automationComposer) {
        return;
      }
      const key = target.dataset.automationComposer;
      if (!key) {
        return;
      }
      const value =
        target instanceof HTMLInputElement && target.type === "number"
          ? Number(target.value || 0)
          : target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value;
      state.automationComposer[key] = value;
      if (key === "frequency" && value !== "weekly") {
        state.automationComposer.weekdays = state.automationComposer.weekdays?.length
          ? state.automationComposer.weekdays
          : [1];
      }
      render();
      return;
    }

    if (target.matches("[data-automation-weekday]")) {
      if (!state.automationComposer) {
        return;
      }
      const day = Number(target.dataset.automationWeekday);
      const next = new Set(Array.isArray(state.automationComposer.weekdays) ? state.automationComposer.weekdays : []);
      if (target.checked) {
        next.add(day);
      } else {
        next.delete(day);
      }
      state.automationComposer.weekdays = [...next].sort((left, right) => left - right);
      return;
    }

    if (target.matches("[data-setting]")) {
      const path = target.dataset.setting;
      if (!path) {
        return;
      }
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : target instanceof HTMLInputElement && target.type === "number"
            ? Number(target.value || 0)
            : target.value;
      setDraftValue(path, value);
      return;
    }

    if (target.id === "api-key-input") {
      state.apiKeyDraft = target.value;
      state.apiKeyTouched = true;
      state.clearApiKey = false;
      state.settingsNotice = t("Unsaved changes", "有未保存更改");
      return;
    }

    if (target.matches("[data-server-id][data-server-key]")) {
      const serverId = target.dataset.serverId;
      const key = target.dataset.serverKey;
      if (!serverId || !key) {
        return;
      }
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : target.value;
      upsertMcpServerDraft(serverId, {
        [key]: value,
      });
      return;
    }

    if (target.matches("[data-env-workspace][data-env-key]")) {
      const workspaceId = target.dataset.envWorkspace;
      const key = target.dataset.envKey;
      if (!workspaceId || !key) {
        return;
      }
      updateEnvironmentDraft(workspaceId, {
        [key]: target.value,
      });
      return;
    }

    if (target.matches("[data-model-profile-id][data-model-profile-key]")) {
      const profileId = target.dataset.modelProfileId;
      const key = target.dataset.modelProfileKey;
      if (!profileId || !key) {
        return;
      }
      updateModelProfileDraft(profileId, {
        [key]:
          target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value,
      });
      return;
    }

    if (target.id === "thread-model-profile") {
      const thread = currentThread();
      const modelInput = document.querySelector("#thread-model");
      if (!thread || !(modelInput instanceof HTMLInputElement)) {
        return;
      }
      const nextProfileId = target.value || draftConfig().defaultModelProfileId || "";
      const nextProfile = getModelProfile(nextProfileId);
      const currentValue = normalizeModelValue(modelInput.value);
      const currentEffective = effectiveThreadModelInputValue(thread);
      if (!currentValue || currentValue === currentEffective || isOpenAICompatibleProfile(nextProfile)) {
        modelInput.value = effectiveThreadModelInputValue(thread, nextProfileId);
      }
      return;
    }

    if (target.id === "composer-input") {
      state.composerText = target.value;
    }
  });

  document.addEventListener("keydown", async (event) => {
    if (event.key === "Escape" && state.contextMenu) {
      closeContextMenu();
      renderContextMenu();
      return;
    }

    const targetElement = event.target;
    const tagName = targetElement instanceof HTMLElement ? targetElement.tagName : "";
    const isEditable =
      targetElement instanceof HTMLInputElement ||
      targetElement instanceof HTMLTextAreaElement ||
      targetElement instanceof HTMLSelectElement ||
      (targetElement instanceof HTMLElement && targetElement.isContentEditable);
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (mod && !event.shiftKey && !event.altKey && key === "f") {
      event.preventDefault();
      state.view = "search";
      state.searchFocusRequested = true;
      state.searchSelectRequested = true;
      render();
      return;
    }

    if (!isEditable && mod && !event.shiftKey && !event.altKey && key === "n") {
      event.preventDefault();
      try {
        await runSearchCommand("cmd-new-chat");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (!isEditable && mod && !event.shiftKey && !event.altKey && key === "o") {
      event.preventDefault();
      try {
        await runSearchCommand("cmd-open-folder");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (!isEditable && mod && !event.shiftKey && !event.altKey && key === ",") {
      event.preventDefault();
      await runSearchCommand("cmd-open-settings");
      render();
      return;
    }

    if (!isEditable && mod && event.altKey && !event.shiftKey && key === "n") {
      event.preventDefault();
      try {
        await runSearchCommand("cmd-new-quick-chat");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (!isEditable && mod && event.shiftKey && !event.altKey && event.key === "[") {
      event.preventDefault();
      await runSearchCommand("cmd-prev-chat");
      render();
      return;
    }

    if (!isEditable && mod && event.shiftKey && !event.altKey && event.key === "]") {
      event.preventDefault();
      await runSearchCommand("cmd-next-chat");
      render();
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement) || target.id !== "composer-input") {
      return;
    }

    const requireModifier =
      draftConfig().general.requireCtrlEnterForLongPrompts &&
      target.value.includes("\n");

    const shouldSend =
      event.key === "Enter" &&
      !event.shiftKey &&
      (requireModifier ? event.ctrlKey || event.metaKey : true);

    if (!shouldSend) {
      return;
    }

    event.preventDefault();
    const thread = currentThread();
    if (!thread || liveRun(thread.id)) {
      return;
    }
    try {
      const modelProfileId = document.querySelector("#thread-model-profile")?.value || "";
    const model = submittedThreadModel(
      thread,
      modelProfileId,
      document.querySelector("#thread-model")?.value,
    );
      const permissionMode =
        document.querySelector("#thread-permission-mode")?.value || state.config.defaultPermissionMode;
      await updateThread(thread.id, {
        model,
        modelProfileId: modelProfileId || null,
        permissionMode,
      });
      const message = state.composerText.trim();
      const attachments = Array.isArray(state.composerAttachments)
        ? state.composerAttachments
        : [];
      if (!message && !attachments.length) {
        return;
      }
      clearThreadNotice();
      stickThreadViewportToBottom(thread.id);
      await runThreadPrompt(thread.id, message, attachments);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    }
  });

  document.addEventListener("click", async (event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    const clickedMenu = targetElement?.closest(".context-menu");
    const clickedMenuTrigger = targetElement?.closest("[data-action='toggle-workspace-menu'], [data-action='toggle-thread-menu']");
    if (state.contextMenu && !clickedMenu && !clickedMenuTrigger) {
      closeContextMenu();
      renderContextMenu();
    }

    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    const action = button.dataset.action;

    if (clickedMenu) {
      closeContextMenu();
      renderContextMenu();
    }

    if (action === "toggle-workspace-menu") {
      const workspaceId = button.dataset.workspaceId;
      if (!workspaceId) {
        return;
      }
      toggleContextMenu({
        kind: "workspace",
        source: "button",
        targetId: workspaceId,
        ...menuPositionFromElement(button),
      });
      renderContextMenu();
      return;
    }

    if (action === "toggle-thread-menu") {
      const threadId = button.dataset.threadId;
      if (!threadId) {
        return;
      }
      toggleContextMenu({
        kind: "thread",
        source: "button",
        targetId: threadId,
        ...menuPositionFromElement(button),
      });
      renderContextMenu();
      return;
    }

    if (action === "open-view") {
      state.view = button.dataset.view || "chat";
      if (state.view === "search") {
        state.searchFocusRequested = true;
      }
      if (state.view === "plugins" && !state.libraryCatalog) {
        void loadLibraryCatalog();
      }
      render();
      return;
    }

    if (action === "run-search-command") {
      try {
        const commandId = button.dataset.commandId || "";
        if (!commandId) {
          return;
        }
        await runSearchCommand(commandId);
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "set-automation-category") {
      state.automationCategory = button.dataset.automationCategory || AUTOMATION_CATEGORIES[0];
      render();
      return;
    }

    if (action === "new-automation") {
      state.automationComposer = defaultAutomationComposer();
      state.automationNotice = "";
      render();
      return;
    }

    if (action === "use-automation-template") {
      const templateId = button.dataset.templateId || "";
      const template = AUTOMATION_TEMPLATES.find((item) => item.id === templateId);
      if (!template) {
        return;
      }
      state.automationCategory = template.category;
      state.automationComposer = defaultAutomationComposer(template);
      state.automationNotice = "";
      render();
      return;
    }

    if (action === "cancel-automation-composer") {
      state.automationComposer = null;
      render();
      return;
    }

    if (action === "edit-automation") {
      const automationId = button.dataset.automationId || "";
      const automation = automationById(automationId);
      if (!automation) {
        return;
      }
      state.automationCategory = automation.category || state.automationCategory;
      state.automationComposer = {
        category: automation.category || AUTOMATION_CATEGORIES[0],
        description: automation.description || "",
        enabled: automation.enabled !== false,
        frequency: automation.frequency || "daily",
        id: "",
        intervalHours: automation.intervalHours || 24,
        mode: "edit",
        modelProfileId: automation.modelProfileId || "",
        name: automation.name || "",
        permissionMode: automation.permissionMode || "",
        prompt: automation.prompt || "",
        sourceAutomationId: automation.id,
        timeOfDay: automation.timeOfDay || "09:00",
        weekdays: Array.isArray(automation.weekdays) && automation.weekdays.length ? [...automation.weekdays] : [1],
        workspaceId: automation.workspaceId || currentWorkspace()?.id || "",
      };
      render();
      return;
    }

    if (action === "save-automation-composer") {
      try {
        const composer = state.automationComposer;
        if (!composer) {
          return;
        }
        const name = String(composer.name || "").trim();
        const prompt = String(composer.prompt || "").trim();
        if (!name) {
          window.alert(t("Please enter an automation name.", "请先填写自动化名称。"));
          return;
        }
        if (!prompt) {
          window.alert(t("Please enter the automation prompt.", "请先填写自动化提示词。"));
          return;
        }
        const workspaceId = composer.workspaceId || currentWorkspace()?.id || state.workspaces[0]?.id;
        if (!workspaceId) {
          window.alert(t("Please add a workspace first.", "请先添加一个工作区。"));
          return;
        }
        const payload = {
          category: composer.category || AUTOMATION_CATEGORIES[0],
          description: String(composer.description || "").trim(),
          enabled: composer.enabled !== false,
          frequency: composer.frequency || "daily",
          intervalHours: Number(composer.intervalHours || 24),
          modelProfileId: composer.modelProfileId || null,
          name,
          permissionMode: composer.permissionMode || null,
          prompt,
          timeOfDay: composer.timeOfDay || "09:00",
          weekdays: Array.isArray(composer.weekdays) ? composer.weekdays : [1],
          workspaceId,
        };
        if (composer.mode === "edit" && composer.sourceAutomationId) {
          await updateAutomationItem(composer.sourceAutomationId, payload);
          state.automationNotice = t("Automation updated", "自动化已更新");
        } else {
          await createAutomationItem(payload);
          state.automationNotice = t("Automation created", "自动化已创建");
        }
        state.automationCategory = payload.category;
        state.automationComposer = null;
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "toggle-automation-enabled") {
      try {
        const automationId = button.dataset.automationId || "";
        const automation = automationById(automationId);
        if (!automation) {
          return;
        }
        await updateAutomationItem(automation.id, {
          enabled: !automation.enabled,
        });
        state.automationNotice = automation.enabled
          ? t("Automation paused", "自动化已暂停")
          : t("Automation resumed", "自动化已恢复");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "delete-automation") {
      try {
        const automationId = button.dataset.automationId || "";
        const automation = automationById(automationId);
        if (!automation) {
          return;
        }
        const confirmed = window.confirm(
          t(
            `Delete automation "${automation.name}" permanently?`,
            `要永久删除自动化“${automation.name}”吗？`,
          ),
        );
        if (!confirmed) {
          return;
        }
        await deleteAutomationItem(automation.id);
        if (state.automationComposer?.sourceAutomationId === automation.id) {
          state.automationComposer = null;
        }
        state.automationNotice = t("Automation deleted", "自动化已删除");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "run-automation") {
      try {
        const automationId = button.dataset.automationId || "";
        if (!automationId) {
          return;
        }
        await runAutomationNow(automationId);
        state.automationNotice = t("Automation started", "自动化已开始运行");
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "open-library-tab") {
      state.libraryTab = button.dataset.libraryTab || "plugins";
      state.libraryNotice = "";
      state.libraryComposer = null;
      if (!state.libraryCatalog) {
        void loadLibraryCatalog();
      }
      render();
      return;
    }

    if (action === "refresh-library") {
      try {
        await loadLibraryCatalog();
        state.libraryNotice = t("Refreshed", "已刷新");
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "manage-library") {
      try {
        const roots = libraryRoots();
        const path =
          state.libraryTab === "plugins"
            ? roots.pluginRoots?.root
            : roots.skillRoots?.personal || roots.skillRoots?.system;
        if (!path) {
          return;
        }
        await openSystemPath(path);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "toggle-library-composer") {
      const kind = state.libraryTab === "skills" ? "skill" : "plugin";
      state.libraryComposer =
        state.libraryComposer && state.libraryComposer.kind === kind
          ? null
          : defaultLibraryComposer(kind);
      state.libraryNotice = "";
      render();
      return;
    }

    if (action === "close-library-composer") {
      state.libraryComposer = null;
      render();
      return;
    }

    if (action === "submit-library-composer") {
      try {
        if (!state.libraryComposer) {
          return;
        }
        const name = (state.libraryComposer.name || "").trim();
        if (!name) {
          window.alert(t("Please enter a name first.", "请先填写名称。"));
          return;
        }
        const slug = (state.libraryComposer.slug || slugify(name)).trim() || slugify(name);
        const description = (state.libraryComposer.description || "").trim();
        if (state.libraryComposer.kind === "skill") {
          await createLibrarySkill({ description, name, slug });
        } else {
          await createLibraryPlugin({ description, name, slug });
        }
        state.libraryComposer = null;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "create-library-item") {
      try {
        if (state.libraryTab === "skills") {
          const name = window.prompt(t("Skill name", "技能名称"), "New Skill");
          if (!name) {
            return;
          }
          const slug = window.prompt(t("Skill id", "技能 ID"), slugify(name)) || name;
          const description =
            window.prompt(
              t("Skill description", "技能描述"),
              "Local skill created from Glaude Vibe Coder.",
            ) || "Local skill created from Glaude Vibe Coder.";
          await createLibrarySkill({ description, name, slug });
          return;
        }

        const name = window.prompt(t("Plugin name", "插件名称"), "New Plugin");
        if (!name) {
          return;
        }
        const slug = window.prompt(t("Plugin id", "插件 ID"), slugify(name)) || name;
        const description =
          window.prompt(
            t("Plugin description", "插件描述"),
            "Local plugin created from Glaude Vibe Coder.",
          ) || "Local plugin created from Glaude Vibe Coder.";
        await createLibraryPlugin({ description, name, slug });
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "open-library-path") {
      try {
        const path = button.dataset.path || "";
        if (!path) {
          return;
        }
        await openSystemPath(path);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "select-workspace") {
      state.activeWorkspaceId = button.dataset.workspaceId || null;
      state.activeThreadId = null;
      state.composerAttachments = [];
      clearThreadNotice();
      state.view = "chat";
      render();
      return;
    }

    if (action === "select-thread") {
      state.activeThreadId = button.dataset.threadId || null;
      state.activeWorkspaceId = currentThread()?.workspaceId || state.activeWorkspaceId;
      state.composerAttachments = [];
      clearThreadNotice();
      state.view = "chat";
      render();
      return;
    }

    if (action === "open-settings-section") {
      state.view = "settings";
      state.settingsSection = button.dataset.section || "general";
      if (state.settingsSection === "configuration") {
        void loadImportCandidates();
      }
      if (state.settingsSection === "worktrees") {
        void loadWorktrees();
      }
      render();
      return;
    }

    if (action === "choose-setting") {
      const path = button.dataset.setting;
      if (!path) {
        return;
      }
      setDraftValue(path, button.dataset.value || "");
      render();
      return;
    }

    if (action === "add-workspace") {
      try {
        const path = await pickDirectory(currentWorkspace()?.cwd || state.config?.workingDirectory);
        if (!path) {
          return;
        }
        await createWorkspace({ cwd: path });
        state.view = "chat";
        state.activeThreadId = null;
        state.composerAttachments = [];
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "pick-workspace-directory") {
      try {
        const workspaceId = button.dataset.workspaceId;
        const workspace = workspaceById(workspaceId);
        if (!workspace) {
          return;
        }
        const path = await pickDirectory(workspace.cwd);
        if (!path) {
          return;
        }
        await updateWorkspace(workspace.id, { cwd: path });
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "rename-workspace") {
      try {
        const workspaceId = button.dataset.workspaceId || currentWorkspace()?.id;
        const workspace = workspaceById(workspaceId);
        if (!workspace) {
          return;
        }
        const nextName = window.prompt(
          t("Workspace name", "文件夹名称"),
          workspace.name || "",
        );
        if (nextName === null) {
          return;
        }
        const trimmed = nextName.trim();
        if (!trimmed) {
          window.alert(t("Workspace name cannot be empty.", "文件夹名称不能为空。"));
          return;
        }
        await updateWorkspace(workspace.id, { name: trimmed });
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "delete-workspace") {
      try {
        const workspaceId = button.dataset.workspaceId || currentWorkspace()?.id;
        const workspace = workspaceById(workspaceId);
        if (!workspace) {
          return;
        }
        const chatCount = state.threads.filter((thread) => thread.workspaceId === workspace.id).length;
        const confirmed = window.confirm(
          chatCount
            ? t(
                `Delete this folder and its ${chatCount} chats permanently?`,
                `要永久删除这个文件夹以及其中的 ${chatCount} 个对话吗？`,
              )
            : t("Delete this folder from the app?", "要从应用中删除这个文件夹吗？"),
        );
        if (!confirmed) {
          return;
        }
        await deleteWorkspace(workspace.id);
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "new-thread-global" || action === "new-thread-current" || action === "new-thread-workspace") {
      try {
        const workspaceId =
          button.dataset.workspaceId || currentWorkspace()?.id || state.workspaces[0]?.id;
        if (!workspaceId) {
          window.alert(t("Add a workspace first.", "请先添加工作区。"));
          return;
        }
        await createThread({ workspaceId });
        state.composerAttachments = [];
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "rename-thread") {
      try {
        const threadId = button.dataset.threadId || currentThread()?.id;
        const thread = threadId ? state.threads.find((item) => item.id === threadId) : null;
        if (!thread) {
          return;
        }
        const nextTitle = window.prompt(
          t("Chat title", "对话名称"),
          thread.title || "",
        );
        if (nextTitle === null) {
          return;
        }
        const trimmed = nextTitle.trim();
        if (!trimmed) {
          window.alert(t("Chat title cannot be empty.", "对话名称不能为空。"));
          return;
        }
        await updateThread(thread.id, { title: trimmed });
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "open-system-path") {
      try {
        await openSystemPath(button.dataset.path || "");
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "send-message") {
      try {
        const threadId = button.dataset.threadId;
        const thread = threadId ? state.threads.find((item) => item.id === threadId) : currentThread();
        if (!thread) {
          return;
        }
        if (liveRun(thread.id)) {
          return;
        }
        const modelProfileId = document.querySelector("#thread-model-profile")?.value || "";
        const model = submittedThreadModel(
          thread,
          modelProfileId,
          document.querySelector("#thread-model")?.value,
        );
        const permissionMode =
          document.querySelector("#thread-permission-mode")?.value || state.config.defaultPermissionMode;
        await updateThread(thread.id, {
          model,
          modelProfileId: modelProfileId || null,
          permissionMode,
        });
        const message = state.composerText.trim();
        const attachments = Array.isArray(state.composerAttachments)
          ? state.composerAttachments
          : [];
        if (!message && !attachments.length) {
          return;
        }
        clearThreadNotice();
        stickThreadViewportToBottom(thread.id);
        await runThreadPrompt(thread.id, message, attachments);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "compact-thread") {
      const threadId = button.dataset.threadId || currentThread()?.id;
      const thread = threadId ? state.threads.find((item) => item.id === threadId) : currentThread();
      if (!thread || !supportsThreadContextCompact(thread)) {
        return;
      }
      if (liveRun(thread.id)) {
        state.threadNotice = t(
          "Stop the current run before compacting context.",
          "请先停止当前运行，再压缩上下文。",
        );
        render();
        return;
      }
      try {
        state.threadNotice = t(
          "Compacting earlier context...",
          "正在压缩较早的上下文...",
        );
        render();
        const response = await compactThread(thread.id);
        const nextThread = response.thread || currentThread() || thread;
        state.threadNotice = response.compaction?.compacted
          ? compactSummaryLabel(nextThread)
          : t("Nothing to compact yet.", "当前还没有足够的上下文可压缩。");
      } catch (error) {
        state.threadNotice = error instanceof Error ? error.message : String(error);
      }
      render();
      return;
    }

    if (action === "attach-files") {
      try {
        const threadId = button.dataset.threadId || currentThread()?.id;
        const thread = threadId ? state.threads.find((item) => item.id === threadId) : currentThread();
        const initialPath = thread ? threadPath(thread) : currentWorkspace()?.cwd || state.config.workingDirectory;
        const attachments = await pickThreadFiles(initialPath);
        if (!attachments.length) {
          return;
        }
        state.composerAttachments = [
          ...(Array.isArray(state.composerAttachments) ? state.composerAttachments : []),
          ...attachments,
        ];
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "remove-composer-attachment") {
      const attachmentId = button.dataset.attachmentId || "";
      state.composerAttachments = (state.composerAttachments || []).filter(
        (attachment) => attachment.id !== attachmentId,
      );
      render();
      return;
    }

    if (action === "stop-run") {
      try {
        const threadId = button.dataset.threadId;
        if (!threadId) {
          return;
        }
        await stopThread(threadId);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "archive-thread") {
      try {
        const threadId = button.dataset.threadId;
        if (!threadId) {
          return;
        }
        await updateThread(threadId, {
          archived: true,
        });
        if (state.activeThreadId === threadId) {
          state.activeThreadId = null;
        }
        ensureSelection();
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "delete-thread") {
      try {
        const threadId = button.dataset.threadId;
        if (!threadId) {
          return;
        }
        const confirmed = window.confirm(
          t("Delete this thread permanently?", "要永久删除这个线程吗？"),
        );
        if (!confirmed) {
          return;
        }
        await deleteThread(threadId);
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "save-settings") {
      try {
        await saveSettings();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "import-config") {
      try {
        const sourceId = button.dataset.sourceId;
        if (!sourceId) {
          return;
        }
        await importConfig(sourceId);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "refresh-worktrees") {
      try {
        await loadWorktrees();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "restore-thread") {
      try {
        const threadId = button.dataset.threadId;
        if (!threadId) {
          return;
        }
        const thread = await updateThread(threadId, {
          archived: false,
        });
        state.activeWorkspaceId = thread.workspaceId;
        state.activeThreadId = thread.id;
        state.view = "chat";
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (action === "clear-api-key") {
      state.apiKeyDraft = "";
      state.apiKeyTouched = true;
      state.clearApiKey = true;
      state.settingsNotice = t("API key will be cleared on save", "保存时会清空 API Key");
      render();
      return;
    }

    if (action === "add-model-profile") {
      addModelProfileDraft();
      render();
      return;
    }

    if (action === "remove-model-profile") {
      const profileId = button.dataset.profileId;
      if (!profileId) {
        return;
      }
      removeModelProfileDraft(profileId);
      render();
      return;
    }

    if (action === "add-mcp-server") {
      const id = window.prompt(t("Server id", "服务 ID"), "custom-mcp");
      if (!id) {
        return;
      }
      const name = window.prompt(t("Server name", "服务名称"), id) || id;
      upsertMcpServerDraft(id, {
        id,
        name,
      });
      render();
      return;
    }

    if (action === "add-environment-profile") {
      const workspaceId = button.dataset.workspaceId;
      if (!workspaceId) {
        return;
      }
      updateEnvironmentDraft(workspaceId, {});
      render();
      return;
    }

    if (action === "remove-environment-profile") {
      const workspaceId = button.dataset.workspaceId;
      if (!workspaceId) {
        return;
      }
      removeEnvironmentDraft(workspaceId);
      render();
      return;
    }

    if (action === "add-project-environment") {
      try {
        const path = await pickDirectory(currentWorkspace()?.cwd || state.config?.workingDirectory);
        if (!path) {
          return;
        }
        const workspace = await createWorkspace({ cwd: path });
        updateEnvironmentDraft(workspace.id, {});
        state.view = "settings";
        state.settingsSection = "environments";
        render();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
      }
      return;
    }
  });

  document.addEventListener("contextmenu", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const contextTarget = target?.closest("[data-context-menu]");
    if (!contextTarget) {
      return;
    }
    event.preventDefault();
    const kind = contextTarget.dataset.contextMenu;
    const targetId =
      kind === "workspace" ? contextTarget.dataset.workspaceId : contextTarget.dataset.threadId;
    if (!kind || !targetId) {
      return;
    }
    openContextMenu({
      kind,
      source: "contextmenu",
      targetId,
      x: event.clientX,
      y: event.clientY,
    });
    renderContextMenu();
  });

  window.addEventListener("resize", () => {
    if (!state.contextMenu) {
      return;
    }
    closeContextMenu();
    renderContextMenu();
  });

  document.addEventListener(
    "scroll",
    (event) => {
      const target = event.target;
      const messages = currentMessagesElement();
      if (messages && target === messages) {
        saveThreadViewport(currentThread()?.id, messages);
      }
      if (!state.contextMenu) {
        return;
      }
      closeContextMenu();
      renderContextMenu();
    },
    true,
  );
}

attachEvents();
bootstrap().catch((error) => {
  console.error(error);
  screenElement.innerHTML = `
    <section class="panel-view panel-view--centered">
      <div class="empty-state">
        <div class="empty-state__badge">${t("Load error", "加载失败")}</div>
        <h1 class="empty-state__title">${t("App failed to load.", "应用加载失败。")}</h1>
        <p class="empty-state__body">${esc(error instanceof Error ? error.message : String(error))}</p>
      </div>
    </section>
  `;
});
