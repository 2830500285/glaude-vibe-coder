import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { homedir } from "os";
import { basename, dirname, extname, join, relative, resolve, sep } from "path";

type PermissionMode =
    | "acceptEdits"
    | "bypassPermissions"
    | "default"
    | "dontAsk"
    | "plan";

type AppLanguage = "auto" | "en-US" | "zh-CN";
type AppThemeMode = "dark" | "light" | "system";
type AppNotificationMode = "always" | "never" | "onlyWhenUnfocused";
type AppDefaultOpenDestination = "fileExplorer" | "workspaceHome";
type AppAgentEnvironment = "windowsNative" | "workspaceBound";
type AppIntegratedShell = "cmd" | "gitbash" | "powershell";
type AppThreadDetail = "concise" | "full" | "steps";
type AppSpeed = "fast" | "standard";
type AppFollowUpBehavior = "queue" | "steer";
type AppCodeReviewMode = "detached" | "inline";
type AppConfigScope = "project" | "user";
type AppApprovalPolicy = "never" | "on-failure" | "on-request";
type AppSandboxMode = "full-access" | "read-only" | "workspace-write";
type AppPersonality = "builder" | "concise" | "pragmatic" | "teacher";
type AppPullRequestMergeMethod = "merge" | "rebase" | "squash";
type AppModelProtocol = "anthropic" | "openai";

type ThreadStatus = "idle" | "running" | "error";

type AppWorkspace = {
    id: string;
    name: string;
    cwd: string;
    createdAt: string;
    updatedAt: string;
    collapsed?: boolean;
};

type AppMessage = {
    attachments?: AppAttachment[];
    id: string;
    role: "assistant" | "system" | "user";
    displayText?: string;
    text: string;
    thinking?: string;
    createdAt: string;
    isError?: boolean;
    durationMs?: number;
    totalCostUsd?: number;
    usage?: unknown;
};

type AppThread = {
    compactMode?: "auto" | "manual";
    compactSummary?: string;
    compactUpdatedAt?: string;
    compactedMessageCount?: number;
    id: string;
    title: string;
    workspaceId: string;
    sessionId?: string;
    modelProfileId?: string;
    createdAt: string;
    updatedAt: string;
    status: ThreadStatus;
    model?: string;
    permissionMode?: PermissionMode;
    cwd?: string;
    archivedAt?: string;
    lastError?: string;
    messages: AppMessage[];
};

type AppAutomationFrequency = "daily" | "hourly" | "weekly";

type AppAttachment = {
    extractedText?: string;
    id: string;
    kind: "binary" | "text";
    mimeType: string;
    name: string;
    path: string;
    size: number;
    truncated?: boolean;
};

type AppAutomation = {
    category: string;
    createdAt: string;
    description: string;
    enabled: boolean;
    frequency: AppAutomationFrequency;
    id: string;
    intervalHours: number;
    lastRunAt?: string;
    modelProfileId?: string;
    name: string;
    nextRunAt: string;
    permissionMode?: PermissionMode;
    prompt: string;
    timeOfDay: string;
    updatedAt: string;
    weekdays: number[];
    workspaceId: string;
};

type AppGeneralConfig = {
    agentEnvironment: AppAgentEnvironment;
    codeReviewMode: AppCodeReviewMode;
    defaultOpenDestination: AppDefaultOpenDestination;
    followUpBehavior: AppFollowUpBehavior;
    integratedTerminalShell: AppIntegratedShell;
    language: AppLanguage;
    notifications: {
        completion: AppNotificationMode;
        permission: boolean;
        question: boolean;
    };
    popupWindowHotkey: string;
    requireCtrlEnterForLongPrompts: boolean;
    speed: AppSpeed;
    threadDetail: AppThreadDetail;
};

type AppThemeConfig = {
    accent: string;
    background: string;
    contrast: number;
    foreground: string;
    name: string;
    translucentSidebar: boolean;
};

type AppAppearanceConfig = {
    codeFontFamily: string;
    codeFontSize: number;
    darkTheme: AppThemeConfig;
    lightTheme: AppThemeConfig;
    pointerCursor: boolean;
    themeMode: AppThemeMode;
    uiFontFamily: string;
    uiFontSize: number;
};

type AppConfigurationConfig = {
    approvalPolicy: AppApprovalPolicy;
    configScope: AppConfigScope;
    sandboxMode: AppSandboxMode;
};

type AppPersonalizationConfig = {
    customInstructions: string;
    personality: AppPersonality;
};

type AppUsageConfig = {
    autoReloadCredit: boolean;
    autoReloadThreshold: number;
    creditRemaining: number;
    fiveHourLimit: number;
    weeklyLimit: number;
};

type AppMcpServer = {
    authValue?: string;
    authenticated: boolean;
    builtIn?: boolean;
    command: string;
    enabled: boolean;
    id: string;
    name: string;
    notes: string;
    requiresAuth: boolean;
};

type AppGitConfig = {
    alwaysForcePush: boolean;
    branchPrefix: string;
    commitInstructions: string;
    createDraftPullRequests: boolean;
    pullRequestInstructions: string;
    pullRequestMergeMethod: AppPullRequestMergeMethod;
    showPrIcons: boolean;
};

type AppEnvironmentProfile = {
    notes: string;
    shell: AppIntegratedShell;
    startupCommand: string;
    workspaceId: string;
};

type AppWorktreeConfig = {
    autoDeleteLimit: number;
    autoDeleteOldWorktrees: boolean;
};

type AppModelProfile = {
    apiKey: string;
    apiModel: string;
    baseUrl: string;
    id: string;
    name: string;
    protocol: AppModelProtocol;
};

type AppConfig = {
    appearance: AppAppearanceConfig;
    apiKey: string;
    autoOpenBrowser: boolean;
    configuration: AppConfigurationConfig;
    defaultModel: string;
    defaultModelProfileId: string;
    defaultPermissionMode: PermissionMode;
    environments: AppEnvironmentProfile[];
    general: AppGeneralConfig;
    git: AppGitConfig;
    includeThinking: boolean;
    mcpServers: AppMcpServer[];
    modelProfiles: AppModelProfile[];
    personalization: AppPersonalizationConfig;
    port: number;
    usage: AppUsageConfig;
    workingDirectory: string;
    worktrees: AppWorktreeConfig;
};

type AppStore = {
    config: AppConfig;
    automations: AppAutomation[];
    workspaces: AppWorkspace[];
    threads: AppThread[];
};

type LibrarySkillSource = "personal" | "plugin" | "system";

type LibrarySkillItem = {
    description: string;
    group: string;
    id: string;
    installed: boolean;
    name: string;
    path: string;
    pluginName?: string;
    slug: string;
    source: LibrarySkillSource;
};

type LibraryPluginItem = {
    category: string;
    description: string;
    id: string;
    installed: boolean;
    name: string;
    path?: string;
    provider: string;
    slug: string;
    sourceSkillSlugs: string[];
};

type LibraryCatalog = {
    pluginRoots: {
        local: string;
        root: string;
    };
    plugins: LibraryPluginItem[];
    skillRoots: {
        personal: string;
        system: string;
    };
    skills: LibrarySkillItem[];
};

type LiveRunState = {
    assistantText: string;
    assistantThinking: string;
    error?: string;
    lastTool?: string;
    startedAt: string;
    status: "completed" | "error" | "running" | "starting";
    updatedAt: string;
};

type ActiveRun = {
    aborted: boolean;
    abortController?: AbortController;
    process?: ReturnType<typeof Bun.spawn>;
    state: LiveRunState;
};

const APP_NAME = "Glaude Vibe Coder";
const PROJECT_ROOT = resolve(process.env.GLAUDE_APP_ROOT || process.cwd());
const DEFAULT_WORKING_DIRECTORY_CANDIDATE = (
    process.env.GLAUDE_DEFAULT_WORKDIR ||
    homedir() ||
    PROJECT_ROOT
).trim();
const DEFAULT_WORKING_DIRECTORY = existsSync(DEFAULT_WORKING_DIRECTORY_CANDIDATE)
    ? resolve(DEFAULT_WORKING_DIRECTORY_CANDIDATE)
    : PROJECT_ROOT;
const DATA_DIR = resolve(
    process.env.GLAUDE_APP_DATA_DIR || join(PROJECT_ROOT, ".glaude-vibe-coding"),
);
const LEGACY_DATA_DIR = resolve(
    process.env.GLAUDE_LEGACY_DATA_DIR || join(PROJECT_ROOT, ".claude-app"),
);
const STORE_PATH = join(DATA_DIR, "store.json");
const LEGACY_STORE_PATH = join(LEGACY_DATA_DIR, "store.json");
const WEB_ROOT = join(PROJECT_ROOT, "app", "web");
const PERSONAL_SKILLS_ROOT = join(homedir(), ".agents", "skills");
const SYSTEM_SKILLS_ROOT = join(homedir(), ".codex", "skills");
const PLUGINS_ROOT = join(homedir(), ".codex", "plugins");
const LOCAL_PLUGINS_ROOT = join(PLUGINS_ROOT, "local");
const PLUGIN_CACHE_ROOT = join(PLUGINS_ROOT, "cache");
const ATTACHMENT_TEXT_BYTES_LIMIT = 160_000;
const COMMAND_OUTPUT_CHAR_LIMIT = 16_000;
const COMMAND_TIMEOUT_MS = 30_000;
const OPENAI_COMPACT_HISTORY_CHAR_THRESHOLD = 32_000;
const OPENAI_COMPACT_KEEP_RECENT_MESSAGES = 8;
const OPENAI_COMPACT_MESSAGE_CHAR_LIMIT = 4_000;
const OPENAI_COMPACT_TRANSCRIPT_CHAR_LIMIT = 24_000;
const OPENAI_TOOL_LOOP_LIMIT = 10;
const PERMISSION_MODES = new Set<PermissionMode>([
    "acceptEdits",
    "bypassPermissions",
    "default",
    "dontAsk",
    "plan",
]);
const MIME_TYPES: Record<string, string> = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
};
const ATTACHMENT_MIME_TYPES: Record<string, string> = {
    ".c": "text/plain",
    ".cc": "text/plain",
    ".cpp": "text/plain",
    ".cs": "text/plain",
    ".css": "text/css",
    ".csv": "text/csv",
    ".go": "text/plain",
    ".html": "text/html",
    ".java": "text/plain",
    ".js": "text/javascript",
    ".json": "application/json",
    ".jsx": "text/javascript",
    ".log": "text/plain",
    ".md": "text/markdown",
    ".mjs": "text/javascript",
    ".py": "text/x-python",
    ".rs": "text/plain",
    ".sh": "text/plain",
    ".sql": "text/plain",
    ".ts": "text/typescript",
    ".tsx": "text/typescript",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
};
const decoder = new TextDecoder();
const activeRuns = new Map<string, ActiveRun>();
const activeAutomationRuns = new Set<string>();
const PLUGIN_PRESETS = [
    {
        category: "Coding",
        description: "Triage PRs, issues, CI, and publish flows",
        name: "GitHub",
        provider: "OpenAI",
        skillSlugs: ["gh-address-comments", "gh-fix-ci"],
        slug: "github",
    },
    {
        category: "Coding",
        description: "Build and deploy web apps and agents",
        name: "Vercel",
        provider: "Local",
        skillSlugs: ["vercel-deploy"],
        slug: "vercel",
    },
    {
        category: "Coding",
        description: "Deploy projects and manage releases",
        name: "Netlify",
        provider: "Local",
        skillSlugs: ["netlify-deploy"],
        slug: "netlify",
    },
    {
        category: "Coding",
        description: "Cloudflare platform guidance and deployment workflows",
        name: "Cloudflare",
        provider: "Local",
        skillSlugs: ["cloudflare-deploy"],
        slug: "cloudflare",
    },
    {
        category: "Coding",
        description: "Inspect recent Sentry issues and events",
        name: "Sentry",
        provider: "Local",
        skillSlugs: ["sentry"],
        slug: "sentry",
    },
    {
        category: "Design",
        description: "Design-to-code workflows powered by Figma",
        name: "Figma",
        provider: "Local",
        skillSlugs: ["figma", "figma-implement-design"],
        slug: "figma",
    },
    {
        category: "Productivity",
        description: "Find and reference issues and projects",
        name: "Linear",
        provider: "Local",
        skillSlugs: ["linear"],
        slug: "linear",
    },
    {
        category: "Files",
        description: "Read, create, and review PDFs with layout awareness",
        name: "PDF",
        provider: "Local",
        skillSlugs: ["pdf"],
        slug: "pdf",
    },
    {
        category: "Files",
        description: "Create and edit spreadsheets while preserving formulas",
        name: "Spreadsheet",
        provider: "Local",
        skillSlugs: ["spreadsheet"],
        slug: "spreadsheet",
    },
    {
        category: "Automation",
        description: "Browser automation, screenshots, and UI flow debugging",
        name: "Playwright",
        provider: "Local",
        skillSlugs: ["playwright", "screenshot"],
        slug: "playwright",
    },
    {
        category: "Media",
        description: "Generate raster images and variations",
        name: "Image Gen",
        provider: "Local",
        skillSlugs: ["imagegen"],
        slug: "imagegen",
    },
    {
        category: "Media",
        description: "Text-to-speech narration and voice generation",
        name: "Speech",
        provider: "Local",
        skillSlugs: ["speech"],
        slug: "speech",
    },
    {
        category: "Media",
        description: "Generate and remix videos with Sora",
        name: "Sora",
        provider: "Local",
        skillSlugs: ["sora"],
        slug: "sora",
    },
    {
        category: "Data",
        description: "Create and edit Jupyter notebooks for experiments",
        name: "Jupyter",
        provider: "Local",
        skillSlugs: ["jupyter-notebook"],
        slug: "jupyter",
    },
    {
        category: "Files",
        description: "Transcribe recordings with speaker-aware labeling",
        name: "Transcribe",
        provider: "Local",
        skillSlugs: ["transcribe"],
        slug: "transcribe",
    },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(
    value: unknown,
    fallback: number,
    min: number,
    max: number,
): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeChoice<T extends string>(
    value: unknown,
    fallback: T,
    allowed: readonly T[],
): T {
    return typeof value === "string" && allowed.includes(value as T)
        ? (value as T)
        : fallback;
}

function normalizeText(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value.trim() : fallback;
}

function normalizeHexColor(value: unknown, fallback: string): string {
    const next = typeof value === "string" ? value.trim() : "";
    return /^#[0-9a-fA-F]{6}$/.test(next) ? next.toUpperCase() : fallback;
}

function nowIso(): string {
    return new Date().toISOString();
}

function safeReadDirectory(path: string) {
    if (!existsSync(path)) {
        return [];
    }
    try {
        return readdirSync(path, { withFileTypes: true });
    } catch {
        return [];
    }
}

function safeReadUtf8(path: string): string {
    try {
        return existsSync(path) ? readFileSync(path, "utf8") : "";
    } catch {
        return "";
    }
}

function safeReadJson(path: string): Record<string, unknown> | null {
    const raw = safeReadUtf8(path);
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw) as unknown;
        return isRecord(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function canonicalSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\.md$/i, "")
        .replace(/-[0-9]+(?:\.[0-9]+)+(?:-[a-z0-9.]+)?$/i, "");
}

