import { execFileSync } from "child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const stageRoot = join(projectRoot, "dist", "desktop-runtime");
const runtimeRoot = join(stageRoot, "app-bundle");
const binRoot = join(stageRoot, "bin");
const bunBinaryName = process.platform === "win32" ? "bun.exe" : "bun";

const DIRECTORIES_TO_COPY = ["app", "node_modules", "packages", "scripts", "src"];
const FILES_TO_COPY = ["bun.lock", "bunfig.toml", "package.json", "tsconfig.json"];

function locateBundledBun() {
    const envCandidates = [
        process.env.GLAUDE_DESKTOP_BUN,
        process.env.BUN_EXE,
        process.execPath.toLowerCase().includes("bun") ? process.execPath : "",
        join(homedir(), ".bun", "bin", bunBinaryName),
    ].filter(Boolean);

    for (const candidate of envCandidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }

    const locator = process.platform === "win32" ? "where" : "which";
    const output = execFileSync(locator, ["bun"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
    })
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    for (const candidate of output) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }

    throw new Error(
        "Bun runtime was not found. Install Bun or set GLAUDE_DESKTOP_BUN before building the desktop installer.",
    );
}

function prepareStageDirectory() {
    rmSync(stageRoot, { force: true, recursive: true });
    mkdirSync(runtimeRoot, { recursive: true });
    mkdirSync(binRoot, { recursive: true });
}

function copyDirectory(source, destination) {
    if (process.platform === "win32") {
        mkdirSync(destination, { recursive: true });
        try {
            execFileSync(
                "robocopy",
                [
                    source,
                    destination,
                    "/E",
                    "/NFL",
                    "/NDL",
                    "/NJH",
                    "/NJS",
                    "/NC",
                    "/NS",
                    "/NP",
                ],
                {
                    cwd: projectRoot,
                    stdio: ["ignore", "pipe", "pipe"],
                },
            );
            return;
        } catch (error) {
            if (
                error &&
                typeof error === "object" &&
                "status" in error &&
                typeof error.status === "number" &&
                error.status <= 7
            ) {
                return;
            }
            throw error;
        }
    }

    cpSync(source, destination, { recursive: true });
}

function copyRuntimeFiles() {
    for (const directory of DIRECTORIES_TO_COPY) {
        copyDirectory(join(projectRoot, directory), join(runtimeRoot, directory));
    }

    for (const file of FILES_TO_COPY) {
        copyFileSync(join(projectRoot, file), join(runtimeRoot, file));
    }
}

function copyBundledBun() {
    const source = locateBundledBun();
    const destination = join(binRoot, bunBinaryName);
    copyFileSync(source, destination);
}

function main() {
    prepareStageDirectory();
    copyRuntimeFiles();
    copyBundledBun();
    console.log(`Desktop runtime staged at ${stageRoot}`);
}

try {
    main();
} catch (error) {
    console.error(error);
    process.exit(1);
}
