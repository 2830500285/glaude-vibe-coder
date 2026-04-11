# App Wrapper Design

## Goal

Turn the existing terminal-first Claude JS project into a local app that is easier for non-technical users to operate.

The app should:

- feel closer to a desktop chat product than a terminal tool
- preserve the current agent runtime instead of rewriting it
- support persistent threads
- expose the most important settings in a GUI
- reduce setup friction to a single startup command or double-click launcher

## Chosen Approach

Build a local browser app backed by a Bun server.

Why this approach:

- the existing CLI already exposes a stable machine interface through `--print --output-format stream-json`
- it avoids rewriting the core conversation loop, tools, session handling, and model integration
- it keeps the new surface area small enough to implement and verify inside the current repo
- it can later be wrapped by Electron or Tauri without discarding the UI or backend code

Rejected alternatives:

- porting the Ink UI to React DOM directly: too much surface area and too much terminal-specific behavior
- building a native desktop shell first: more packaging complexity before the core app flow is proven
- reimplementing the agent loop over SDK calls: high risk of feature drift and regressions

## Architecture

The new app has three layers:

1. Local app server
   - serves static HTML/CSS/JS
   - stores threads and settings in `.claude-app/`
   - spawns the existing CLI as a subprocess per user turn
   - parses the CLI `stream-json` output into simpler UI events

2. Web UI
   - left sidebar for threads
   - main chat panel for messages and streaming responses
   - settings view for working directory, model, permission mode, and API key

3. Existing CLI runtime
   - continues to handle prompts, tools, permissions, MCP, and session persistence
   - is called with `--resume <session_id>` once a thread has an established session

## Data Model

The app stores:

- config
  - working directory
  - default model
  - default permission mode
  - API key
  - auto-open preference
- threads
  - id
  - title
  - session id
  - timestamps
  - message history
  - last run metadata

Messages are stored in an app-friendly format with:

- role
- text
- optional thinking text
- timing and cost metadata
- error state when applicable

## Interaction Flow

For each send action:

1. UI posts a prompt to the app server
2. server appends the user message locally
3. server spawns the CLI in print mode with `stream-json`
4. server streams normalized events back to the browser
5. browser renders partial assistant output as it arrives
6. server persists the final assistant message and updated thread metadata

For follow-up turns, the server reuses the CLI session with `--resume`.

## Error Handling

The app should surface:

- CLI startup failures
- missing or invalid API key
- permission-mode rejections
- subprocess cancellation
- malformed stream output

Errors are rendered as chat-system notices inside the active thread instead of being hidden in terminal logs.

## Visual Direction

The UI should echo the structure of Codex without cloning it literally:

- soft light workspace
- dense but calm thread sidebar
- large central reading column
- utility footer controls for model and run mode
- settings page that feels like an application preferences screen

The look should feel deliberate and desktop-grade, not like a generic admin dashboard.

## Implementation Scope

This iteration will ship:

- local app server
- browser UI
- persistent threads
- settings UI
- stream rendering
- launcher scripts

This iteration will not ship:

- Electron packaging
- deep tool activity timeline parity
- full transcript import from old CLI sessions
- native OS notifications

## Verification

Minimum verification:

- app server starts successfully
- bootstrap endpoint returns config and threads
- a new thread can be created
- a prompt can be sent and streamed
- follow-up prompts reuse the same session
- launcher script starts the app entrypoint