function titleCase(value: string): string {
    return value
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function displayNameFromSlug(value: string): string {
    const canonical = canonicalSlug(value);
    const aliases: Record<string, string> = {
        "1password": "1Password",
        "autoglm-browser-agent": "Autoglm Browser Agent",
        "autoglm-deepresearch": "Autoglm Deepresearch",
        "autoglm-generate-image": "Autoglm Generate Image",
        "autoglm-open-link": "AutoGLM Open Link",
        "autoglm-search-image": "Autoglm Search Image",
        "autoglm-websearch": "Autoglm Websearch",
        "gh-address-comments": "GitHub Address Comments",
        "gh-fix-ci": "GitHub Fix CI",
        "openai-docs": "OpenAI Docs",
    };
    return aliases[canonical] || titleCase(canonical);
}

function slugifyLibraryName(value: string, fallback: string): string {
    const next = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return next || fallback;
}

function parseFrontmatter(text: string): Record<string, string> {
    if (!text.startsWith("---")) {
        return {};
    }
    const end = text.indexOf("\n---", 3);
    if (end === -1) {
        return {};
    }
    const lines = text
        .slice(3, end)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    const frontmatter: Record<string, string> = {};
    for (const line of lines) {
        const separator = line.indexOf(":");
        if (separator <= 0) {
            continue;
        }
        const key = line.slice(0, separator).trim();
        const rawValue = line.slice(separator + 1).trim();
        frontmatter[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
    return frontmatter;
}

function summarizeMarkdown(text: string): string {
    const withoutFrontmatter = text.startsWith("---")
        ? text.slice((text.indexOf("\n---", 3) || -1) + 4)
        : text;
    for (const rawLine of withoutFrontmatter.split(/\r?\n/)) {
        const entry = rawLine.trim();
        if (!entry) {
            continue;
        }
        if (
            entry.startsWith("#") ||
            entry.startsWith("|") ||
            entry.startsWith("```") ||
            /^[-*+]\s*$/.test(entry)
        ) {
            continue;
        }
        const cleaned = entry
            .replace(/^>\s*/, "")
            .replace(/^[-*+]\s+/, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/^\d+\.\s+/, "")
            .replace(/\s+/g, " ")
            .trim();
        if (!cleaned || /^[>|-]+$/.test(cleaned)) {
            continue;
        }
        return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
    }
    return "";
}

function isMeaningfulSummary(value: string): boolean {
    const text = normalizeText(value);
    return Boolean(text && !["|", ">", "|-", ">-"].includes(text));
}

function readSkillItem(
    directory: string,
    source: LibrarySkillSource,
    group: string,
    pluginName?: string,
): LibrarySkillItem | null {
    const skillFile = join(directory, "SKILL.md");
    if (!existsSync(skillFile)) {
        return null;
    }
    const raw = safeReadUtf8(skillFile);
    if (!raw) {
        return null;
    }
    const frontmatter = parseFrontmatter(raw);
    const slug = canonicalSlug(basename(directory));
    const name = normalizeText(frontmatter.name) || displayNameFromSlug(slug);
    const frontmatterDescription = normalizeText(frontmatter.description);
    const description =
        (isMeaningfulSummary(frontmatterDescription) ? frontmatterDescription : "") ||
        summarizeMarkdown(raw) ||
        "Local skill";
    return {
        description,
        group,
        id: [source, pluginName, slug].filter(Boolean).join(":"),
        installed: true,
        name,
        path: directory,
        pluginName,
        slug,
        source,
    };
}

function collectSkillItemsFromRoot(
    root: string,
    source: LibrarySkillSource,
    group: string,
): LibrarySkillItem[] {
    return safeReadDirectory(root)
        .filter((entry) => entry.isDirectory())
        .map((entry) => readSkillItem(join(root, entry.name), source, group))
        .filter((item): item is LibrarySkillItem => Boolean(item));
}

function collectPluginManifests() {
    const manifests: Array<{
        category: string;
        description: string;
        name: string;
        path: string;
        provider: string;
        skillRoot?: string;
        slug: string;
    }> = [];

    const pushPluginManifest = (root: string) => {
        const manifestPath = join(root, ".codex-plugin", "plugin.json");
        const parsed = safeReadJson(manifestPath);
        if (!parsed) {
            return;
        }
        const plugin = isRecord(parsed.interface) ? parsed.interface : parsed;
        const displayName =
            normalizeText(plugin.displayName) ||
            normalizeText(parsed.name) ||
            displayNameFromSlug(basename(root));
        manifests.push({
            category: normalizeText(plugin.category, "Utilities") || "Utilities",
            description:
                normalizeText(plugin.shortDescription) ||
                normalizeText(parsed.description) ||
                "Local plugin",
            name: displayName,
            path: root,
            provider:
                normalizeText(plugin.developerName) ||
                normalizeText(isRecord(parsed.author) ? parsed.author.name : "", "Local") ||
                "Local",
            skillRoot: existsSync(join(root, "skills")) ? join(root, "skills") : undefined,
            slug: canonicalSlug(normalizeText(parsed.name) || basename(root)),
        });
    };

    for (const vendor of safeReadDirectory(PLUGIN_CACHE_ROOT).filter((entry) => entry.isDirectory())) {
        const vendorPath = join(PLUGIN_CACHE_ROOT, vendor.name);
        for (const pluginDir of safeReadDirectory(vendorPath).filter((entry) => entry.isDirectory())) {
            const pluginPath = join(vendorPath, pluginDir.name);
            for (const revision of safeReadDirectory(pluginPath).filter((entry) => entry.isDirectory())) {
                pushPluginManifest(join(pluginPath, revision.name));
            }
        }
    }

    for (const entry of safeReadDirectory(LOCAL_PLUGINS_ROOT).filter((item) => item.isDirectory())) {
        pushPluginManifest(join(LOCAL_PLUGINS_ROOT, entry.name));
    }

    return manifests.sort((left, right) => left.name.localeCompare(right.name));
}

function collectLibrarySkills(
    pluginManifests: ReturnType<typeof collectPluginManifests>,
): LibrarySkillItem[] {
    const items = [
        ...collectSkillItemsFromRoot(PERSONAL_SKILLS_ROOT, "personal", "Personal"),
        ...collectSkillItemsFromRoot(SYSTEM_SKILLS_ROOT, "system", "System"),
        ...collectSkillItemsFromRoot(join(SYSTEM_SKILLS_ROOT, ".system"), "system", "System"),
    ];

    for (const plugin of pluginManifests) {
        if (!plugin.skillRoot) {
            continue;
        }
        items.push(
            ...collectSkillItemsFromRoot(
                plugin.skillRoot,
                "plugin",
                "Plugin",
            ).map((item) => ({ ...item, pluginName: plugin.name })),
        );
    }

    const seen = new Set<string>();
    return items
        .filter((item) => {
            if (seen.has(item.id)) {
                return false;
            }
            seen.add(item.id);
            return true;
        })
        .sort((left, right) => left.name.localeCompare(right.name));
}

function collectLibraryPlugins(skills: LibrarySkillItem[]) {
    const manifests = collectPluginManifests().map<LibraryPluginItem>((plugin) => ({
        category: plugin.category,
        description: plugin.description,
        id: `plugin:${plugin.slug}`,
        installed: true,
        name: plugin.name,
        path: plugin.path,
        provider: plugin.provider,
        slug: plugin.slug,
        sourceSkillSlugs: [],
    }));

    const availableSkills = new Map<string, LibrarySkillItem>();
    for (const skill of skills) {
        availableSkills.set(skill.slug, skill);
    }

    const actualPluginSlugs = new Set(manifests.map((plugin) => plugin.slug));
    const presetItems = PLUGIN_PRESETS
        .filter((preset) => !actualPluginSlugs.has(preset.slug))
        .map((preset) => {
            const matchedSkills = preset.skillSlugs.filter((slug) => availableSkills.has(slug));
            if (!matchedSkills.length) {
                return null;
            }
            const firstMatch = availableSkills.get(matchedSkills[0]);
            return {
                category: preset.category,
                description: preset.description,
                id: `bundle:${preset.slug}`,
                installed: true,
                name: preset.name,
                path: firstMatch?.path,
                provider: preset.provider,
                slug: preset.slug,
                sourceSkillSlugs: matchedSkills,
            } satisfies LibraryPluginItem;
        })
        .filter((item): item is LibraryPluginItem => Boolean(item));

    return [...manifests, ...presetItems].sort((left, right) => {
        const category = left.category.localeCompare(right.category);
        return category || left.name.localeCompare(right.name);
    });
}

function buildLibraryCatalog(): LibraryCatalog {
    const pluginManifests = collectPluginManifests();
    const skills = collectLibrarySkills(pluginManifests);
    return {
        pluginRoots: {
            local: LOCAL_PLUGINS_ROOT,
            root: PLUGINS_ROOT,
        },
        plugins: collectLibraryPlugins(skills),
        skillRoots: {
            personal: PERSONAL_SKILLS_ROOT,
            system: SYSTEM_SKILLS_ROOT,
        },
        skills,
    };
}

function createSkillScaffold(name: string, slug: string, description: string) {
    mkdirSync(PERSONAL_SKILLS_ROOT, { recursive: true });
    const targetDir = join(PERSONAL_SKILLS_ROOT, slug);
    if (existsSync(targetDir)) {
        return json({ error: "That skill already exists." }, 409);
    }
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(
        join(targetDir, "SKILL.md"),
        `---\nname: ${name}\ndescription: "${description}"\n---\n\n# ${name}\n\nDescribe when to use this skill, the workflow it should follow, and any constraints.\n`,
        "utf8",
    );
    return json({ ok: true, path: targetDir });
}

function createPluginScaffold(name: string, slug: string, description: string) {
    mkdirSync(LOCAL_PLUGINS_ROOT, { recursive: true });
    const targetDir = join(LOCAL_PLUGINS_ROOT, slug);
    if (existsSync(targetDir)) {
        return json({ error: "That plugin already exists." }, 409);
    }
    mkdirSync(join(targetDir, ".codex-plugin"), { recursive: true });
    mkdirSync(join(targetDir, "skills", slug), { recursive: true });
    writeFileSync(
        join(targetDir, ".codex-plugin", "plugin.json"),
        JSON.stringify(
            {
                name: slug,
                version: "0.1.0",
                description,
                author: {
                    name: "Local user",
                },
                skills: "./skills/",
                interface: {
                    category: "Utilities",
                    developerName: "Local",
                    displayName: name,
                    shortDescription: description,
                },
            },
            null,
            2,
        ),
        "utf8",
    );
    writeFileSync(
        join(targetDir, "skills", slug, "SKILL.md"),
        `---\nname: ${name}\ndescription: "${description}"\n---\n\n# ${name}\n\nDocument how this plugin skill should be used.\n`,
        "utf8",
    );
    return json({ ok: true, path: targetDir });
}

function defaultGeneralConfig(): AppGeneralConfig {
    return {
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
    };
}

function defaultThemeConfig(
    name: string,
    accent: string,
    background: string,
    foreground: string,
    contrast: number,
): AppThemeConfig {
    return {
        accent,
        background,
        contrast,
        foreground,
        name,
        translucentSidebar: true,
    };
}

function defaultAppearanceConfig(): AppAppearanceConfig {
    return {
        codeFontFamily:
            '"Cascadia Code", "Cascadia Mono", "JetBrains Mono", "Consolas", "Sarasa Mono SC", monospace',
        codeFontSize: 12,
        darkTheme: defaultThemeConfig(
            "Glaude Dark",
            "#339CFF",
            "#181818",
            "#FFFFFF",
            60,
        ),
        lightTheme: defaultThemeConfig(
            "Glaude Light",
            "#339CFF",
            "#FFFFFF",
            "#1A1C1F",
            45,
        ),
        pointerCursor: true,
        themeMode: "system",
        uiFontFamily:
            '"Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei UI", sans-serif',
        uiFontSize: 13,
    };
}

function defaultConfigurationConfig(): AppConfigurationConfig {
    return {
        approvalPolicy: "on-request",
        configScope: "user",
        sandboxMode: "workspace-write",
    };
}

function defaultPersonalizationConfig(): AppPersonalizationConfig {
    return {
        customInstructions: "",
        personality: "pragmatic",
    };
}

function defaultUsageConfig(): AppUsageConfig {
    return {
        autoReloadCredit: false,
        autoReloadThreshold: 10,
        creditRemaining: 0,
        fiveHourLimit: 100,
        weeklyLimit: 400,
    };
}

function defaultMcpServers(): AppMcpServer[] {
    return [
        ["arxiv-mcp", "arxiv-mcp", false],
        ["context7-mcp", "context7-mcp", false],
        ["figma", "figma", true],
        ["filesystem-mcp", "filesystem-mcp", false],
        ["github-mcp", "github-mcp", false],
        ["hf-mcp", "hf-mcp", false],
        ["linear", "linear", true],
        ["markdownify-mcp", "markdownify-mcp", false],
        ["notion", "notion", true],
        ["pdf-mcp", "pdf-mcp", false],
        ["playwright", "playwright", false],
        ["playwright-mcp", "playwright-mcp", false],
        ["scihub-mcp", "scihub-mcp", false],
        ["sequential-thinking-mcp", "sequential-thinking-mcp", false],
    ].map(([id, name, requiresAuth]) => ({
        authenticated: false,
        builtIn: true,
        command: "",
        enabled: true,
        id,
        name,
        notes: "",
        requiresAuth: Boolean(requiresAuth),
    }));
}

function defaultGitConfig(): AppGitConfig {
    return {
        alwaysForcePush: false,
        branchPrefix: "glaude/",
        commitInstructions: "",
        createDraftPullRequests: false,
        pullRequestInstructions: "",
        pullRequestMergeMethod: "merge",
        showPrIcons: false,
    };
}

function defaultWorktreeConfig(): AppWorktreeConfig {
    return {
        autoDeleteLimit: 15,
        autoDeleteOldWorktrees: true,
    };
}

function normalizeTimeOfDay(value: unknown, fallback = "09:00"): string {
    const text = normalizeText(value, fallback);
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(text) ? text : fallback;
}

function parseTimeOfDay(value: string): [number, number] {
    const [hours, minutes] = normalizeTimeOfDay(value).split(":").map(Number);
    return [hours || 0, minutes || 0];
}

function setLocalTime(date: Date, timeOfDay: string): Date {
    const [hours, minutes] = parseTimeOfDay(timeOfDay);
    const next = new Date(date);
    next.setHours(hours, minutes, 0, 0);
    return next;
}

function normalizeAutomationWeekdays(value: unknown): number[] {
    const source = Array.isArray(value) ? value : [];
    const normalized = source
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6);
    return [...new Set(normalized)].sort((left, right) => left - right);
}

function computeAutomationNextRun(
    automation: Pick<AppAutomation, "frequency" | "intervalHours" | "timeOfDay" | "weekdays">,
    fromDate = new Date(),
): string {
    if (automation.frequency === "hourly") {
        return new Date(
            fromDate.getTime() + Math.max(1, automation.intervalHours) * 60 * 60 * 1000,
        ).toISOString();
    }

    const timeOfDay = normalizeTimeOfDay(automation.timeOfDay);
    if (automation.frequency === "daily") {
        let candidate = setLocalTime(fromDate, timeOfDay);
        if (candidate <= fromDate) {
            candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
        }
        return candidate.toISOString();
    }

    const weekdays = automation.weekdays.length ? automation.weekdays : [1];
    for (let offset = 0; offset < 8; offset += 1) {
        const candidate = setLocalTime(
            new Date(fromDate.getTime() + offset * 24 * 60 * 60 * 1000),
            timeOfDay,
        );
        if (weekdays.includes(candidate.getDay()) && candidate > fromDate) {
            return candidate.toISOString();
        }
    }

    return setLocalTime(new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000), timeOfDay).toISOString();
}

function formatAutomationThreadTitle(name: string): string {
    const trimmed = normalizeText(name, "Automation run") || "Automation run";
    return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
}

function normalizeThemeConfig(
    value: unknown,
    fallback: AppThemeConfig,
): AppThemeConfig {
    const input = isRecord(value) ? value : {};
    return {
        accent: normalizeHexColor(input.accent, fallback.accent),
        background: normalizeHexColor(input.background, fallback.background),
        contrast: normalizeNumber(input.contrast, fallback.contrast, 0, 100),
        foreground: normalizeHexColor(input.foreground, fallback.foreground),
        name: normalizeText(input.name, fallback.name) || fallback.name,
        translucentSidebar: normalizeBoolean(
            input.translucentSidebar,
            fallback.translucentSidebar,
        ),
    };
}

function normalizeMcpServers(
    value: unknown,
    current: AppMcpServer[] = defaultMcpServers(),
): AppMcpServer[] {
    const currentById = new Map(current.map((server) => [server.id, server]));
    const normalized = Array.isArray(value)
        ? value.flatMap((entry) => {
              if (!isRecord(entry)) {
                  return [];
              }
              const id = normalizeText(entry.id);
              if (!id) {
                  return [];
              }
              const fallback =
                  currentById.get(id) ||
                  ({
                      authenticated: false,
                      builtIn: false,
                      command: "",
                      enabled: true,
                      id,
                      name: id,
                      notes: "",
                      requiresAuth: false,
                  } satisfies AppMcpServer);
              return [
                  {
                      authValue:
                          typeof entry.authValue === "string"
                              ? entry.authValue
                              : fallback.authValue,
                      authenticated: normalizeBoolean(
                          entry.authenticated,
                          fallback.authenticated,
                      ),
                      builtIn: normalizeBoolean(entry.builtIn, Boolean(fallback.builtIn)),
                      command: normalizeText(entry.command, fallback.command),
                      enabled: normalizeBoolean(entry.enabled, fallback.enabled),
                      id,
                      name: normalizeText(entry.name, fallback.name) || fallback.name,
                      notes: normalizeText(entry.notes, fallback.notes),
                      requiresAuth: normalizeBoolean(
                          entry.requiresAuth,
                          fallback.requiresAuth,
                      ),
                  },
              ];
          })
        : [];

    for (const defaultServer of defaultMcpServers()) {
        if (!normalized.some((server) => server.id === defaultServer.id)) {
            const currentServer = currentById.get(defaultServer.id);
            normalized.push(currentServer ? { ...defaultServer, ...currentServer } : defaultServer);
        }
    }

    return normalized.sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeEnvironmentProfiles(
    value: unknown,
    current: AppEnvironmentProfile[] = [],
): AppEnvironmentProfile[] {
    if (!Array.isArray(value)) {
        return current;
    }
    return value.flatMap((entry) => {
        if (!isRecord(entry)) {
            return [];
        }
        const workspaceId = normalizeText(entry.workspaceId);
        if (!workspaceId) {
            return [];
        }
        const fallback = current.find((item) => item.workspaceId === workspaceId);
        return [
            {
                notes: normalizeText(entry.notes, fallback?.notes ?? ""),
                shell: normalizeChoice(
                    entry.shell,
                    fallback?.shell ?? "powershell",
                    ["cmd", "gitbash", "powershell"],
                ),
                startupCommand: normalizeText(
                    entry.startupCommand,
                    fallback?.startupCommand ?? "",
                ),
                workspaceId,
            },
        ];
    });
}

function normalizeModelProfiles(
    value: unknown,
    current: AppModelProfile[] = [],
): AppModelProfile[] {
    if (!Array.isArray(value)) {
        return current;
    }

    return value.flatMap((entry, index) => {
        if (!isRecord(entry)) {
            return [];
        }

        const fallback = current.find((item) => item.id === entry.id) ?? current[index];
        const id =
            normalizeText(entry.id, fallback?.id) || crypto.randomUUID();
        const name =
            normalizeText(entry.name, fallback?.name) ||
            `Model ${index + 1}`;

        return [
            {
                apiKey:
                    typeof entry.apiKey === "string"
                        ? entry.apiKey
                        : (fallback?.apiKey ?? ""),
                apiModel: normalizeText(entry.apiModel, fallback?.apiModel ?? ""),
                baseUrl: normalizeText(entry.baseUrl, fallback?.baseUrl ?? ""),
                id,
                name,
                protocol: normalizeChoice(
                    entry.protocol,
                    fallback?.protocol ?? "anthropic",
                    ["anthropic", "openai"],
                ),
            },
        ];
    });
}

function normalizeAutomations(
    value: unknown,
    workspaces: AppWorkspace[],
    config: AppConfig,
): AppAutomation[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const workspaceIds = new Set(workspaces.map((workspace) => workspace.id));
    const defaultWorkspaceId =
        workspaces.find((workspace) => workspace.cwd === config.workingDirectory)?.id ||
        workspaces[0]?.id ||
        "";

    return value.flatMap((entry, index) => {
        if (!isRecord(entry)) {
            return [];
        }

        const createdAt =
            typeof entry.createdAt === "string" ? entry.createdAt : nowIso();
        const updatedAt =
            typeof entry.updatedAt === "string" ? entry.updatedAt : createdAt;
        const frequency = normalizeChoice<AppAutomationFrequency>(
            entry.frequency,
            "daily",
            ["daily", "hourly", "weekly"],
        );
        const workspaceId =
            typeof entry.workspaceId === "string" && workspaceIds.has(entry.workspaceId)
                ? entry.workspaceId
                : defaultWorkspaceId;
        const weekdays = normalizeAutomationWeekdays(entry.weekdays);
        const timeOfDay = normalizeTimeOfDay(entry.timeOfDay, "09:00");
        const intervalHours = normalizeNumber(entry.intervalHours, 24, 1, 168);
        const seed = {
            frequency,
            intervalHours,
            timeOfDay,
            weekdays,
        };

        return [
            {
                category:
                    normalizeText(entry.category, "Status reports") || "Status reports",
                createdAt,
                description: normalizeText(entry.description, ""),
                enabled: normalizeBoolean(entry.enabled, true),
                frequency,
                id:
                    normalizeText(entry.id) ||
                    `automation-${index + 1}-${crypto.randomUUID()}`,
                intervalHours,
                lastRunAt:
                    typeof entry.lastRunAt === "string" ? entry.lastRunAt : undefined,
                modelProfileId:
                    typeof entry.modelProfileId === "string" &&
                    config.modelProfiles.some((profile) => profile.id === entry.modelProfileId)
                        ? entry.modelProfileId
                        : undefined,
                name:
                    normalizeText(entry.name, `Automation ${index + 1}`) ||
                    `Automation ${index + 1}`,
                nextRunAt:
                    typeof entry.nextRunAt === "string" && entry.nextRunAt
                        ? entry.nextRunAt
                        : computeAutomationNextRun(seed),
                permissionMode:
                    typeof entry.permissionMode === "string" &&
                    PERMISSION_MODES.has(entry.permissionMode as PermissionMode)
                        ? (entry.permissionMode as PermissionMode)
                        : undefined,
                prompt: normalizeText(entry.prompt, ""),
                timeOfDay,
                updatedAt,
                weekdays,
                workspaceId,
            },
        ];
    }).sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeConfig(
    value: Partial<AppConfig> | null | undefined,
    current: AppConfig = {
        apiKey: "",
        autoOpenBrowser: true,
        defaultModel: "",
        defaultModelProfileId: "",
        defaultPermissionMode: "default",
        includeThinking: false,
        port: 43120,
        workingDirectory: DEFAULT_WORKING_DIRECTORY,
        general: defaultGeneralConfig(),
        appearance: defaultAppearanceConfig(),
        configuration: defaultConfigurationConfig(),
        personalization: defaultPersonalizationConfig(),
        usage: defaultUsageConfig(),
        mcpServers: defaultMcpServers(),
        modelProfiles: [],
        git: defaultGitConfig(),
        environments: [],
        worktrees: defaultWorktreeConfig(),
    },
): AppConfig {
    const input = isRecord(value) ? value : {};
    const generalInput = isRecord(input.general) ? input.general : {};
    const generalFallback = current.general ?? defaultGeneralConfig();
    const appearanceInput = isRecord(input.appearance) ? input.appearance : {};
    const appearanceFallback = current.appearance ?? defaultAppearanceConfig();
    const configurationInput = isRecord(input.configuration)
        ? input.configuration
        : {};
    const configurationFallback =
        current.configuration ?? defaultConfigurationConfig();
    const personalizationInput = isRecord(input.personalization)
        ? input.personalization
        : {};
    const personalizationFallback =
        current.personalization ?? defaultPersonalizationConfig();
    const usageInput = isRecord(input.usage) ? input.usage : {};
    const usageFallback = current.usage ?? defaultUsageConfig();
    const gitInput = isRecord(input.git) ? input.git : {};
    const gitFallback = current.git ?? defaultGitConfig();
    const modelProfiles = normalizeModelProfiles(
        input.modelProfiles,
        current.modelProfiles,
    );
    const requestedDefaultModelProfileId = normalizeText(
        input.defaultModelProfileId,
        current.defaultModelProfileId,
    );
    const defaultModelProfileId = modelProfiles.some(
        (profile) => profile.id === requestedDefaultModelProfileId,
    )
        ? requestedDefaultModelProfileId
        : (modelProfiles[0]?.id ?? "");

    const requestedDefaultModel = normalizeText(input.defaultModel, current.defaultModel);
    const defaultProfile = modelProfiles.find(
        (profile) => profile.id === defaultModelProfileId,
    );
    const defaultModel =
        normalizedThreadModelForProfile(
            requestedDefaultModel,
            defaultProfile,
            {
                defaultModel: requestedDefaultModel,
                defaultModelProfileId,
                modelProfiles,
            },
        ) || requestedDefaultModel;

    return {
        apiKey:
            typeof input.apiKey === "string" ? input.apiKey : current.apiKey,
        appearance: {
            codeFontFamily: normalizeText(
                appearanceInput.codeFontFamily,
                appearanceFallback.codeFontFamily,
            ),
            codeFontSize: normalizeNumber(
                appearanceInput.codeFontSize,
                appearanceFallback.codeFontSize,
                10,
                18,
            ),
            darkTheme: normalizeThemeConfig(
                appearanceInput.darkTheme,
                appearanceFallback.darkTheme,
            ),
            lightTheme: normalizeThemeConfig(
                appearanceInput.lightTheme,
                appearanceFallback.lightTheme,
            ),
            pointerCursor: normalizeBoolean(
                appearanceInput.pointerCursor,
                appearanceFallback.pointerCursor,
            ),
            themeMode: normalizeChoice(
                appearanceInput.themeMode,
                appearanceFallback.themeMode,
                ["dark", "light", "system"],
            ),
            uiFontFamily: normalizeText(
                appearanceInput.uiFontFamily,
                appearanceFallback.uiFontFamily,
            ),
            uiFontSize: normalizeNumber(
                appearanceInput.uiFontSize,
                appearanceFallback.uiFontSize,
                11,
                18,
            ),
        },
        autoOpenBrowser: normalizeBoolean(
            input.autoOpenBrowser,
            current.autoOpenBrowser,
        ),
        configuration: {
            approvalPolicy: normalizeChoice(
                configurationInput.approvalPolicy,
                configurationFallback.approvalPolicy,
                ["never", "on-failure", "on-request"],
            ),
            configScope: normalizeChoice(
                configurationInput.configScope,
                configurationFallback.configScope,
                ["project", "user"],
            ),
            sandboxMode: normalizeChoice(
                configurationInput.sandboxMode,
                configurationFallback.sandboxMode,
                ["full-access", "read-only", "workspace-write"],
            ),
        },
        defaultModel,
        defaultModelProfileId,
        defaultPermissionMode: normalizeChoice(
            input.defaultPermissionMode,
            current.defaultPermissionMode,
            ["acceptEdits", "bypassPermissions", "default", "dontAsk", "plan"],
        ),
        environments: normalizeEnvironmentProfiles(
            input.environments,
            current.environments,
        ),
        general: {
            agentEnvironment: normalizeChoice(
                generalInput.agentEnvironment,
                generalFallback.agentEnvironment,
                ["windowsNative", "workspaceBound"],
            ),
            codeReviewMode: normalizeChoice(
                generalInput.codeReviewMode,
                generalFallback.codeReviewMode,
                ["detached", "inline"],
            ),
            defaultOpenDestination: normalizeChoice(
                generalInput.defaultOpenDestination,
                generalFallback.defaultOpenDestination,
                ["fileExplorer", "workspaceHome"],
            ),
            followUpBehavior: normalizeChoice(
                generalInput.followUpBehavior,
                generalFallback.followUpBehavior,
                ["queue", "steer"],
            ),
            integratedTerminalShell: normalizeChoice(
                generalInput.integratedTerminalShell,
                generalFallback.integratedTerminalShell,
                ["cmd", "gitbash", "powershell"],
            ),
            language: normalizeChoice(
                generalInput.language,
                generalFallback.language,
                ["auto", "en-US", "zh-CN"],
            ),
            notifications: {
                completion: normalizeChoice(
                    isRecord(generalInput.notifications)
                        ? generalInput.notifications.completion
                        : undefined,
                    generalFallback.notifications.completion,
                    ["always", "never", "onlyWhenUnfocused"],
                ),
                permission: normalizeBoolean(
                    isRecord(generalInput.notifications)
                        ? generalInput.notifications.permission
                        : undefined,
                    generalFallback.notifications.permission,
                ),
                question: normalizeBoolean(
                    isRecord(generalInput.notifications)
                        ? generalInput.notifications.question
                        : undefined,
                    generalFallback.notifications.question,
                ),
            },
            popupWindowHotkey: normalizeText(
                generalInput.popupWindowHotkey,
                generalFallback.popupWindowHotkey,
            ),
            requireCtrlEnterForLongPrompts: normalizeBoolean(
                generalInput.requireCtrlEnterForLongPrompts,
                generalFallback.requireCtrlEnterForLongPrompts,
            ),
            speed: normalizeChoice(
                generalInput.speed,
                generalFallback.speed,
                ["fast", "standard"],
            ),
            threadDetail: normalizeChoice(
                generalInput.threadDetail,
                generalFallback.threadDetail,
                ["concise", "full", "steps"],
            ),
        },
        git: {
            alwaysForcePush: normalizeBoolean(
                gitInput.alwaysForcePush,
                gitFallback.alwaysForcePush,
            ),
            branchPrefix: normalizeText(
                gitInput.branchPrefix,
                gitFallback.branchPrefix,
            ),
            commitInstructions: typeof gitInput.commitInstructions === "string"
                ? gitInput.commitInstructions
                : gitFallback.commitInstructions,
            createDraftPullRequests: normalizeBoolean(
                gitInput.createDraftPullRequests,
                gitFallback.createDraftPullRequests,
            ),
            pullRequestInstructions: typeof gitInput.pullRequestInstructions === "string"
                ? gitInput.pullRequestInstructions
                : gitFallback.pullRequestInstructions,
            pullRequestMergeMethod: normalizeChoice(
                gitInput.pullRequestMergeMethod,
                gitFallback.pullRequestMergeMethod,
                ["merge", "rebase", "squash"],
            ),
            showPrIcons: normalizeBoolean(
                gitInput.showPrIcons,
                gitFallback.showPrIcons,
            ),
        },
        includeThinking: normalizeBoolean(
            input.includeThinking,
            current.includeThinking,
        ),
        mcpServers: normalizeMcpServers(input.mcpServers, current.mcpServers),
        modelProfiles,
        personalization: {
            customInstructions:
                typeof personalizationInput.customInstructions === "string"
                    ? personalizationInput.customInstructions
                    : personalizationFallback.customInstructions,
            personality: normalizeChoice(
                personalizationInput.personality,
                personalizationFallback.personality,
                ["builder", "concise", "pragmatic", "teacher"],
            ),
        },
        port: normalizeNumber(input.port, current.port, 1024, 65535),
        usage: {
            autoReloadCredit: normalizeBoolean(
                usageInput.autoReloadCredit,
                usageFallback.autoReloadCredit,
            ),
            autoReloadThreshold: normalizeNumber(
                usageInput.autoReloadThreshold,
                usageFallback.autoReloadThreshold,
                0,
                100000,
            ),
            creditRemaining: normalizeNumber(
                usageInput.creditRemaining,
                usageFallback.creditRemaining,
                0,
                100000,
            ),
            fiveHourLimit: normalizeNumber(
                usageInput.fiveHourLimit,
                usageFallback.fiveHourLimit,
                1,
                100000,
            ),
            weeklyLimit: normalizeNumber(
                usageInput.weeklyLimit,
                usageFallback.weeklyLimit,
                1,
                100000,
            ),
        },
        workingDirectory: normalizeExistingDirectory(
            typeof input.workingDirectory === "string"
                ? input.workingDirectory
                : current.workingDirectory,
            DEFAULT_WORKING_DIRECTORY,
        ),
        worktrees: {
            autoDeleteLimit: normalizeNumber(
                isRecord(input.worktrees) ? input.worktrees.autoDeleteLimit : undefined,
                current.worktrees.autoDeleteLimit,
                1,
                200,
            ),
            autoDeleteOldWorktrees: normalizeBoolean(
                isRecord(input.worktrees)
                    ? input.worktrees.autoDeleteOldWorktrees
                    : undefined,
                current.worktrees.autoDeleteOldWorktrees,
            ),
        },
    };
}

function defaultConfig(): AppConfig {
    return normalizeConfig({});
}

function isOpenAICompatibleProfile(profile?: AppModelProfile): boolean {
    return profile?.protocol === "openai";
}

function shouldUseProfileModelForOpenAIConfig(
    threadModel: string | undefined,
    profile: AppModelProfile | undefined,
    config: Pick<AppConfig, "defaultModel" | "defaultModelProfileId" | "modelProfiles">,
): boolean {
    const normalizedThreadModel = normalizeText(threadModel);
    const profileModel = normalizeText(profile?.apiModel);
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
        normalizeText(config.defaultModelProfileId) === profile.id &&
        normalizedThreadModel === normalizeText(config.defaultModel)
    ) {
        return true;
    }
    if (
        config.modelProfiles.some(
            (candidate) =>
                candidate.id !== profile.id &&
                normalizeText(candidate.apiModel) === normalizedThreadModel,
        )
    ) {
        return true;
    }
    if (/^[^/\s]+(?:\/[^/\s]+){1,}$/i.test(normalizedThreadModel)) {
        return true;
    }
    return /(^claude[-/])|\b(sonnet|opus|haiku)\b/i.test(normalizedThreadModel);
}

function normalizedThreadModelForProfile(
    threadModel: string | undefined,
    profile: AppModelProfile | undefined,
    config: Pick<AppConfig, "defaultModel" | "defaultModelProfileId" | "modelProfiles">,
): string {
    const normalizedThreadModel = normalizeText(threadModel);
    if (!isOpenAICompatibleProfile(profile)) {
        return normalizedThreadModel;
    }
    const profileModel = normalizeText(profile?.apiModel);
    if (
        profileModel &&
        shouldUseProfileModelForOpenAIConfig(normalizedThreadModel, profile, config)
    ) {
        return profileModel;
    }
    return normalizedThreadModel || profileModel || "";
}

function ensureDataDir(): void {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
}

function normalizeExistingDirectory(candidate: string | undefined, fallback: string): string {
    const next = (candidate || "").trim();
    if (next && existsSync(next)) {
        return next;
    }
    return fallback;
}

function isPathInsideRoot(candidatePath: string, rootPath: string): boolean {
    const resolvedRoot = resolve(rootPath);
    const resolvedCandidate = resolve(candidatePath);
    if (resolvedCandidate === resolvedRoot) {
        return true;
    }
    return resolvedCandidate.startsWith(`${resolvedRoot}${sep}`);
}

function resolveWorkspacePath(rawPath: string | undefined, workingDirectory: string): string {
    const candidate = normalizeText(rawPath, ".") || ".";
    const resolvedPath = resolve(workingDirectory, candidate);
    if (!isPathInsideRoot(resolvedPath, workingDirectory)) {
        throw new Error("Path must stay inside the selected workspace.");
    }
    return resolvedPath;
}

function toWorkspaceRelativePath(targetPath: string, workingDirectory: string): string {
    const relativePath = relative(workingDirectory, targetPath).replace(/\\/g, "/");
    return relativePath || ".";
}

function detectAttachmentMimeType(filePath: string): string {
    return ATTACHMENT_MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function bufferLooksText(buffer: Uint8Array): boolean {
    if (!buffer.length) {
        return true;
    }
    let zeroBytes = 0;
    for (const value of buffer) {
        if (value === 0) {
            zeroBytes += 1;
        }
    }
    return zeroBytes / buffer.length < 0.01;
}

function readAttachment(filePath: string): AppAttachment {
    const stats = statSync(filePath);
    const fullBuffer = readFileSync(filePath);
    const textBuffer =
        fullBuffer.length > ATTACHMENT_TEXT_BYTES_LIMIT
            ? fullBuffer.subarray(0, ATTACHMENT_TEXT_BYTES_LIMIT)
            : fullBuffer;
    const mimeType = detectAttachmentMimeType(filePath);
    const looksText = bufferLooksText(textBuffer);

    return {
        extractedText: looksText ? textBuffer.toString("utf8") : undefined,
        id: crypto.randomUUID(),
        kind: looksText ? "text" : "binary",
        mimeType,
        name: basename(filePath),
        path: filePath,
        size: stats.size,
        truncated: fullBuffer.length > ATTACHMENT_TEXT_BYTES_LIMIT,
    };
}

function formatAttachmentsForPrompt(attachments: AppAttachment[]): string {
    if (!attachments.length) {
        return "";
    }

    return attachments
        .map((attachment, index) => {
            const header = [
                `Attachment ${index + 1}: ${attachment.name}`,
                `Path: ${attachment.path}`,
                `Type: ${attachment.mimeType}`,
                `Size: ${attachment.size} bytes`,
            ];

            if (attachment.kind !== "text" || !attachment.extractedText) {
                header.push("Content was not inlined because the file is binary.");
                return header.join("\n");
            }

            const body = attachment.truncated
                ? `${attachment.extractedText}\n\n[Truncated to the first ${ATTACHMENT_TEXT_BYTES_LIMIT} bytes.]`
                : attachment.extractedText;

            return [
                ...header,
                "Content:",
                body,
            ].join("\n");
        })
        .join("\n\n");
}

function composeUserPrompt(prompt: string, attachments: AppAttachment[]): string {
    const attachmentBlock = formatAttachmentsForPrompt(attachments);
    if (!attachmentBlock) {
        return prompt;
    }
    return [
        prompt,
        "",
        "The user attached local files for this turn. Use the following file contents as additional context:",
        attachmentBlock,
    ].join("\n");
}

function deriveWorkspaceName(cwd: string): string {
    const next = cwd.replace(/[\\/]+$/, "");
    return basename(next) || next || "Workspace";
}

function createWorkspace(cwd: string, name = deriveWorkspaceName(cwd)): AppWorkspace {
    const createdAt = nowIso();
    return {
        id: crypto.randomUUID(),
        name,
        cwd,
        createdAt,
        updatedAt: createdAt,
    };
}

function createThread(workspaceId: string, title = "New chat"): AppThread {
    const createdAt = nowIso();
    const defaultProfile = store.config.modelProfiles.find(
        (profile) => profile.id === store.config.defaultModelProfileId,
    );
    const initialModel =
        normalizedThreadModelForProfile(
            store.config.defaultModel,
            defaultProfile,
            store.config,
        ) ||
        normalizeText(store.config.defaultModel) ||
        undefined;
    return {
        id: crypto.randomUUID(),
        title,
        workspaceId,
        modelProfileId: store.config.defaultModelProfileId || undefined,
        model: initialModel,
        createdAt,
        updatedAt: createdAt,
        status: "idle",
        messages: [],
    };
}

function normalizeStore(raw: Partial<AppStore> | null | undefined): AppStore {
    const config = normalizeConfig(raw?.config);
    const profilesById = new Map(config.modelProfiles.map((profile) => [profile.id, profile]));
    const defaultProfile = profilesById.get(config.defaultModelProfileId);

    const workspaces = Array.isArray(raw?.workspaces)
        ? raw.workspaces.map((workspace) => ({
              ...workspace,
              cwd: normalizeExistingDirectory(
                  typeof workspace.cwd === "string" ? workspace.cwd : "",
                  config.workingDirectory,
              ),
              name:
                  typeof workspace.name === "string" && workspace.name.trim()
                      ? workspace.name.trim()
                      : deriveWorkspaceName(
                            normalizeExistingDirectory(
                                typeof workspace.cwd === "string" ? workspace.cwd : "",
                                config.workingDirectory,
                            ),
                        ),
              createdAt:
                  typeof workspace.createdAt === "string"
                      ? workspace.createdAt
                      : nowIso(),
              updatedAt:
                  typeof workspace.updatedAt === "string"
                      ? workspace.updatedAt
                      : typeof workspace.createdAt === "string"
                        ? workspace.createdAt
                        : nowIso(),
          }))
        : [];

    const threads = Array.isArray(raw?.threads)
        ? raw.threads.map((thread) => ({
              ...thread,
              title:
                  typeof thread.title === "string" && thread.title.trim()
                      ? thread.title.trim()
                      : "New chat",
              status: thread.status === "running" ? "idle" : (thread.status ?? "idle"),
              createdAt:
                  typeof thread.createdAt === "string"
                      ? thread.createdAt
                      : nowIso(),
              updatedAt:
                  typeof thread.updatedAt === "string"
                      ? thread.updatedAt
                      : typeof thread.createdAt === "string"
                        ? thread.createdAt
                        : nowIso(),
              messages: Array.isArray(thread.messages) ? thread.messages : [],
              cwd:
                  typeof thread.cwd === "string" && thread.cwd.trim()
                      ? normalizeExistingDirectory(thread.cwd, config.workingDirectory)
                      : undefined,
              workspaceId:
                  typeof thread.workspaceId === "string" ? thread.workspaceId : "",
              modelProfileId:
                  typeof thread.modelProfileId === "string" &&
                  config.modelProfiles.some((profile) => profile.id === thread.modelProfileId)
                      ? thread.modelProfileId
                      : undefined,
              model:
                  normalizedThreadModelForProfile(
                      typeof thread.model === "string" ? thread.model : "",
                      (
                          typeof thread.modelProfileId === "string" &&
                          config.modelProfiles.some(
                              (profile) => profile.id === thread.modelProfileId,
                          )
                              ? profilesById.get(thread.modelProfileId)
                              : undefined
                      ) || defaultProfile,
                      config,
                  ) || undefined,
              archivedAt:
                  typeof thread.archivedAt === "string"
                      ? thread.archivedAt
                      : undefined,
          }))
        : [];

    const workspaceById = new Map<string, AppWorkspace>();
    const workspaceByCwd = new Map<string, AppWorkspace>();

    const registerWorkspace = (workspace: AppWorkspace): AppWorkspace => {
        workspaceById.set(workspace.id, workspace);
        workspaceByCwd.set(workspace.cwd, workspace);
        return workspace;
    };

    for (const workspace of workspaces) {
        registerWorkspace(workspace);
    }

    const ensureWorkspace = (
        cwd: string,
        preferredName?: string,
        preferredUpdatedAt?: string,
    ): AppWorkspace => {
        const normalizedCwd = normalizeExistingDirectory(cwd, config.workingDirectory);
        const existing = workspaceByCwd.get(normalizedCwd);
        if (existing) {
            if (preferredUpdatedAt && preferredUpdatedAt > existing.updatedAt) {
                existing.updatedAt = preferredUpdatedAt;
            }
            if (
                preferredName &&
                (!existing.name || existing.name === deriveWorkspaceName(existing.cwd))
            ) {
                existing.name = preferredName;
            }
            return existing;
        }
        const workspace = createWorkspace(
            normalizedCwd,
            preferredName || deriveWorkspaceName(normalizedCwd),
        );
        if (preferredUpdatedAt) {
            workspace.updatedAt = preferredUpdatedAt;
        }
        workspaces.push(workspace);
        return registerWorkspace(workspace);
    };

    const defaultWorkspace = ensureWorkspace(config.workingDirectory, "Default Workspace");

    for (const thread of threads) {
        const attachedWorkspace =
            (thread.workspaceId && workspaceById.get(thread.workspaceId)) ||
            (thread.cwd ? workspaceByCwd.get(thread.cwd) : undefined) ||
            ensureWorkspace(
                thread.cwd || config.workingDirectory,
                thread.cwd ? deriveWorkspaceName(thread.cwd) : undefined,
                thread.updatedAt,
            ) ||
            defaultWorkspace;

        thread.workspaceId = attachedWorkspace.id;
        if (thread.cwd === attachedWorkspace.cwd) {
            delete thread.cwd;
        }
        if (thread.updatedAt > attachedWorkspace.updatedAt) {
            attachedWorkspace.updatedAt = thread.updatedAt;
        }
    }

    workspaces.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    threads.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const automations = normalizeAutomations(raw?.automations, workspaces, config);

    return {
        automations,
        config,
        workspaces,
        threads,
    };
}

function loadStore(): AppStore {
    ensureDataDir();
    if (!existsSync(STORE_PATH)) {
        if (existsSync(LEGACY_STORE_PATH)) {
            try {
                const legacyRaw = JSON.parse(readFileSync(LEGACY_STORE_PATH, "utf8")) as AppStore;
                const migratedStore = normalizeStore(legacyRaw);
                writeStore(migratedStore);
                return migratedStore;
            } catch {
                // Ignore legacy migration failures and fall back to a fresh store.
            }
        }
        const initialStore = normalizeStore(null);
        writeStore(initialStore);
        return initialStore;
    }

    try {
        const raw = JSON.parse(readFileSync(STORE_PATH, "utf8")) as AppStore;
        return normalizeStore(raw);
    } catch {
        const fallback = normalizeStore(null);
        writeStore(fallback);
        return fallback;
    }
}

function writeStore(store: AppStore): void {
    ensureDataDir();
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

let store = loadStore();

function saveStore(): void {
    writeStore(store);
}

function activeRunPayload(threadId: string): LiveRunState | null {
    return activeRuns.get(threadId)?.state ?? null;
}

function updateActiveRun(
    threadId: string,
    updater: (run: ActiveRun) => void,
): ActiveRun | undefined {
    const run = activeRuns.get(threadId);
    if (!run) {
        return undefined;
    }
    updater(run);
    run.state.updatedAt = nowIso();
    return run;
}

function publicConfig(config: AppConfig) {
    return {
        appearance: config.appearance,
        apiKey: config.apiKey,
        autoOpenBrowser: config.autoOpenBrowser,
        configuration: config.configuration,
        defaultModel: config.defaultModel,
        defaultModelProfileId: config.defaultModelProfileId,
        defaultPermissionMode: config.defaultPermissionMode,
        environments: config.environments,
        general: config.general,
        git: config.git,
        hasApiKey: Boolean(config.apiKey || process.env.ANTHROPIC_API_KEY),
        includeThinking: config.includeThinking,
        mcpServers: config.mcpServers.map(({ authValue: _, ...server }) => server),
        modelProfiles: config.modelProfiles,
        personalization: config.personalization,
        port: config.port,
        usage: config.usage,
        workingDirectory: config.workingDirectory,
        worktrees: config.worktrees,
    };
}

function publicStore() {
    return {
        automations: store.automations,
        config: publicConfig(store.config),
        threads: store.threads,
        workspaces: store.workspaces,
        version: "2.1.888",
    };
}

function deriveThreadTitle(prompt: string): string {
    const singleLine = prompt.replace(/\s+/g, " ").trim();
    if (!singleLine) {
        return "New chat";
    }
    return singleLine.length > 42 ? `${singleLine.slice(0, 42)}...` : singleLine;
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        status,
    });
}

function notFound(): Response {
    return json({ error: "Not found" }, 404);
}

function badRequest(message: string): Response {
    return json({ error: message }, 400);
}

function sortThreads(): void {
    store.threads.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function sortWorkspaces(): void {
    store.workspaces.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function sortAutomations(): void {
    store.automations.sort((left, right) => left.name.localeCompare(right.name));
}

function getWorkspace(workspaceId: string): AppWorkspace | undefined {
    return store.workspaces.find((workspace) => workspace.id === workspaceId);
}

function defaultWorkspace(): AppWorkspace {
    const existing = store.workspaces.find(
        (workspace) => workspace.cwd === store.config.workingDirectory,
    );
    if (existing) {
        return existing;
    }

    const workspace = createWorkspace(store.config.workingDirectory, "Default Workspace");
    store.workspaces.unshift(workspace);
    sortWorkspaces();
    saveStore();
    return workspace;
}

function getThread(threadId: string): AppThread | undefined {
    return store.threads.find((thread) => thread.id === threadId);
}

function getAutomation(automationId: string): AppAutomation | undefined {
    return store.automations.find((automation) => automation.id === automationId);
}

function touchWorkspace(workspaceId: string, updatedAt = nowIso()): void {
    const workspace = getWorkspace(workspaceId);
    if (!workspace) {
        return;
    }
    if (updatedAt > workspace.updatedAt) {
        workspace.updatedAt = updatedAt;
        sortWorkspaces();
    }
}

function updateWorkspace(
    workspaceId: string,
    updater: (workspace: AppWorkspace) => void,
): AppWorkspace {
    const workspace = getWorkspace(workspaceId);
    if (!workspace) {
        throw new Error("Workspace not found");
    }
    updater(workspace);
    workspace.updatedAt = nowIso();
    sortWorkspaces();
    saveStore();
    return workspace;
}

function updateThread(threadId: string, updater: (thread: AppThread) => void): AppThread {
    const thread = getThread(threadId);
    if (!thread) {
        throw new Error("Thread not found");
    }
    if (!thread.workspaceId || !getWorkspace(thread.workspaceId)) {
        thread.workspaceId = defaultWorkspace().id;
    }
    updater(thread);
    thread.updatedAt = nowIso();
    touchWorkspace(thread.workspaceId, thread.updatedAt);
    sortThreads();
    saveStore();
    return thread;
}

function updateAutomation(
    automationId: string,
    updater: (automation: AppAutomation) => void,
): AppAutomation {
    const automation = getAutomation(automationId);
    if (!automation) {
        throw new Error("Automation not found");
    }
    updater(automation);
    automation.updatedAt = nowIso();
    sortAutomations();
    saveStore();
    return automation;
}

function createAutomation(
    input: Partial<AppAutomation> & { name: string; prompt: string; workspaceId: string },
): AppAutomation {
    const createdAt = nowIso();
    const automation: AppAutomation = {
        category: normalizeText(input.category, "Status reports") || "Status reports",
        createdAt,
        description: normalizeText(input.description, ""),
        enabled: input.enabled ?? true,
        frequency: input.frequency ?? "daily",
        id: crypto.randomUUID(),
        intervalHours: Math.max(1, input.intervalHours ?? 24),
        lastRunAt: input.lastRunAt,
        modelProfileId: input.modelProfileId,
        name: normalizeText(input.name, "New automation") || "New automation",
        nextRunAt: "",
        permissionMode: input.permissionMode,
        prompt: normalizeText(input.prompt, ""),
        timeOfDay: normalizeTimeOfDay(input.timeOfDay, "09:00"),
        updatedAt: createdAt,
        weekdays: normalizeAutomationWeekdays(input.weekdays),
        workspaceId: input.workspaceId,
    };
    automation.nextRunAt = computeAutomationNextRun(automation);
    return automation;
}

function automationPermissionMode(
    automation: AppAutomation,
): PermissionMode | undefined {
    return automation.permissionMode && PERMISSION_MODES.has(automation.permissionMode)
        ? automation.permissionMode
        : undefined;
}

function resolveAutomationWorkspace(workspaceId?: string): AppWorkspace {
    return (workspaceId ? getWorkspace(workspaceId) : undefined) || defaultWorkspace();
}

function automationRunErrorMessage(payload: Record<string, unknown>): string {
    const error = payload.error;
    if (typeof error === "string" && error.trim()) {
        return error.trim();
    }
    if (isRecord(error) && typeof error.message === "string" && error.message.trim()) {
        return error.message.trim();
    }
    return "Automation run failed.";
}

async function executeAutomationRun(
    automationId: string,
): Promise<{ automation: AppAutomation; thread: AppThread }> {
    const automation = getAutomation(automationId);
    if (!automation) {
        throw new Error("Automation not found.");
    }
    if (activeAutomationRuns.has(automationId)) {
        throw new Error("This automation is already starting.");
    }
    if (!normalizeText(automation.prompt)) {
        throw new Error("Automation prompt cannot be empty.");
    }

    const workspace = resolveAutomationWorkspace(automation.workspaceId);
    const workingDirectory = resolveWorkingDirectory(workspace.cwd);
    if (!existsSync(workingDirectory)) {
        throw new Error(`Working directory does not exist: ${workingDirectory}`);
    }

    activeAutomationRuns.add(automationId);
    try {
        const thread = createThread(
            workspace.id,
            formatAutomationThreadTitle(automation.name),
        );
        thread.cwd = workingDirectory;
        thread.modelProfileId =
            automation.modelProfileId || store.config.defaultModelProfileId || undefined;
        thread.permissionMode =
            automationPermissionMode(automation) || store.config.defaultPermissionMode;

        store.threads.unshift(thread);
        touchWorkspace(workspace.id, thread.updatedAt);
        sortThreads();
        saveStore();

        const response = await runThread(thread.id, automation.prompt);
        const payload = (await response.json().catch(() => ({}))) as Record<
            string,
            unknown
        >;

        if (!response.ok) {
            store.threads = store.threads.filter((item) => item.id !== thread.id);
            sortThreads();
            saveStore();
            throw new Error(automationRunErrorMessage(payload));
        }

        const executedAt = new Date();
        const nextAutomation = updateAutomation(automation.id, (current) => {
            current.lastRunAt = executedAt.toISOString();
            current.nextRunAt = computeAutomationNextRun(current, executedAt);
        });

        return {
            automation: nextAutomation,
            thread: (payload.thread as AppThread) || getThread(thread.id) || thread,
        };
    } finally {
        activeAutomationRuns.delete(automationId);
    }
}

function resolveWorkingDirectory(candidate?: string): string {
    return normalizeExistingDirectory(
        candidate,
        store.config.workingDirectory || DEFAULT_WORKING_DIRECTORY,
    );
}

function effectiveThreadWorkingDirectory(thread: AppThread): string {
    const workspace = getWorkspace(thread.workspaceId);
    return resolveWorkingDirectory(
        thread.cwd || workspace?.cwd || store.config.workingDirectory,
    );
}

function getModelProfile(profileId?: string): AppModelProfile | undefined {
    if (!profileId) {
        return undefined;
    }
    return store.config.modelProfiles.find((profile) => profile.id === profileId);
}

function resolveThreadModelProfile(thread: AppThread): AppModelProfile | undefined {
    return (
        getModelProfile(thread.modelProfileId) ||
        getModelProfile(store.config.defaultModelProfileId)
    );
}

function shouldUseProfileModelForOpenAI(
    threadModel: string | undefined,
    profile?: AppModelProfile,
): boolean {
    return shouldUseProfileModelForOpenAIConfig(threadModel, profile, store.config);
}

function effectiveThreadModel(thread: AppThread): string {
    const profile = resolveThreadModelProfile(thread);
    const threadModel = normalizedThreadModelForProfile(
        thread.model,
        profile,
        store.config,
    );
    if (isOpenAICompatibleProfile(profile)) {
        const profileModel = normalizeText(profile?.apiModel);
        return (
            threadModel ||
            profileModel ||
            normalizeText(store.config.defaultModel) ||
            normalizeText(process.env.ANTHROPIC_MODEL) ||
            ""
        );
    }
    return (
        threadModel ||
        normalizeText(profile?.apiModel) ||
        normalizeText(store.config.defaultModel) ||
        normalizeText(process.env.ANTHROPIC_MODEL) ||
        ""
    );
}

function threadRuntimeEnv(thread: AppThread): Record<string, string> {
    const profile = resolveThreadModelProfile(thread);
    if (isOpenAICompatibleProfile(profile)) {
        return {};
    }
    const env: Record<string, string> = {};
    const apiKey =
        profile?.apiKey ||
        store.config.apiKey ||
        process.env.ANTHROPIC_API_KEY ||
        "";
    const baseUrl =
        profile?.baseUrl ||
        process.env.ANTHROPIC_BASE_URL ||
        "";
    const model = effectiveThreadModel(thread);

    if (apiKey) {
        env.ANTHROPIC_API_KEY = apiKey;
    }
    if (baseUrl) {
        env.ANTHROPIC_BASE_URL = baseUrl;
    }
    if (model) {
        env.ANTHROPIC_MODEL = model;
    }

    return env;
}

function resolveOpenAICompatibleEndpoint(profile: AppModelProfile): string {
    const baseUrl = normalizeText(profile.baseUrl).replace(/\/+$/, "");
    if (!baseUrl) {
        return "";
    }
    if (/\/chat\/completions$/i.test(baseUrl)) {
        return baseUrl;
    }
    return `${baseUrl}/chat/completions`;
}

function extractTextFromOpenAIContent(content: unknown): string {
    if (typeof content === "string") {
        return content;
    }
    if (!Array.isArray(content)) {
        return "";
    }
    return content
        .map((item) => {
            if (typeof item === "string") {
                return item;
            }
            if (!item || typeof item !== "object") {
                return "";
            }
            const block = item as Record<string, unknown>;
            return typeof block.text === "string" ? block.text : "";
        })
        .join("");
}

function openAIThreadHistoryMessages(thread: AppThread): AppMessage[] {
    return thread.messages.filter(
        (message) => message.role === "assistant" || message.role === "user",
    );
}

function openAIThreadHistoryCharCount(thread: AppThread): number {
    return openAIThreadHistoryMessages(thread).reduce(
        (total, message) => total + normalizeText(message.text).length,
        0,
    );
}

function shouldCompactOpenAIThread(thread: AppThread): boolean {
    const history = openAIThreadHistoryMessages(thread);
    if (history.length <= OPENAI_COMPACT_KEEP_RECENT_MESSAGES) {
        return false;
    }
    return openAIThreadHistoryCharCount(thread) >= OPENAI_COMPACT_HISTORY_CHAR_THRESHOLD;
}

function serializeMessagesForOpenAICompaction(messages: AppMessage[]): string {
    const parts: string[] = [];
    let totalLength = 0;

    for (const message of messages) {
        const rawText = normalizeText(message.text);
        if (!rawText) {
            continue;
        }

        const limitedText =
            rawText.length > OPENAI_COMPACT_MESSAGE_CHAR_LIMIT
                ? `${rawText.slice(0, OPENAI_COMPACT_MESSAGE_CHAR_LIMIT)}\n[Truncated]`
                : rawText;
        const block = `${message.role === "user" ? "User" : "Assistant"}:\n${limitedText}`;
        if (totalLength + block.length > OPENAI_COMPACT_TRANSCRIPT_CHAR_LIMIT) {
            break;
        }
        parts.push(block);
        totalLength += block.length;
    }

    return parts.join("\n\n");
}

async function requestOpenAICompactionSummary(
    endpoint: string,
    apiKey: string,
    model: string,
    existingSummary: string,
    transcript: string,
    signal?: AbortSignal,
): Promise<string> {
    const promptSections = [
        "Summarize the earlier conversation so future turns can continue with less context.",
        "Keep the summary factual and concise.",
        "Preserve:",
        "- user goals, deliverables, and constraints",
        "- important file paths, commands, and tool results",
        "- decisions already made",
        "- unfinished work and next steps",
        "- relevant attachment findings already extracted into the chat",
        "Write plain text with short bullet points.",
    ];

    if (existingSummary) {
        promptSections.push("", "Existing summary:", existingSummary);
    }
    promptSections.push("", "Older messages to compress:", transcript);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content:
                        "You produce compact conversation summaries for an agent runtime. Do not invent facts. Keep it useful for future coding work.",
                },
                {
                    role: "user",
                    content: promptSections.join("\n"),
                },
            ],
            model,
            stream: false,
        }),
        signal,
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
        const errorText =
            extractTextFromOpenAIContent(
                isRecord(payload.error) ? payload.error.message : payload.error,
            ) ||
            (typeof payload.message === "string" ? payload.message : "") ||
            response.statusText ||
            "OpenAI-compatible compaction request failed.";
        throw new Error(errorText);
    }

    const result = extractOpenAICompatibleResult(payload);
    const summary = openAICompatibleVisibleText(result.text, result.thinking);
    if (!summary || summary === "No response returned.") {
        throw new Error("Context compaction returned an empty summary.");
    }
    return summary;
}

