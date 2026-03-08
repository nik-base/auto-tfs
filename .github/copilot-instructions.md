# GitHub Copilot instructions — Auto TFS

Purpose
- Help AI coding agents become productive quickly in this VS Code extension repository.

Big picture (what to know first)
- This is a VS Code extension that integrates with Microsoft TFS via the `tf` CLI. The extension bootstraps from `src/extension.ts` and wires small layers: `ProcessExecutor` -> `TFSCommandExecutor` -> `TFSService` -> `AutoTFSService` (business logic).
- SCM/UI surfaces are implemented under `src/scm/*` and `src/status-bar/*`. CLI output parsing lives in `src/tfs/parser/tfs-command-output-parser.ts`.

Key files and entry points (examples)
- Extension boot: [src/extension.ts](src/extension.ts#L1-L40) — registers commands and services.
- Configuration: [src/core/autotfs-configuration.ts](src/core/autotfs-configuration.ts#L1-L80) — exposes workspace settings like `auto-tfs.tf.path`, `auto-tfs.tf.language`, `auto-tfs.tfs.debug`.
- CLI surface and parsing: [src/tfs/tfs-service.ts](src/tfs/tfs-service.ts) and [src/tfs/parser/tfs-command-output-parser.ts](src/tfs/parser/tfs-command-output-parser.ts#L1-L80).
- Business logic: [src/tfs/auto-tfs.service.ts](src/tfs/auto-tfs.service.ts#L1-L40) — orchestrates confirmation UI and calls into `TFSService` then triggers sync/UI updates.
- SCM provider: [src/scm/auto-tfs-scm.ts](src/scm/auto-tfs-scm.ts#L1-L40) — provides included/excluded change lists and badges.

Developer workflows (how to build, run, debug)
- Build: `pnpm run compile` (or `pnpm run watch` for incremental builds). The compiled output lands in `out/` and the extension's `main` points to `./out/extension.js`.
- Type-check: `pnpm run type-check`.
- Lint: `pnpm run lint` and `pnpm run lint:fix`.
- Debugging in VS Code: run the extension host after compiling. Enable `auto-tfs.tfs.debug` in workspace settings to make the extension print CLI output to the `Auto TFS` output channel (see `src/core/autotfs-output-channel.ts`).

Project-specific patterns and conventions
- Layered CLI wrappers: avoid placing parsing or UI logic into `TFSCommandExecutor` — that class only translates args and invokes `ProcessExecutor`. Parsing is centralized in `tfs-command-output-parser`.
- Confirmation and prompts: business methods in `AutoTFSService` call `AutoTFSNotification` before mutating operations — keep UI prompts there.
- Configuration is cached: use `AutoTFSConfiguration.refresh()` after workspace config changes; prefer reading configuration through the static getters on `AutoTFSConfiguration`.
- SCM state is maintained in `AutoTFSSCM` (single source for included/excluded changes) — update that when operations change workspace state.

Integration points & external dependencies
- Requires a TF CLI implementation available via `auto-tfs.tf.path` (either `tf.exe` from Visual Studio or TeamExplorerEverywhere's `tf.cmd`). The extension assumes TFS CLI output format; changes to the CLI output break parsers.
- Output is parsed synchronously from `ProcessResult.stdout`/`stderr` — follow existing parsing helpers in `src/tfs/parser` when adding new commands.

> Small examples
- To add a new command: register it in `src/extension.ts` (see existing `commands.registerCommand` usages) and implement business logic in `AutoTFSService` that calls corresponding `TFSService` methods.
- To log CLI output for debugging: set `"auto-tfs.tfs.debug": true` in workspace settings and inspect the `Auto TFS` output channel.

What NOT to change without verification
- Do not change the parsing logic in `tfs-command-output-parser.ts` unless you have sample CLI output and unit tests — parsing is brittle and tightly coupled to `tf` output.
- Avoid changing activation semantics; `activationEvents` uses `onStartupFinished` on purpose so the SCM provider and status bar initialize early.

If something's unclear
- Point to the file and function you want clarified; I will extract exact call chains and examples.

---
Please review these instructions and tell me any missing areas or additional files you want referenced.
