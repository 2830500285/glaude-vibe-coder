import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import net from "net";
import { app, BrowserWindow, dialog, shell } from "electron";

const APP_NAME = "Glaude Vibe Coder";
const DEFAULT_PORT = 43120;
const SERVER_READY_TIMEOUT_MS = 45_000;
const SERVER_POLL_INTERVAL_MS = 300;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow = null;
let serverProcess = null;
let serverBaseUrl = "";
let recentServerLogs = "";

app.setName(APP_NAME);
app.setAppUserModelId("com.sdust.glaudevibecoder");

function getRepoRoot() {
    return resolve(__dirname, "..");
}

function getResourceRoot() {
    return app.isPackaged
        ? join(process.resourcesPath, "desktop-runtime")
        : join(getRepoRoot(), "dist", "desktop-runtime");
}

function bunExecutableName() {
    return process.platform === "win32" ? "bun.exe" : "bun";
}

function locateDevBunExecutable() {
    const candidates = [
        process.env.GLAUDE_DESKTOP_BUN,
        process.env.BUN_EXE,
        process.execPath.toLowerCase().includes("bun") ? process.execPath : "",
        join(homedir(), ".bun", "bin", bunExecutableName()),
    ].filter(Boolean);

    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }

    throw new Error(
        "Bundled Bun runtime was not found. Set GLAUDE_DESKTOP_BUN or install Bun before starting the desktop shell.",
    );
}

function resolveRuntimePaths() {
    if (app.isPackaged) {
        const resourceRoot = getResourceRoot();
        return {
            appRoot: join(resourceRoot, "app-bundle"),
            bunExecutable: join(resourceRoot, "bin", bunExecutableName()),
        };
    }

    return {
        appRoot: getRepoRoot(),
        bunExecutable: locateDevBunExecutable(),
    };
}

function findAvailablePort(startPort = DEFAULT_PORT, attempts = 30) {
    let currentPort = startPort;

    const tryPort = (port) =>
        new Promise((resolvePort) => {
            const probe = net.createServer();
            probe.unref();
            probe.once("error", () => resolvePort(false));
            probe.listen(port, "127.0.0.1", () => {
                probe.close(() => resolvePort(true));
            });
        });

    return (async () => {
        for (let index = 0; index < attempts; index += 1) {
            if (await tryPort(currentPort)) {
                return currentPort;
            }
            currentPort += 1;
        }
        throw new Error("No free local port was available for the desktop app.");
    })();
}

function appendServerLogs(chunk) {
    const text = chunk.toString("utf8").trim();
    if (!text) {
        return;
    }
    recentServerLogs = `${recentServerLogs}\n${text}`.trim();
    if (recentServerLogs.length > 6000) {
        recentServerLogs = recentServerLogs.slice(-6000);
    }
}

async function waitForServer(baseUrl) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < SERVER_READY_TIMEOUT_MS) {
        if (serverProcess?.exitCode != null) {
            break;
        }

        try {
            const response = await fetch(`${baseUrl}/api/bootstrap`, {
                method: "GET",
            });
            if (response.ok) {
                return;
            }
        } catch {
            // Server is still starting.
        }

        await new Promise((resolveDelay) =>
            setTimeout(resolveDelay, SERVER_POLL_INTERVAL_MS),
        );
    }

    const extra = recentServerLogs ? `\n\nRecent logs:\n${recentServerLogs}` : "";
    throw new Error(`Desktop server did not become ready in time.${extra}`);
}

async function startServer() {
    const runtime = resolveRuntimePaths();
    if (!existsSync(runtime.appRoot)) {
        throw new Error(`App bundle was not found at ${runtime.appRoot}`);
    }
    if (!existsSync(runtime.bunExecutable)) {
        throw new Error(`Bun runtime was not found at ${runtime.bunExecutable}`);
    }

    const port = await findAvailablePort();
    const dataDir = join(app.getPath("userData"), "data");
    const defaultWorkdir = app.getPath("home") || homedir();

    mkdirSync(dataDir, { recursive: true });

    serverBaseUrl = `http://127.0.0.1:${port}`;
    recentServerLogs = "";
    serverProcess = spawn(runtime.bunExecutable, ["run", "app/server.ts"], {
        cwd: runtime.appRoot,
        env: {
            ...process.env,
            CLAUDE_JS_APP_NO_OPEN: "1",
            CLAUDE_JS_APP_PORT: String(port),
            GLAUDE_APP_DATA_DIR: dataDir,
            GLAUDE_APP_ROOT: runtime.appRoot,
            GLAUDE_DEFAULT_WORKDIR: defaultWorkdir,
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
    });

    serverProcess.stdout?.on("data", appendServerLogs);
    serverProcess.stderr?.on("data", appendServerLogs);
    serverProcess.once("exit", (code, signal) => {
        if (!app.isQuitting) {
            const detail = recentServerLogs || `exit code ${code ?? "unknown"}, signal ${signal ?? "none"}`;
            dialog.showErrorBox(
                APP_NAME,
                `The local service stopped unexpectedly.\n\n${detail}`,
            );
            app.quit();
        }
    });

    await waitForServer(serverBaseUrl);
}

async function createMainWindow() {
    mainWindow = new BrowserWindow({
        backgroundColor: "#f4f2ed",
        minHeight: 760,
        minWidth: 1180,
        show: false,
        title: APP_NAME,
        width: 1480,
        height: 920,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    await mainWindow.loadURL(serverBaseUrl);
    mainWindow.once("ready-to-show", () => {
        mainWindow?.show();
    });
}

function stopServer() {
    if (!serverProcess || serverProcess.exitCode != null) {
        return;
    }
    app.isQuitting = true;
    serverProcess.kill();
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (!mainWindow) {
            return;
        }
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    });

    app.on("window-all-closed", () => {
        stopServer();
        app.quit();
    });

    app.on("before-quit", () => {
        app.isQuitting = true;
        stopServer();
    });

    app.whenReady()
        .then(async () => {
            await startServer();
            await createMainWindow();
        })
        .catch((error) => {
            dialog.showErrorBox(
                APP_NAME,
                error instanceof Error ? error.message : String(error),
            );
            stopServer();
            app.quit();
        });
}