async function compactOpenAIThreadContext(
    thread: AppThread,
    profile: AppModelProfile,
    mode: "auto" | "manual",
    controller?: AbortController,
): Promise<{ compacted: boolean; compactedMessageCount: number; summary?: string }> {
    const history = openAIThreadHistoryMessages(thread);
    const olderMessages = history.slice(0, -OPENAI_COMPACT_KEEP_RECENT_MESSAGES);
    if (!olderMessages.length) {
        return { compacted: false, compactedMessageCount: 0 };
    }

    const transcript = serializeMessagesForOpenAICompaction(olderMessages);
    if (!transcript) {
        return { compacted: false, compactedMessageCount: 0 };
    }

    const endpoint = resolveOpenAICompatibleEndpoint(profile);
    const apiKey = normalizeText(profile.apiKey);
    const model = effectiveThreadModel(thread);
    if (!endpoint || !apiKey || !model) {
        throw new Error("OpenAI-compatible profile is incomplete for context compaction.");
    }

    const summary = await requestOpenAICompactionSummary(
        endpoint,
        apiKey,
        model,
        normalizeText(thread.compactSummary),
        transcript,
        controller?.signal,
    );

    const olderMessageIds = new Set(olderMessages.map((message) => message.id));
    updateThread(thread.id, (current) => {
        current.compactMode = mode;
        current.compactSummary = summary;
        current.compactUpdatedAt = nowIso();
        current.compactedMessageCount =
            (current.compactedMessageCount || 0) + olderMessages.length;
        current.messages = current.messages.filter((message) => !olderMessageIds.has(message.id));
    });

    return {
        compacted: true,
        compactedMessageCount: olderMessages.length,
        summary,
    };
}

