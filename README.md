# md-file-linker

VS Code extension for referencing files and directories from markdown files.

## Problem

When working with multiple AI coding tools (Claude Code, GitHub Copilot, Codex...), each has its own syntax for attaching files as context (`@file` for Claude/Codex, `#file` for Copilot). Writing prompts directly in those tools means they aren't versioned, reusable, or tool-agnostic.

The solution is to write prompts as `.md` files in the repository — but then you lose the ability to quickly reference other files. Manually doing Cmd+P → find file → copy relative path → paste becomes very tedious when referencing multiple files.

## Solution

An autocomplete provider that triggers on `@` inside `.md` files, lets you search files and directories with the native VS Code picker experience, and inserts a standard markdown link on selection.

```md
<!-- Type @ and search for a file -->
[package.json](/package.json)
[src/auth](/src/auth)
```

The output is plain markdown — no tool-specific syntax, no lock-in.

## Design decisions

- **Trigger character is `@`** — consistent with how most AI tools reference files, familiar to developers.
- **Output is a markdown link** — `[name](/path)` is standard, renders correctly in any viewer, and can be adapted to any tool's syntax with a simple find/replace.
- **Lists both files and directories** — prompts often need to reference a whole folder as context, not just individual files.
- **Activates only in markdown files** — avoids interfering with other languages or extensions.
- **No config required** — works out of the box with sensible excludes (`node_modules`, `.git`, `dist`, `out`, `.next`).

## Known conflicts

The GitHub Pull Requests extension also listens for `@` in markdown to suggest team member mentions. Disable it for markdown in VS Code settings:

```json
"githubIssues.ignoreUserCompletionTrigger": ["markdown"]
```

## Development

```bash
npm install
npx tsc -p ./        # compile
npx vsce package     # build .vsix
code --install-extension md-file-linker-0.0.1.vsix
```