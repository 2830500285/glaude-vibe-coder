# Claude JS App Quickstart

## What changed

The project now includes a local GUI wrapper around the existing CLI runtime.

End users can work from a browser-based app instead of typing commands into a terminal.

## Start options

### Recommended for normal users

Double-click:

- `launch-app.vbs`

This starts the local app and opens the browser without keeping a terminal window in front.

### Recommended for debugging

Run:

```bash
bun run app
```

Or double-click:

- `launch-app.bat`

This keeps the console visible so startup errors are easier to inspect.

## Default URL

The app opens at:

```text
http://127.0.0.1:43120/
```

## Features in the app

- thread sidebar
- streaming chat view
- per-thread model and permission mode
- settings page for API key, working directory, and defaults
- local thread persistence in `.claude-app/store.json`

## Notes

- The core agent runtime is still the existing Claude JS engine.
- The GUI talks to that runtime through `stream-json`, so feature behavior stays close to the current CLI.
- If you already export `ANTHROPIC_API_KEY`, you can leave the API key field empty.