function buildOpenAICompatibleMessages(
    thread: AppThread,
    prompt: string,
    workingDirectory: string,
): Array<Record<string, unknown>> {
    const history = openAIThreadHistoryMessages(thread);
    const compactSummary = normalizeText(thread.compactSummary);
    const systemMessage = {
        content: [
            openAIWorkspaceInstruction(thread, workingDirectory),
            compactSummary
                ? `Earlier conversation summary:\n${compactSummary}`
                : "",
        ]
            .filter(Boolean)
            .join("\n\n"),
        role: "system",
    };

    if (history.length === 0) {
        return [systemMessage, { content: prompt, role: "user" }];
    }

    return [
        systemMessage,
        ...history.map((message, index) => ({
            content:
                index === history.length - 1 && message.role === "user"
                    ? prompt
                    : message.text,
            role: message.role,
        })),
    ];
}

function extractOpenAICompatibleResult(payload: Record<string, unknown>): {
    text: string;
    thinking: string;
    usage?: unknown;
} {
    const choices = Array.isArray(payload.choices) ? payload.choices : [];
    const firstChoice =
        choices[0] && typeof choices[0] === "object"
            ? (choices[0] as Record<string, unknown>)
            : null;
    const message =
        firstChoice?.message && typeof firstChoice.message === "object"
            ? (firstChoice.message as Record<string, unknown>)
            : null;

    return {
        text:
            extractTextFromOpenAIContent(message?.content) ||
            (typeof payload.output_text === "string" ? payload.output_text : ""),
        thinking:
            typeof message?.reasoning_content === "string"
                ? message.reasoning_content
                : "",
        usage: payload.usage,
    };
}

function openAICompatibleVisibleText(text: string, thinking: string): string {
    return normalizeText(text) || normalizeText(thinking) || "No response returned.";
}

async function executeOpenAICompatibleRun(
    thread: AppThread,
    prompt: string,
    profile: AppModelProfile,
    workingDirectory: string,
): Promise<void> {
    const assistantStartedAt = nowIso();
    const endpoint = resolveOpenAICompatibleEndpoint(profile);
    const model = effectiveThreadModel(thread);
    const apiKey = normalizeText(profile.apiKey);
    const tools = openAIWorkspaceToolDefinitions(thread);

    if (!endpoint) {
        throw new Error("Model profile is missing an OpenAI-compatible URL.");
    }
    if (!apiKey) {
        throw new Error("Model profile is missing an API key.");
    }
    if (!model) {
        throw new Error("Model profile is missing an API model name.");
    }

    const controller = new AbortController();
    updateActiveRun(thread.id, (current) => {
        current.abortController = controller;
        current.state.status = "running";
    });

    let assistantText = "";
    let assistantThinking = "";
    let finalUsage: unknown;

    try {
        if (shouldCompactOpenAIThread(thread)) {
            updateActiveRun(thread.id, (current) => {
                current.state.lastTool = "compact_context";
            });
            try {
                await compactOpenAIThreadContext(thread, profile, "auto", controller);
            } catch {
                // Skip compaction failures so the main response can continue.
            } finally {
                updateActiveRun(thread.id, (current) => {
                    current.state.lastTool = undefined;
                });
            }
        }

        const messages = buildOpenAICompatibleMessages(thread, prompt, workingDirectory);
        let loopCount = 0;

        while (loopCount < OPENAI_TOOL_LOOP_LIMIT) {
            loopCount += 1;

            const requestBody: Record<string, unknown> = {
                messages,
                model,
                stream: false,
            };
            if (tools.length) {
                requestBody.tools = tools;
                requestBody.tool_choice = "auto";
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            const payload = (await response.json().catch(() => ({}))) as Record<
                string,
                unknown
            >;

            if (!response.ok) {
                const errorText =
                    extractTextFromOpenAIContent(
                        isRecord(payload.error) ? payload.error.message : payload.error,
                    ) ||
                    (typeof payload.message === "string" ? payload.message : "") ||
                    response.statusText ||
                    "OpenAI-compatible request failed.";
                throw new Error(errorText);
            }

            const result = extractOpenAICompatibleResult(payload);
            finalUsage = result.usage;

            const choices = Array.isArray(payload.choices) ? payload.choices : [];
            const firstChoice =
                choices[0] && typeof choices[0] === "object"
                    ? (choices[0] as Record<string, unknown>)
                    : null;
            const message =
                firstChoice?.message && typeof firstChoice.message === "object"
                    ? (firstChoice.message as Record<string, unknown>)
                    : null;
            const toolCalls = Array.isArray(message?.tool_calls)
                ? (message?.tool_calls as Array<Record<string, unknown>>)
                : [];

            assistantThinking += result.thinking || "";

            if (!toolCalls.length) {
                assistantText = openAICompatibleVisibleText(result.text, assistantThinking);
                break;
            }

            messages.push({
                content: typeof message?.content === "string" ? message.content : result.text,
                role: "assistant",
                tool_calls: toolCalls,
            });

            for (const toolCall of toolCalls) {
                const functionPayload =
                    toolCall.function && typeof toolCall.function === "object"
                        ? (toolCall.function as Record<string, unknown>)
                        : {};
                const toolName =
                    typeof functionPayload.name === "string"
                        ? functionPayload.name
                        : "tool";
                const toolArguments =
                    typeof functionPayload.arguments === "string"
                        ? functionPayload.arguments
                        : undefined;
                const toolCallId =
                    typeof toolCall.id === "string" ? toolCall.id : crypto.randomUUID();

                updateActiveRun(thread.id, (current) => {
                    current.state.lastTool = toolName;
                });

                let toolResult: Record<string, unknown>;
                try {
                    toolResult = await executeOpenAIWorkspaceTool(
                        thread,
                        workingDirectory,
                        toolName,
                        toolArguments,
                    );
                } catch (error) {
                    toolResult = {
                        error: error instanceof Error ? error.message : "Tool execution failed.",
                    };
                }

                messages.push({
                    content: JSON.stringify(toolResult),
                    role: "tool",
                    tool_call_id: toolCallId,
                });
            }
        }

        if (!assistantText) {
            assistantText = openAICompatibleVisibleText(assistantText, assistantThinking);
        }

        const wasAborted = activeRuns.get(thread.id)?.aborted ?? false;
        const assistantMessage: AppMessage = {
            id: crypto.randomUUID(),
            role: wasAborted ? "system" : "assistant",
            text: wasAborted ? "Generation stopped." : assistantText,
            thinking: assistantThinking || undefined,
            createdAt: assistantStartedAt,
            isError: wasAborted,
            usage: finalUsage,
        };

        updateThread(thread.id, (current) => {
            current.status = wasAborted ? "error" : "idle";
            current.lastError = wasAborted ? assistantMessage.text : undefined;
            current.messages.push(assistantMessage);
        });

        updateActiveRun(thread.id, (current) => {
            current.state.assistantText = assistantMessage.text;
            current.state.assistantThinking = assistantThinking;
            current.state.error = wasAborted ? assistantMessage.text : undefined;
            current.state.status = wasAborted ? "error" : "completed";
        });
    } catch (error) {
        const message =
            error instanceof Error && error.name === "AbortError"
                ? "Generation stopped."
                : error instanceof Error
                  ? error.message
                  : "OpenAI-compatible request failed.";
        const errorMessage: AppMessage = {
            id: crypto.randomUUID(),
            role: "system",
            text: message,
            createdAt: assistantStartedAt,
            isError: true,
        };

        updateThread(thread.id, (current) => {
            current.status = "error";
            current.lastError = message;
            current.messages.push(errorMessage);
        });

        updateActiveRun(thread.id, (current) => {
            current.state.assistantText = assistantText;
            current.state.assistantThinking = assistantThinking;
            current.state.error = message;
            current.state.status = "error";
        });
    } finally {
        activeRuns.delete(thread.id);
    }
}

async function pickDirectory(initialPath?: string): Promise<string | null> {
    if (process.platform !== "win32") {
        throw new Error("Native directory picker is currently implemented for Windows only.");
    }

    const startingPath = initialPath && existsSync(initialPath)
        ? initialPath.replace(/'/g, "''")
        : "";
    const command = [
        "Add-Type -AssemblyName System.Windows.Forms",
        "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog",
        "$dialog.Description = 'Choose a working directory'",
        "$dialog.ShowNewFolderButton = $true",
        startingPath ? `$dialog.SelectedPath = '${startingPath}'` : "",
        "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
        "  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
        "  Write-Output $dialog.SelectedPath",
        "}",
    ].filter(Boolean).join("; ");

    const picker = Bun.spawn({
        cmd: ["powershell.exe", "-NoProfile", "-STA", "-Command", command],
        stderr: "pipe",
        stdout: "pipe",
    });

    const stdout = await new Response(picker.stdout).text();
    const stderr = await new Response(picker.stderr).text();
    const exitCode = await picker.exited;

    if (exitCode !== 0) {
        throw new Error(stderr.trim() || "The native directory picker failed.");
    }

    const selectedPath = stdout.trim();
    return selectedPath || null;
}

async function pickFiles(initialPath?: string): Promise<string[]> {
    if (process.platform !== "win32") {
        throw new Error("Native file picker is currently implemented for Windows only.");
    }

    const startingPath = initialPath && existsSync(initialPath)
        ? initialPath.replace(/'/g, "''")
        : "";
    const command = [
        "Add-Type -AssemblyName System.Windows.Forms",
        "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
        "$dialog.Title = 'Choose files to attach'",
        "$dialog.Multiselect = $true",
        "$dialog.CheckFileExists = $true",
        "$dialog.CheckPathExists = $true",
        "$dialog.Filter = 'All files (*.*)|*.*'",
        startingPath ? `$dialog.InitialDirectory = '${startingPath}'` : "",
        "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
        "  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
        "  $dialog.FileNames | ForEach-Object { Write-Output $_ }",
        "}",
    ].filter(Boolean).join("; ");

    const picker = Bun.spawn({
        cmd: ["powershell.exe", "-NoProfile", "-STA", "-Command", command],
        stderr: "pipe",
        stdout: "pipe",
    });

    const stdout = await new Response(picker.stdout).text();
    const stderr = await new Response(picker.stderr).text();
    const exitCode = await picker.exited;

    if (exitCode !== 0) {
        throw new Error(stderr.trim() || "The native file picker failed.");
    }

    return stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function resolveBunBinary(): string {
    if (process.execPath) {
        return process.execPath;
    }
    const fallback = process.platform === "win32"
        ? join(homedir(), ".bun", "bin", "bun.exe")
        : join(homedir(), ".bun", "bin", "bun");
    return fallback;
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
    try {
        const body = (await request.json()) as Record<string, unknown>;
        return body ?? {};
    } catch {
        return {};
    }
}

function normalizeAttachmentsInput(input: unknown): AppAttachment[] {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map((entry) => {
            if (!entry || typeof entry !== "object") {
                return null;
            }
            const attachment = entry as Record<string, unknown>;
            const path =
                typeof attachment.path === "string" ? attachment.path.trim() : "";
            const name =
                typeof attachment.name === "string" ? attachment.name.trim() : "";
            if (!path || !name) {
                return null;
            }
            return {
                extractedText:
                    typeof attachment.extractedText === "string"
                        ? attachment.extractedText
                        : undefined,
                id:
                    typeof attachment.id === "string" && attachment.id.trim()
                        ? attachment.id.trim()
                        : crypto.randomUUID(),
                kind: attachment.kind === "binary" ? "binary" : "text",
                mimeType:
                    typeof attachment.mimeType === "string"
                        ? attachment.mimeType
                        : detectAttachmentMimeType(path),
                name,
                path,
                size:
                    typeof attachment.size === "number" && Number.isFinite(attachment.size)
                        ? attachment.size
                        : 0,
                truncated: Boolean(attachment.truncated),
            } satisfies AppAttachment;
        })
        .filter((entry): entry is AppAttachment => Boolean(entry));
}

function readTextFileIfExists(path: string): string {
    return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function parseTomlValue(source: string, key: string): string | undefined {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const stringMatch = source.match(
        new RegExp(`^\\s*${escapedKey}\\s*=\\s*"([^"]+)"\\s*$`, "m"),
    );
    if (stringMatch?.[1]) {
        return stringMatch[1];
    }
    const bareMatch = source.match(
        new RegExp(`^\\s*${escapedKey}\\s*=\\s*([^\\s#]+)`, "m"),
    );
    return bareMatch?.[1];
}

function listImportableConfigs() {
    const candidates = [
        {
            id: "codex-user",
            label: "Codex user config",
            path: join(homedir(), ".codex", "config.toml"),
            type: "toml",
        },
        {
            id: "codex-project",
            label: "Project config",
            path: join(store.config.workingDirectory, "config.toml"),
            type: "toml",
        },
        {
            id: "claude-desktop",
            label: "Legacy Claude app store",
            path: LEGACY_STORE_PATH,
            type: "json",
        },
    ];

    return candidates
        .filter((candidate) => existsSync(candidate.path))
        .map((candidate) => ({
            ...candidate,
            basename: basename(candidate.path),
        }));
}

function importExternalConfig(sourceId: string): Partial<AppConfig> | null {
    const source = listImportableConfigs().find((candidate) => candidate.id === sourceId);
    if (!source) {
        return null;
    }

    if (source.type === "json") {
        try {
            const parsed = JSON.parse(readTextFileIfExists(source.path)) as {
                config?: Partial<AppConfig>;
            };
            return parsed.config ?? null;
        } catch {
            return null;
        }
    }

    const text = readTextFileIfExists(source.path);
    if (!text) {
        return null;
    }

    const approvalPolicy = parseTomlValue(text, "approval_policy");
    const sandboxMode = parseTomlValue(text, "sandbox_mode");
    const model = parseTomlValue(text, "model");

    return {
        configuration: {
            ...store.config.configuration,
            approvalPolicy: normalizeChoice(
                approvalPolicy,
                store.config.configuration.approvalPolicy,
                ["never", "on-failure", "on-request"],
            ),
            sandboxMode: normalizeChoice(
                sandboxMode === "danger-full-access" ? "full-access" : sandboxMode,
                store.config.configuration.sandboxMode,
                ["full-access", "read-only", "workspace-write"],
            ),
        },
        defaultModel: model ?? store.config.defaultModel,
    };
}

function looksLikeGitPrompt(prompt: string): boolean {
    return /\b(commit|pull request|pr\b|branch|merge|rebase|push)\b/i.test(prompt);
}

function runtimeInstructionLines(thread: AppThread): string[] {
    const lines: string[] = [];
    const { general, personalization, git } = store.config;

    lines.push('If the user asks who you are, identify yourself as "Glaude Vibe Coder". Describe yourself as "一个智能协作 Agent" when replying in Chinese, or "an intelligent collaborative agent" when replying in English. Do not describe yourself as a programming assistant or refer to yourself as "Claude Code".');
    lines.push('When the user asks about the author, creator, maintainer, or contact information, say the author is 宫丰霖, the contact email is gongfenglin@sdust.edu.cn, and the website is https://2830500285.github.io/.');

    if (general.language === "zh-CN") {
        lines.push("Respond in Simplified Chinese unless the user explicitly requests another language.");
    } else if (general.language === "en-US") {
        lines.push("Respond in English unless the user explicitly requests another language.");
    }

    if (general.threadDetail === "concise") {
        lines.push("Keep replies concise and avoid unnecessary detail.");
    } else if (general.threadDetail === "steps") {
        lines.push("When useful, explain actions in short steps and include concrete commands.");
    } else {
        lines.push("Prefer fuller walkthroughs when the task is technical or multi-step.");
    }

    if (personalization.personality === "teacher") {
        lines.push("Adopt a teaching tone: explain tradeoffs clearly and define jargon briefly.");
    } else if (personalization.personality === "builder") {
        lines.push("Focus on execution and implementation details first.");
    } else if (personalization.personality === "concise") {
        lines.push("Keep the tone terse, direct, and high-signal.");
    } else {
        lines.push("Use a pragmatic, direct engineering tone.");
    }

    if (personalization.customInstructions.trim()) {
        lines.push(personalization.customInstructions.trim());
    }

    if (general.codeReviewMode === "detached") {
        lines.push("If asked for a review, structure the answer like a detached review thread with findings first.");
    }

    if (looksLikeGitPrompt(thread.messages.at(-1)?.text ?? "")) {
        if (git.branchPrefix.trim()) {
            lines.push(`Prefer branch names starting with "${git.branchPrefix.trim()}".`);
        }
        if (git.commitInstructions.trim()) {
            lines.push(`Commit guidance: ${git.commitInstructions.trim()}`);
        }
        if (git.pullRequestInstructions.trim()) {
            lines.push(`Pull request guidance: ${git.pullRequestInstructions.trim()}`);
        }
    }

    return lines;
}

function composeRuntimePrompt(thread: AppThread, prompt: string): string {
    const lines = runtimeInstructionLines({
        ...thread,
        messages: [...thread.messages, { id: "draft", role: "user", text: prompt, createdAt: nowIso() }],
    });
    if (lines.length === 0) {
        return prompt;
    }
    return [
        "Follow these app preferences while answering:",
        ...lines.map((line) => `- ${line}`),
        "",
        "User request:",
        prompt,
    ].join("\n");
}

function openAIWorkspaceWriteAllowed(permissionMode: PermissionMode | undefined): boolean {
    return permissionMode !== "plan";
}

function commandOutputLimitText(text: string): string {
    if (text.length <= COMMAND_OUTPUT_CHAR_LIMIT) {
        return text;
    }
    return `${text.slice(0, COMMAND_OUTPUT_CHAR_LIMIT)}\n\n[Truncated to the first ${COMMAND_OUTPUT_CHAR_LIMIT} characters.]`;
}

function integratedShellCommand(command: string): string[] {
    const shell = store.config.general.integratedTerminalShell;
    if (process.platform === "win32") {
        if (shell === "cmd") {
            return ["cmd.exe", "/d", "/s", "/c", command];
        }
        if (shell === "gitbash") {
            const candidates = [
                join(process.env["ProgramFiles"] || "", "Git", "bin", "bash.exe"),
                join(process.env["ProgramFiles(x86)"] || "", "Git", "bin", "bash.exe"),
                join(process.env["LocalAppData"] || "", "Programs", "Git", "bin", "bash.exe"),
            ].filter(Boolean);
            const bashPath = candidates.find((candidate) => candidate && existsSync(candidate)) || "bash";
            return [bashPath, "-lc", command];
        }
        return ["powershell.exe", "-NoProfile", "-Command", command];
    }
    return ["sh", "-lc", command];
}

async function executeWorkspaceProcess(
    cmd: string[],
    workingDirectory: string,
    timeoutMs: number,
    extraEnv: Record<string, string> = {},
): Promise<Record<string, unknown>> {
    const subprocess = Bun.spawn({
        cmd,
        cwd: workingDirectory,
        env: {
            ...process.env,
            ...extraEnv,
        },
        stderr: "pipe",
        stdout: "pipe",
    });

    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        try {
            subprocess.kill();
        } catch {
            // Ignore kill failures after process exit.
        }
    }, timeoutMs);

    const [stdout, stderr, exitCode] = await Promise.all([
        new Response(subprocess.stdout).text(),
        new Response(subprocess.stderr).text(),
        subprocess.exited,
    ]);
    clearTimeout(timer);

    return {
        command: cmd.join(" "),
        cwd: workingDirectory,
        exitCode,
        ok: !timedOut && exitCode === 0,
        stderr: commandOutputLimitText(stderr.trim()),
        stdout: commandOutputLimitText(stdout.trim()),
        timedOut,
    };
}

function openAIWorkspaceToolDefinitions(
    thread: AppThread,
): Array<Record<string, unknown>> {
    if (thread.permissionMode === "plan") {
        return [];
    }

    const definitions: Array<Record<string, unknown>> = [
        {
            type: "function",
            function: {
                name: "list_directory",
                description: "List files and folders inside the current workspace.",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Relative path inside the workspace. Use '.' for the workspace root.",
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: "function",
            function: {
                name: "search_files",
                description: "Search file and folder names inside the current workspace.",
                parameters: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                        },
                        path: {
                            type: "string",
                            description: "Relative path inside the workspace to search from.",
                        },
                        query: {
                            type: "string",
                            description: "Case-insensitive substring to match against workspace-relative paths.",
                        },
                    },
                    required: ["query"],
                    additionalProperties: false,
                },
            },
        },
        {
            type: "function",
            function: {
                name: "read_text_file",
                description: "Read a UTF-8 text file from the current workspace.",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Relative path of the file inside the workspace.",
                        },
                    },
                    required: ["path"],
                    additionalProperties: false,
                },
            },
        },
    ];

    if (openAIWorkspaceWriteAllowed(thread.permissionMode)) {
        definitions.push(
            {
                type: "function",
                function: {
                    name: "write_text_file",
                    description: "Overwrite a UTF-8 text file inside the current workspace.",
                    parameters: {
                        type: "object",
                        properties: {
                            content: {
                                type: "string",
                                description: "Complete new UTF-8 file content.",
                            },
                            path: {
                                type: "string",
                                description: "Relative path of the file inside the workspace.",
                            },
                        },
                        required: ["path", "content"],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "create_directory",
                    description: "Create a directory inside the current workspace.",
                    parameters: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Relative path of the directory to create inside the workspace.",
                            },
                        },
                        required: ["path"],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "delete_entry",
                    description: "Delete a file or directory inside the current workspace.",
                    parameters: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Relative path of the file or directory inside the workspace.",
                            },
                            recursive: {
                                type: "boolean",
                                description: "Set true when deleting a non-empty directory.",
                            },
                        },
                        required: ["path"],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "run_command",
                    description: "Run a terminal command inside the current workspace root.",
                    parameters: {
                        type: "object",
                        properties: {
                            command: {
                                type: "string",
                                description: "Command text to run in the configured integrated shell.",
                            },
                            timeoutMs: {
                                type: "integer",
                                minimum: 1000,
                                maximum: 120000,
                                description: "Optional timeout in milliseconds.",
                            },
                        },
                        required: ["command"],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "run_python",
                    description: "Run inline Python code inside the current workspace root.",
                    parameters: {
                        type: "object",
                        properties: {
                            code: {
                                type: "string",
                                description: "Inline Python code to execute.",
                            },
                            timeoutMs: {
                                type: "integer",
                                minimum: 1000,
                                maximum: 120000,
                                description: "Optional timeout in milliseconds.",
                            },
                        },
                        required: ["code"],
                        additionalProperties: false,
                    },
                },
            },
        );
    }

    return definitions;
}

function openAIWorkspaceInstruction(thread: AppThread, workingDirectory: string): string {
    const lines = [
        "You are operating inside a local workspace wrapper.",
        `Workspace root: ${workingDirectory}`,
        "Use the available workspace tools whenever you need to inspect folders or files.",
        "When the user asks to create, modify, or delete workspace files, do the operation with tools instead of replying with manual instructions.",
        "Terminal and Python execution tools are available in this wrapper. Use them when shell commands or Python scripts are the most direct way to complete the work.",
    ];

    if (thread.permissionMode === "plan") {
        lines.push("This thread is in plan mode. Do not call file tools or make file changes.");
    } else if (openAIWorkspaceWriteAllowed(thread.permissionMode)) {
        lines.push(
            "In this wrapper, every non-plan permission mode has writable local workspace tools enabled. You may read, create, update, and delete files inside the workspace with the provided tools.",
        );
    } else {
        lines.push(
            "You may inspect files in the workspace, but do not modify files unless the permission mode changes to acceptEdits or bypassPermissions.",
        );
    }

    return lines.join("\n");
}

function searchWorkspaceEntries(
    rootPath: string,
    startPath: string,
    query: string,
    limit: number,
): string[] {
    const matches: string[] = [];
    const pending = [startPath];
    const normalizedQuery = query.toLowerCase();
    const skipNames = new Set([".git", ".glaude-vibe-coding", ".claude-app", "dist", "release"]);

    while (pending.length && matches.length < limit) {
        const currentPath = pending.pop();
        if (!currentPath) {
            break;
        }

        for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
            if (skipNames.has(entry.name)) {
                continue;
            }
            const fullPath = join(currentPath, entry.name);
            const relativePath = toWorkspaceRelativePath(fullPath, rootPath);
            if (relativePath.toLowerCase().includes(normalizedQuery)) {
                matches.push(relativePath);
                if (matches.length >= limit) {
                    break;
                }
            }
            if (entry.isDirectory()) {
                pending.push(fullPath);
            }
        }
    }

    return matches;
}

async function executeOpenAIWorkspaceTool(
    thread: AppThread,
    workingDirectory: string,
    toolName: string,
    rawArguments: string | undefined,
): Promise<Record<string, unknown>> {
    const parsedArguments = rawArguments ? JSON.parse(rawArguments) : {};
    const args = isRecord(parsedArguments) ? parsedArguments : {};
    const canWrite = openAIWorkspaceWriteAllowed(thread.permissionMode);

    if (toolName === "list_directory") {
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : ".",
            workingDirectory,
        );
        const entries = readdirSync(targetPath, { withFileTypes: true })
            .slice(0, 200)
            .map((entry) => ({
                name: entry.name,
                path: toWorkspaceRelativePath(join(targetPath, entry.name), workingDirectory),
                type: entry.isDirectory() ? "directory" : "file",
            }));
        return {
            entries,
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
        };
    }

    if (toolName === "search_files") {
        const query = typeof args.query === "string" ? args.query.trim() : "";
        if (!query) {
            throw new Error("search_files requires a non-empty query.");
        }
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : ".",
            workingDirectory,
        );
        const limit =
            typeof args.limit === "number" && Number.isFinite(args.limit)
                ? Math.max(1, Math.min(100, Math.floor(args.limit)))
                : 40;
        return {
            matches: searchWorkspaceEntries(workingDirectory, targetPath, query, limit),
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
            query,
        };
    }

    if (toolName === "read_text_file") {
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : "",
            workingDirectory,
        );
        const content = readFileSync(targetPath, "utf8");
        return {
            content,
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
        };
    }

    if (toolName === "write_text_file") {
        if (!canWrite) {
            throw new Error("The current permission mode does not allow file edits.");
        }
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : "",
            workingDirectory,
        );
        const content = typeof args.content === "string" ? args.content : "";
        writeFileSync(targetPath, content, "utf8");
        return {
            bytesWritten: Buffer.byteLength(content, "utf8"),
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
            ok: true,
        };
    }

    if (toolName === "create_directory") {
        if (!canWrite) {
            throw new Error("The current permission mode does not allow directory creation.");
        }
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : "",
            workingDirectory,
        );
        mkdirSync(targetPath, { recursive: true });
        return {
            ok: true,
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
        };
    }

    if (toolName === "delete_entry") {
        if (!canWrite) {
            throw new Error("The current permission mode does not allow deletion.");
        }
        const targetPath = resolveWorkspacePath(
            typeof args.path === "string" ? args.path : "",
            workingDirectory,
        );
        if (targetPath === workingDirectory) {
            throw new Error("Refusing to delete the workspace root.");
        }
        const recursive = Boolean(args.recursive);
        rmSync(targetPath, { force: false, recursive });
        return {
            deleted: true,
            path: toWorkspaceRelativePath(targetPath, workingDirectory),
            recursive,
        };
    }

    if (toolName === "run_command") {
        const command = typeof args.command === "string" ? args.command.trim() : "";
        if (!command) {
            throw new Error("run_command requires a non-empty command.");
        }
        const timeoutMs =
            typeof args.timeoutMs === "number" && Number.isFinite(args.timeoutMs)
                ? Math.max(1000, Math.min(120000, Math.floor(args.timeoutMs)))
                : COMMAND_TIMEOUT_MS;
        return await executeWorkspaceProcess(
            integratedShellCommand(command),
            workingDirectory,
            timeoutMs,
        );
    }

    if (toolName === "run_python") {
        const code = typeof args.code === "string" ? args.code : "";
        if (!code.trim()) {
            throw new Error("run_python requires non-empty Python code.");
        }
        const timeoutMs =
            typeof args.timeoutMs === "number" && Number.isFinite(args.timeoutMs)
                ? Math.max(1000, Math.min(120000, Math.floor(args.timeoutMs)))
                : COMMAND_TIMEOUT_MS;
        return await executeWorkspaceProcess(
            process.platform === "win32"
                ? ["python", "-c", code]
                : ["python3", "-c", code],
            workingDirectory,
            timeoutMs,
            {
                PYTHONIOENCODING: "utf-8",
            },
        );
    }

    throw new Error(`Unsupported tool: ${toolName}`);
}

function openSystemPath(targetPath: string): void {
    const launchTarget = existsSync(targetPath)
        ? targetPath
        : existsSync(dirname(targetPath))
            ? dirname(targetPath)
            : targetPath;
    const commands =
        process.platform === "win32"
            ? [["cmd", "/c", "start", "", launchTarget]]
            : process.platform === "darwin"
              ? [["open", launchTarget]]
              : [["xdg-open", launchTarget]];

    for (const command of commands) {
        try {
            Bun.spawn({
                cmd: command,
                stderr: "ignore",
                stdout: "ignore",
            });
            return;
        } catch {
            // Ignore failed shell launches and try the next strategy.
        }
    }
}

type WorktreeInfo = {
    branch: string;
    current: boolean;
    locked: boolean;
    path: string;
    repoRoot: string;
    workspaceId: string;
    workspaceName: string;
};

function readGitStdout(cwd: string, args: string[]): string {
    const result = Bun.spawnSync({
        cmd: ["git", "-C", cwd, ...args],
        stderr: "pipe",
        stdout: "pipe",
    });
    if (!result.success) {
        return "";
    }
    return decoder.decode(result.stdout).trim();
}

function listWorktrees(): WorktreeInfo[] {
    const seen = new Set<string>();
    const worktrees: WorktreeInfo[] = [];

    for (const workspace of store.workspaces) {
        const repoRoot = readGitStdout(workspace.cwd, ["rev-parse", "--show-toplevel"]);
        if (!repoRoot) {
            continue;
        }
        const output = readGitStdout(repoRoot, ["worktree", "list", "--porcelain"]);
        if (!output) {
            continue;
        }

        for (const chunk of output.split(/\r?\n\r?\n/)) {
            if (!chunk.trim()) {
                continue;
            }
            const record = {
                branch: "",
                current: false,
                locked: false,
                path: "",
            };
            for (const line of chunk.split(/\r?\n/)) {
                if (line.startsWith("worktree ")) {
                    record.path = line.slice("worktree ".length).trim();
                } else if (line.startsWith("branch ")) {
                    record.branch = line.slice("branch ".length).replace("refs/heads/", "").trim();
                } else if (line === "locked") {
                    record.locked = true;
                }
            }
            if (!record.path || seen.has(record.path)) {
                continue;
            }
            seen.add(record.path);
            worktrees.push({
                ...record,
                current: resolve(record.path) === resolve(workspace.cwd),
                repoRoot,
                workspaceId: workspace.id,
                workspaceName: workspace.name,
            });
        }
    }

    return worktrees.sort((left, right) => left.path.localeCompare(right.path));
}

async function* readLines(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (line) {
                yield line;
            }
            newlineIndex = buffer.indexOf("\n");
        }
    }

    const tail = buffer.trim();
    if (tail) {
        yield tail;
    }
}

function extractAssistantText(content: unknown): string {
    if (!Array.isArray(content)) {
        return "";
    }
    return content
        .filter((block) => block && typeof block === "object" && (block as { type?: string }).type === "text")
        .map((block) => (block as { text?: string }).text ?? "")
        .join("");
}

function extractThinking(content: unknown): string {
    if (!Array.isArray(content)) {
        return "";
    }
    return content
        .filter((block) => block && typeof block === "object" && (block as { type?: string }).type === "thinking")
        .map((block) => (block as { thinking?: string }).thinking ?? "")
        .join("");
}

function buildCliArgs(thread: AppThread, prompt: string): string[] {
    const args = [
        "run",
        join(PROJECT_ROOT, "src", "entrypoints", "cli.tsx"),
        "-p",
        "--output-format",
        "stream-json",
        "--include-partial-messages",
        "--verbose",
    ];

    const model = effectiveThreadModel(thread);
    const permissionMode = thread.permissionMode || store.config.defaultPermissionMode;

    if (thread.sessionId) {
        args.push("--resume", thread.sessionId);
    }
    if (model) {
        args.push("--model", model);
    }
    if (permissionMode) {
        args.push("--permission-mode", permissionMode);
    }
    if (permissionMode === "bypassPermissions") {
        args.push("--dangerously-skip-permissions");
    }

    args.push(prompt);
    return args;
}

async function executeThreadRun(
    thread: AppThread,
    prompt: string,
    workingDirectory: string,
): Promise<void> {
    const profile = resolveThreadModelProfile(thread);
    if (isOpenAICompatibleProfile(profile)) {
        await executeOpenAICompatibleRun(thread, prompt, profile, workingDirectory);
        return;
    }

    let assistantText = "";
    let assistantThinking = "";
    const assistantStartedAt = nowIso();
    let finalDurationMs = 0;
    let finalCostUsd = 0;
    let finalUsage: unknown;
    let resultIsError = false;
    let resultText = "";
    let stderr = "";

    try {
        const subprocess = Bun.spawn({
            cmd: [resolveBunBinary(), ...buildCliArgs(thread, prompt)],
            cwd: workingDirectory,
            env: {
                ...process.env,
                ...threadRuntimeEnv(thread),
            },
            stderr: "pipe",
            stdout: "pipe",
        });

        const run = updateActiveRun(thread.id, (current) => {
            current.process = subprocess;
            current.state.status = "running";
        });
        if (run?.aborted) {
            subprocess.kill();
        }

        const stderrPromise = (async () => {
            for await (const line of readLines(subprocess.stderr)) {
                stderr += `${line}\n`;
            }
        })();

        for await (const line of readLines(subprocess.stdout)) {
            let parsed: Record<string, unknown>;
            try {
                parsed = JSON.parse(line) as Record<string, unknown>;
            } catch {
                continue;
            }

            if (
                parsed.type === "system" &&
                parsed.subtype === "init" &&
                typeof parsed.session_id === "string"
            ) {
                updateThread(thread.id, (current) => {
                    current.sessionId = parsed.session_id as string;
                });
                continue;
            }

            if (parsed.type === "assistant" && parsed.message) {
                const message = parsed.message as { content?: unknown };
                assistantText = assistantText || extractAssistantText(message.content);
                assistantThinking = assistantThinking || extractThinking(message.content);
                updateActiveRun(thread.id, (current) => {
                    current.state.assistantText = assistantText;
                    current.state.assistantThinking = assistantThinking;
                });
                continue;
            }

            if (parsed.type === "stream_event" && parsed.event) {
                const event = parsed.event as Record<string, unknown>;
                if (
                    event.type === "content_block_start" &&
                    event.content_block &&
                    typeof event.content_block === "object"
                ) {
                    const contentBlock = event.content_block as Record<string, unknown>;
                    if (contentBlock.type === "tool_use") {
                        updateActiveRun(thread.id, (current) => {
                            current.state.lastTool =
                                typeof contentBlock.name === "string"
                                    ? contentBlock.name
                                    : "tool_use";
                        });
                    }
                    continue;
                }

                if (
                    event.type === "content_block_delta" &&
                    event.delta &&
                    typeof event.delta === "object"
                ) {
                    const delta = event.delta as Record<string, unknown>;
                    if (delta.type === "text_delta" && typeof delta.text === "string") {
                        assistantText += delta.text;
                        updateActiveRun(thread.id, (current) => {
                            current.state.assistantText = assistantText;
                        });
                    }
                    if (
                        delta.type === "thinking_delta" &&
                        typeof delta.thinking === "string"
                    ) {
                        assistantThinking += delta.thinking;
                        updateActiveRun(thread.id, (current) => {
                            current.state.assistantThinking = assistantThinking;
                        });
                    }
                }
                continue;
            }

            if (parsed.type === "result") {
                resultIsError = Boolean(parsed.is_error);
                resultText =
                    typeof parsed.result === "string" ? parsed.result : assistantText;
                finalDurationMs =
                    typeof parsed.duration_ms === "number"
                        ? parsed.duration_ms
                        : 0;
                finalCostUsd =
                    typeof parsed.total_cost_usd === "number"
                        ? parsed.total_cost_usd
                        : 0;
                finalUsage = parsed.usage;
            }
        }

        await stderrPromise;
        await subprocess.exited;

        const wasAborted = activeRuns.get(thread.id)?.aborted ?? false;
        if (wasAborted) {
            resultIsError = true;
            resultText = resultText || assistantText || "Generation stopped.";
        }

        if (!resultText && stderr.trim()) {
            resultIsError = true;
            resultText = stderr.trim();
        }

        if (!assistantText && resultText) {
            assistantText = resultText;
        }

        const assistantMessage: AppMessage = {
            id: crypto.randomUUID(),
            role: resultIsError ? "system" : "assistant",
            text: resultText || assistantText || "No response returned.",
            thinking: assistantThinking || undefined,
            createdAt: assistantStartedAt,
            durationMs: finalDurationMs || undefined,
            isError: resultIsError,
            totalCostUsd: finalCostUsd || undefined,
            usage: finalUsage,
        };

        updateThread(thread.id, (current) => {
            current.status = resultIsError ? "error" : "idle";
            current.lastError = resultIsError ? assistantMessage.text : undefined;
            current.messages.push(assistantMessage);
        });

        updateActiveRun(thread.id, (current) => {
            current.state.assistantText = assistantMessage.text;
            current.state.assistantThinking = assistantThinking;
            current.state.error = resultIsError ? assistantMessage.text : undefined;
            current.state.status = resultIsError ? "error" : "completed";
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown run error";
        const errorMessage: AppMessage = {
            id: crypto.randomUUID(),
            role: "system",
            text: message,
            createdAt: assistantStartedAt,
            isError: true,
        };

        updateThread(thread.id, (current) => {
            current.status = "error";
            current.lastError = message;
            current.messages.push(errorMessage);
        });

        updateActiveRun(thread.id, (current) => {
            current.state.assistantText = assistantText;
            current.state.assistantThinking = assistantThinking;
            current.state.error = message;
            current.state.status = "error";
        });
    } finally {
        activeRuns.delete(thread.id);
    }
}

async function runThread(
    threadId: string,
    prompt: string,
    attachments: AppAttachment[] = [],
): Promise<Response> {
    const thread = getThread(threadId);
    if (!thread) {
        return notFound();
    }
    if (thread.archivedAt) {
        return badRequest("Restore the thread before running it.");
    }

    if (activeRuns.has(threadId)) {
        return json({ error: "This thread is already running." }, 409);
    }

    const workingDirectory = effectiveThreadWorkingDirectory(thread);
    if (!existsSync(workingDirectory)) {
        return badRequest(`Working directory does not exist: ${workingDirectory}`);
    }

    const promptWithAttachments = composeUserPrompt(prompt, attachments);
    const userMessage: AppMessage = {
        attachments: attachments.length ? attachments : undefined,
        id: crypto.randomUUID(),
        role: "user",
        displayText: prompt,
        text: promptWithAttachments,
        createdAt: nowIso(),
    };

    const updatedThread = updateThread(threadId, (current) => {
        current.title =
            current.messages.length === 0 && current.title === "New chat"
                ? deriveThreadTitle(prompt)
                : current.title;
        current.status = "running";
        current.archivedAt = undefined;
        current.lastError = undefined;
        current.messages.push(userMessage);
    });

    activeRuns.set(threadId, {
        aborted: false,
        state: {
            assistantText: "",
            assistantThinking: "",
            startedAt: nowIso(),
            status: "starting",
            updatedAt: nowIso(),
        },
    });

    void executeThreadRun(
        updatedThread,
        composeRuntimePrompt(updatedThread, promptWithAttachments),
        workingDirectory,
    );

    return json(
        {
            run: activeRunPayload(threadId),
            thread: updatedThread,
        },
        202,
    );
}

async function handleThreadCreate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const title =
        typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : "New chat";
    const workspace =
        (typeof body.workspaceId === "string" && getWorkspace(body.workspaceId)) ||
        defaultWorkspace();
    const thread = createThread(workspace.id, title);
    store.threads.unshift(thread);
    touchWorkspace(workspace.id, thread.updatedAt);
    sortThreads();
    saveStore();
    return json({ thread }, 201);
}

async function handleThreadCompact(threadId: string): Promise<Response> {
    const thread = getThread(threadId);
    if (!thread) {
        return notFound();
    }
    if (activeRuns.has(threadId)) {
        return json({ error: "Stop the current run before compacting context." }, 409);
    }

    const profile = resolveThreadModelProfile(thread);
    if (!profile || !isOpenAICompatibleProfile(profile)) {
        return badRequest(
            "Manual context compaction is currently available only for OpenAI-compatible model profiles.",
        );
    }

    const result = await compactOpenAIThreadContext(thread, profile, "manual");
    return json({
        compaction: result,
        thread: getThread(threadId),
    });
}

async function handleWorkspaceCreate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const cwd = resolveWorkingDirectory(
        typeof body.cwd === "string" ? body.cwd.trim() : store.config.workingDirectory,
    );

    if (!existsSync(cwd)) {
        return badRequest(`Working directory does not exist: ${cwd}`);
    }

    const existing = store.workspaces.find((workspace) => workspace.cwd === cwd);
    if (existing) {
        return json({ workspace: existing });
    }

    const workspace = createWorkspace(
        cwd,
        typeof body.name === "string" && body.name.trim()
            ? body.name.trim()
            : deriveWorkspaceName(cwd),
    );
    store.workspaces.unshift(workspace);
    sortWorkspaces();
    saveStore();
    return json({ workspace }, 201);
}

async function handleWorkspaceUpdate(
    request: Request,
    workspaceId: string,
): Promise<Response> {
    const body = await parseJsonBody(request);
    const workspace = getWorkspace(workspaceId);
    if (!workspace) {
        return notFound();
    }

    const nextCwd =
        typeof body.cwd === "string" && body.cwd.trim()
            ? body.cwd.trim()
            : workspace.cwd;

    if (!existsSync(nextCwd)) {
        return badRequest(`Working directory does not exist: ${nextCwd}`);
    }

    const duplicateWorkspace = store.workspaces.find(
        (item) => item.id !== workspaceId && item.cwd === nextCwd,
    );
    if (duplicateWorkspace) {
        return json(
            { error: "A workspace for that folder already exists." },
            409,
        );
    }

    const nextWorkspace = updateWorkspace(workspaceId, (current) => {
        current.name =
            typeof body.name === "string" && body.name.trim()
                ? body.name.trim()
                : current.name;
        current.cwd = nextCwd;
        if (typeof body.collapsed === "boolean") {
            current.collapsed = body.collapsed;
        }
    });

    return json({ workspace: nextWorkspace });
}

async function handleWorkspaceDelete(workspaceId: string): Promise<Response> {
    const index = store.workspaces.findIndex((workspace) => workspace.id === workspaceId);
    if (index === -1) {
        return notFound();
    }

    const workspace = store.workspaces[index];
    if (workspace.cwd === store.config.workingDirectory) {
        return json({ error: "Cannot delete the default workspace." }, 409);
    }

    const fallbackWorkspaceId = defaultWorkspace().id;

    const relatedThreads = store.threads.filter((thread) => thread.workspaceId === workspaceId);
    const runningThread = relatedThreads.find((thread) => activeRuns.has(thread.id));
    if (runningThread) {
        return json({ error: "Cannot delete a workspace with a running chat." }, 409);
    }

    store.workspaces.splice(index, 1);
    store.threads = store.threads.filter((thread) => thread.workspaceId !== workspaceId);
    store.automations = store.automations.map((automation) =>
        automation.workspaceId === workspaceId
            ? {
                  ...automation,
                  workspaceId: fallbackWorkspaceId,
                  updatedAt: nowIso(),
              }
            : automation,
    );
    sortWorkspaces();
    sortThreads();
    sortAutomations();
    saveStore();
    return json({ ok: true });
}

function handleAutomationsList(): Response {
    return json({ automations: store.automations });
}

async function handleAutomationCreate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const name = normalizeText(body.name, "");
    const prompt = normalizeText(body.prompt, "");
    if (!name) {
        return badRequest("Automation name is required.");
    }
    if (!prompt) {
        return badRequest("Automation prompt is required.");
    }

    const frequency = normalizeChoice<AppAutomationFrequency>(
        body.frequency,
        "daily",
        ["daily", "hourly", "weekly"],
    );
    const workspace = resolveAutomationWorkspace(
        typeof body.workspaceId === "string" ? body.workspaceId : undefined,
    );
    const modelProfileId =
        typeof body.modelProfileId === "string" && getModelProfile(body.modelProfileId)
            ? body.modelProfileId
            : undefined;
    const permissionMode =
        typeof body.permissionMode === "string" &&
        PERMISSION_MODES.has(body.permissionMode as PermissionMode)
            ? (body.permissionMode as PermissionMode)
            : undefined;

    const automation = createAutomation({
        category: normalizeText(body.category, "Status reports") || "Status reports",
        description: normalizeText(body.description, ""),
        enabled: normalizeBoolean(body.enabled, true),
        frequency,
        intervalHours: normalizeNumber(body.intervalHours, 24, 1, 168),
        modelProfileId,
        name,
        permissionMode,
        prompt,
        timeOfDay: normalizeTimeOfDay(body.timeOfDay, "09:00"),
        weekdays: normalizeAutomationWeekdays(body.weekdays),
        workspaceId: workspace.id,
    });

    store.automations.push(automation);
    sortAutomations();
    saveStore();
    return json({ automation }, 201);
}

async function handleAutomationUpdate(
    request: Request,
    automationId: string,
): Promise<Response> {
    const automation = getAutomation(automationId);
    if (!automation) {
        return notFound();
    }

    const body = await parseJsonBody(request);
    const frequency = Object.prototype.hasOwnProperty.call(body, "frequency")
        ? normalizeChoice<AppAutomationFrequency>(
              body.frequency,
              automation.frequency,
              ["daily", "hourly", "weekly"],
          )
        : automation.frequency;
    const nextWorkspace = Object.prototype.hasOwnProperty.call(body, "workspaceId")
        ? resolveAutomationWorkspace(
              typeof body.workspaceId === "string" ? body.workspaceId : undefined,
          )
        : resolveAutomationWorkspace(automation.workspaceId);
    const nextModelProfileId =
        body.modelProfileId === null || body.modelProfileId === ""
            ? undefined
            : typeof body.modelProfileId === "string" && getModelProfile(body.modelProfileId)
              ? body.modelProfileId
              : automation.modelProfileId;
    const nextPermissionMode =
        body.permissionMode === null || body.permissionMode === ""
            ? undefined
            : typeof body.permissionMode === "string" &&
                PERMISSION_MODES.has(body.permissionMode as PermissionMode)
              ? (body.permissionMode as PermissionMode)
              : automation.permissionMode;

    const scheduleChanged =
        Object.prototype.hasOwnProperty.call(body, "frequency") ||
        Object.prototype.hasOwnProperty.call(body, "intervalHours") ||
        Object.prototype.hasOwnProperty.call(body, "timeOfDay") ||
        Object.prototype.hasOwnProperty.call(body, "weekdays") ||
        Object.prototype.hasOwnProperty.call(body, "enabled");

    const nextAutomation = updateAutomation(automationId, (current) => {
        if (typeof body.name === "string") {
            const trimmed = body.name.trim();
            if (trimmed) {
                current.name = trimmed;
            }
        }
        if (typeof body.description === "string") {
            current.description = body.description.trim();
        }
        if (typeof body.prompt === "string") {
            const trimmedPrompt = body.prompt.trim();
            if (trimmedPrompt) {
                current.prompt = trimmedPrompt;
            }
        }
        if (typeof body.category === "string" && body.category.trim()) {
            current.category = body.category.trim();
        }
        current.workspaceId = nextWorkspace.id;
        current.modelProfileId = nextModelProfileId;
        current.permissionMode = nextPermissionMode;
        current.frequency = frequency;
        current.enabled = normalizeBoolean(body.enabled, current.enabled);
        current.intervalHours = normalizeNumber(
            body.intervalHours,
            current.intervalHours,
            1,
            168,
        );
        current.timeOfDay = normalizeTimeOfDay(body.timeOfDay, current.timeOfDay);
        current.weekdays = normalizeAutomationWeekdays(
            Object.prototype.hasOwnProperty.call(body, "weekdays")
                ? body.weekdays
                : current.weekdays,
        );
        if (scheduleChanged || !current.nextRunAt) {
            current.nextRunAt = computeAutomationNextRun(current);
        }
    });

    return json({ automation: nextAutomation });
}

async function handleAutomationDelete(automationId: string): Promise<Response> {
    const index = store.automations.findIndex((automation) => automation.id === automationId);
    if (index === -1) {
        return notFound();
    }
    if (activeAutomationRuns.has(automationId)) {
        return json({ error: "Cannot delete a running automation." }, 409);
    }
    store.automations.splice(index, 1);
    sortAutomations();
    saveStore();
    return json({ ok: true });
}

async function handleAutomationRunNow(automationId: string): Promise<Response> {
    try {
        const result = await executeAutomationRun(automationId);
        return json(result, 202);
    } catch (error) {
        return json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to start the automation.",
            },
            400,
        );
    }
}

async function handleConfigUpdate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const previousWorkingDirectory = store.config.workingDirectory;
    const nextConfig = normalizeConfig(
        body as Partial<AppConfig>,
        store.config,
    );

    if (!existsSync(nextConfig.workingDirectory)) {
        return badRequest(
            `Working directory does not exist: ${nextConfig.workingDirectory}`,
        );
    }

    if (!PERMISSION_MODES.has(nextConfig.defaultPermissionMode)) {
        return badRequest("Unsupported permission mode.");
    }

    store.config = nextConfig;

    if (previousWorkingDirectory !== store.config.workingDirectory) {
        const unusedDefaultWorkspace = store.workspaces.find(
            (workspace) =>
                workspace.cwd === previousWorkingDirectory &&
                workspace.name === "Default Workspace" &&
                !store.threads.some((thread) => thread.workspaceId === workspace.id),
        );
        if (unusedDefaultWorkspace) {
            unusedDefaultWorkspace.cwd = store.config.workingDirectory;
            unusedDefaultWorkspace.updatedAt = nowIso();
            sortWorkspaces();
        } else {
            defaultWorkspace();
        }
    }

    saveStore();
    return json({ config: publicConfig(store.config) });
}

async function handleThreadUpdate(
    request: Request,
    threadId: string,
): Promise<Response> {
    const body = await parseJsonBody(request);
    const thread = getThread(threadId);
    if (!thread) {
        return notFound();
    }

    const nextPermissionMode =
        typeof body.permissionMode === "string" &&
        PERMISSION_MODES.has(body.permissionMode as PermissionMode)
            ? (body.permissionMode as PermissionMode)
            : thread.permissionMode;
    const nextWorkspace =
        typeof body.workspaceId === "string" && getWorkspace(body.workspaceId)
            ? getWorkspace(body.workspaceId)!
            : getWorkspace(thread.workspaceId) || defaultWorkspace();
    const nextArchivedAt =
        typeof body.archived === "boolean"
            ? (body.archived ? thread.archivedAt || nowIso() : undefined)
            : thread.archivedAt;
    const nextModelProfileId =
        body.modelProfileId === null || body.modelProfileId === ""
            ? undefined
            : typeof body.modelProfileId === "string" &&
                getModelProfile(body.modelProfileId)
              ? body.modelProfileId
              : thread.modelProfileId;
    const nextProfile =
        getModelProfile(nextModelProfileId) ||
        getModelProfile(store.config.defaultModelProfileId);
    const nextModel = normalizedThreadModelForProfile(
        typeof body.model === "string" ? body.model.trim() : thread.model,
        nextProfile,
        store.config,
    );

    let nextCwd = thread.cwd;
    if (body.cwd === null || body.cwd === "") {
        nextCwd = undefined;
    } else if (typeof body.cwd === "string" && body.cwd.trim()) {
        nextCwd = body.cwd.trim();
    }

    if (nextCwd && !existsSync(nextCwd)) {
        return badRequest(`Working directory does not exist: ${nextCwd}`);
    }
    if (nextArchivedAt && activeRuns.has(threadId)) {
        return json({ error: "Cannot archive a running thread." }, 409);
    }

    const nextThread = updateThread(threadId, (current) => {
        current.title =
            typeof body.title === "string" && body.title.trim()
                ? body.title.trim()
                : current.title;
        if (
            current.model !== nextModel ||
            current.modelProfileId !== nextModelProfileId
        ) {
            current.sessionId = undefined;
        }
        current.model = nextModel;
        current.modelProfileId = nextModelProfileId;
        current.permissionMode = nextPermissionMode;
        current.workspaceId = nextWorkspace.id;
        current.cwd = nextCwd;
        current.archivedAt = nextArchivedAt;
    });

    return json({ thread: nextThread });
}

async function handlePickDirectory(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const initialPath =
        typeof body.initialPath === "string" && body.initialPath.trim()
            ? body.initialPath.trim()
            : store.config.workingDirectory;

    try {
        const path = await pickDirectory(initialPath);
        return json({
            canceled: !path,
            path,
        });
    } catch (error) {
        return json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to open the native directory picker.",
            },
            500,
        );
    }
}

async function handlePickFiles(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const initialPath =
        typeof body.initialPath === "string" && body.initialPath.trim()
            ? body.initialPath.trim()
            : store.config.workingDirectory;

    try {
        const files = await pickFiles(initialPath);
        const attachments = files
            .filter((filePath) => existsSync(filePath))
            .map((filePath) => readAttachment(filePath));
        return json({
            attachments,
            canceled: attachments.length === 0,
        });
    } catch (error) {
        return json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to open the native file picker.",
            },
            500,
        );
    }
}

async function handleOpenPath(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const rawPath =
        typeof body.path === "string" && body.path.trim() ? body.path.trim() : "";
    if (!rawPath) {
        return badRequest("Path is required.");
    }

    const targetPath = existsSync(rawPath)
        ? rawPath
        : existsSync(dirname(rawPath))
            ? dirname(rawPath)
            : rawPath;
    openSystemPath(targetPath);
    return json({ ok: true, path: targetPath });
}

function handleConfigImportList(): Response {
    return json({ sources: listImportableConfigs() });
}

async function handleConfigImport(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const sourceId =
        typeof body.sourceId === "string" && body.sourceId.trim()
            ? body.sourceId.trim()
            : "";
    if (!sourceId) {
        return badRequest("Config source is required.");
    }
    const imported = importExternalConfig(sourceId);
    if (!imported) {
        return badRequest("The selected config could not be imported.");
    }

    store.config = normalizeConfig(imported, store.config);
    saveStore();
    return json({ config: publicConfig(store.config) });
}

function handleLibraryCatalog(): Response {
    return json(buildLibraryCatalog());
}

async function handleSkillCreate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const name = normalizeText(body.name, "New Skill") || "New Skill";
    const slug = slugifyLibraryName(
        normalizeText(body.slug) || name,
        `skill-${Date.now()}`,
    );
    const description =
        normalizeText(body.description, "Local skill created from Glaude Vibe Coder.") ||
        "Local skill created from Glaude Vibe Coder.";
    return createSkillScaffold(name, slug, description);
}

async function handlePluginCreate(request: Request): Promise<Response> {
    const body = await parseJsonBody(request);
    const name = normalizeText(body.name, "New Plugin") || "New Plugin";
    const slug = slugifyLibraryName(
        normalizeText(body.slug) || name,
        `plugin-${Date.now()}`,
    );
    const description =
        normalizeText(body.description, "Local plugin created from Glaude Vibe Coder.") ||
        "Local plugin created from Glaude Vibe Coder.";
    return createPluginScaffold(name, slug, description);
}

function handleWorktrees(): Response {
    return json({ items: listWorktrees() });
}

async function handleThreadDelete(threadId: string): Promise<Response> {
    const index = store.threads.findIndex((thread) => thread.id === threadId);
    if (index === -1) {
        return notFound();
    }

    if (activeRuns.has(threadId)) {
        return json({ error: "Cannot delete a running thread." }, 409);
    }

    store.threads.splice(index, 1);
    sortThreads();
    saveStore();
    return json({ ok: true });
}

async function handleLiveRun(threadId: string): Promise<Response> {
    const thread = getThread(threadId);
    if (!thread) {
        return notFound();
    }

    return json({
        active: activeRuns.has(threadId),
        run: activeRunPayload(threadId),
        thread,
    });
}

async function handleAbort(threadId: string): Promise<Response> {
    const run = activeRuns.get(threadId);
    if (!run) {
        return json({ ok: false, error: "No active run for this thread." }, 404);
    }
    run.aborted = true;
    run.abortController?.abort();
    run.process?.kill();
    return json({ ok: true });
}

async function runDueAutomations(): Promise<void> {
    const now = new Date();
    const dueAutomations = store.automations.filter((automation) => {
        if (!automation.enabled || activeAutomationRuns.has(automation.id)) {
            return false;
        }
        if (!normalizeText(automation.prompt)) {
            return false;
        }
        if (!automation.nextRunAt) {
            return true;
        }
        const nextRunTime = new Date(automation.nextRunAt).getTime();
        return Number.isFinite(nextRunTime) && nextRunTime <= now.getTime();
    });

    for (const automation of dueAutomations) {
        try {
            if (!automation.nextRunAt) {
                updateAutomation(automation.id, (current) => {
                    current.nextRunAt = computeAutomationNextRun(current, now);
                });
                continue;
            }
            await executeAutomationRun(automation.id);
        } catch (error) {
            console.error(
                `[automation] ${automation.name}: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }
}

function serveStatic(pathname: string): Response {
    const safePath = pathname === "/" ? "/index.html" : pathname;
    const filePath = resolve(WEB_ROOT, `.${safePath}`);
    if (!filePath.startsWith(WEB_ROOT) || !existsSync(filePath)) {
        return notFound();
    }
    const contentType =
        MIME_TYPES[extname(filePath).toLowerCase()] ??
        "application/octet-stream";
    return new Response(Bun.file(filePath), {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        },
    });
}

async function router(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/api/bootstrap" && request.method === "GET") {
        return json(publicStore());
    }

    if (pathname === "/api/config" && request.method === "POST") {
        return handleConfigUpdate(request);
    }

    if (pathname === "/api/config/importable" && request.method === "GET") {
        return handleConfigImportList();
    }

    if (pathname === "/api/config/import" && request.method === "POST") {
        return handleConfigImport(request);
    }

    if (pathname === "/api/library/catalog" && request.method === "GET") {
        return handleLibraryCatalog();
    }

    if (pathname === "/api/library/skills" && request.method === "POST") {
        return handleSkillCreate(request);
    }

    if (pathname === "/api/library/plugins" && request.method === "POST") {
        return handlePluginCreate(request);
    }

    if (pathname === "/api/system/pick-directory" && request.method === "POST") {
        return handlePickDirectory(request);
    }

    if (pathname === "/api/system/pick-files" && request.method === "POST") {
        return handlePickFiles(request);
    }

    if (pathname === "/api/system/open-path" && request.method === "POST") {
        return handleOpenPath(request);
    }

    if (pathname === "/api/worktrees" && request.method === "GET") {
        return handleWorktrees();
    }

    if (pathname === "/api/workspaces" && request.method === "GET") {
        return json({ workspaces: store.workspaces });
    }

    if (pathname === "/api/workspaces" && request.method === "POST") {
        return handleWorkspaceCreate(request);
    }

    if (pathname === "/api/automations" && request.method === "GET") {
        return handleAutomationsList();
    }

    if (pathname === "/api/automations" && request.method === "POST") {
        return handleAutomationCreate(request);
    }

    if (pathname === "/api/threads" && request.method === "POST") {
        return handleThreadCreate(request);
    }

    if (pathname === "/api/threads" && request.method === "GET") {
        return json({ threads: store.threads });
    }

    const threadRunMatch = pathname.match(/^\/api\/threads\/([^/]+)\/run$/);
    if (threadRunMatch && request.method === "POST") {
        const threadId = decodeURIComponent(threadRunMatch[1]);
        const body = await parseJsonBody(request);
        const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
        if (!prompt) {
            return badRequest("Prompt is required.");
        }
        return runThread(threadId, prompt, normalizeAttachmentsInput(body.attachments));
    }

    const threadCompactMatch = pathname.match(/^\/api\/threads\/([^/]+)\/compact$/);
    if (threadCompactMatch && request.method === "POST") {
        return handleThreadCompact(decodeURIComponent(threadCompactMatch[1]));
    }

    const threadLiveMatch = pathname.match(/^\/api\/threads\/([^/]+)\/live$/);
    if (threadLiveMatch && request.method === "GET") {
        return handleLiveRun(decodeURIComponent(threadLiveMatch[1]));
    }

    const threadAbortMatch = pathname.match(/^\/api\/threads\/([^/]+)\/abort$/);
    if (threadAbortMatch && request.method === "POST") {
        return handleAbort(decodeURIComponent(threadAbortMatch[1]));
    }

    const threadMatch = pathname.match(/^\/api\/threads\/([^/]+)$/);
    if (threadMatch) {
        const threadId = decodeURIComponent(threadMatch[1]);
        if (request.method === "GET") {
            const thread = getThread(threadId);
            return thread ? json({ thread }) : notFound();
        }
        if (request.method === "PATCH") {
            return handleThreadUpdate(request, threadId);
        }
        if (request.method === "DELETE") {
            return handleThreadDelete(threadId);
        }
    }

    const workspaceMatch = pathname.match(/^\/api\/workspaces\/([^/]+)$/);
    if (workspaceMatch) {
        const workspaceId = decodeURIComponent(workspaceMatch[1]);
        if (request.method === "PATCH") {
            return handleWorkspaceUpdate(request, workspaceId);
        }
        if (request.method === "DELETE") {
            return handleWorkspaceDelete(workspaceId);
        }
    }

    const automationRunMatch = pathname.match(/^\/api\/automations\/([^/]+)\/run$/);
    if (automationRunMatch && request.method === "POST") {
        return handleAutomationRunNow(decodeURIComponent(automationRunMatch[1]));
    }

    const automationMatch = pathname.match(/^\/api\/automations\/([^/]+)$/);
    if (automationMatch) {
        const automationId = decodeURIComponent(automationMatch[1]);
        if (request.method === "PATCH") {
            return handleAutomationUpdate(request, automationId);
        }
        if (request.method === "DELETE") {
            return handleAutomationDelete(automationId);
        }
    }

    if (pathname === "/" || pathname.startsWith("/assets/") || pathname.endsWith(".js") || pathname.endsWith(".css")) {
        return serveStatic(pathname);
    }

    return serveStatic("/");
}

function shouldOpenBrowser(): boolean {
    return !process.argv.includes("--no-open") && process.env.CLAUDE_JS_APP_NO_OPEN !== "1" && store.config.autoOpenBrowser;
}

function openBrowser(url: string): void {
    const commands =
        process.platform === "win32"
            ? [["cmd", "/c", "start", "", url]]
            : process.platform === "darwin"
              ? [["open", url]]
              : [["xdg-open", url]];

    for (const command of commands) {
        try {
            Bun.spawn({
                cmd: command,
                stderr: "ignore",
                stdout: "ignore",
            });
            return;
        } catch {
            // Ignore browser open failures.
        }
    }
}

const port =
    Number(process.env.CLAUDE_JS_APP_PORT ?? 0) ||
    Number(process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] ?? 0) ||
    store.config.port;

store.config.port = port;
saveStore();

const server = Bun.serve({
    fetch: router,
    port,
});

const appUrl = `http://127.0.0.1:${server.port}`;
console.log(`${APP_NAME} running at ${appUrl}`);

if (shouldOpenBrowser()) {
    setTimeout(() => openBrowser(appUrl), 350);
}

setTimeout(() => {
    void runDueAutomations();
}, 1500);

setInterval(() => {
    void runDueAutomations();
}, 30_000);
