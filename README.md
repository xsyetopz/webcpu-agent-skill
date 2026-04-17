# webcpu-agent-skill

All-agent skill/plugin for building CPU-rendered Canvas2D scenes with [`EASEL.js`](https://easeljs.org). Written as prompt-contract documentation for AI agents, with npm/Bun/browser and Deno-managed browser runtime paths.

The repo is DRY by design: references, examples, and templates live once under `source/skills/webcpu-easel/`. Platform-specific skill files are generated into `.build/generated/`; self-contained installable bundles are packaged into `dist/`.


## Agent Instructions

`AGENTS.md` is the canonical instruction source. Tool-specific files are generated from it so platform configs stay precise without hand-maintained copy-paste drift.

Committed agent instruction surfaces:

- `AGENTS.md` -- canonical repo instructions for Codex/OpenAI agents, Amp, Augment hierarchy, Junie fallback, Zed fallback, and general agent runners.
- `CLAUDE.md` -- generated Claude Code wrapper importing `AGENTS.md`; real file, not a symlink.
- `GEMINI.md` -- generated Gemini CLI wrapper importing `AGENTS.md` with `@./AGENTS.md`.
- `.github/copilot-instructions.md` -- generated GitHub Copilot repository instructions.
- `.cursor/rules/webcpu-easel.mdc` -- generated Cursor always-apply project rule.
- `.rules` -- generated Zed project rules file.
- `.aiassistant/rules/webcpu-easel.md` -- generated JetBrains AI Assistant project rule.
- `.junie/AGENTS.md` -- generated JetBrains Junie preferred project guideline file.
- `.clinerules/00-webcpu-easel.md` -- generated Cline workspace rule.
- `.roo/rules/00-webcpu-easel.md` -- generated Roo Code workspace rule.
- `.augment/rules/webcpu-easel.md` -- generated Augment workspace rule.
- `docs/agent-platforms.md` -- generated support matrix with docs links and fallback notes.
- `llms.txt` -- concise llmstxt.org-style repo map and priority links.
- `llms-full.txt` -- full llmstxt.org-style manifest with every reference, example, template, and script.

Regenerate instruction surfaces after editing `AGENTS.md`:

```bash
bun run generate:agents
```

## Install / Use with Agents

Build installable bundles first:

```bash
bun install
bun run check
```

### Codex / OpenAI agents

Codex reads repo `AGENTS.md` automatically when opened in this repository. To install the packaged skill/plugin into a local Codex plugin marketplace, use `dist/codex/plugin/webcpu-agent-skill` after `bun run check`.

### Claude Code

Claude Code reads `CLAUDE.md`, which imports `AGENTS.md`. Preferred install uses the generated local plugin marketplace, matching the Claude plugin format used by openagentsbtw.

```bash
bun run check
```

Then in Claude Code:

```text
/plugin marketplace add ./dist/claude
/plugin install webcpu-agent-skill@webcpu-agent-skill
/plugin
```

For local smoke testing or validation, use Claude Code's plugin commands when available:

```bash
claude --plugin-dir dist/claude
claude plugin validate dist/claude
```

Manual skill-copy fallback:

```bash
bun run check
mkdir -p ~/.claude/skills
cp -R dist/claude/skills/webcpu-easel ~/.claude/skills/webcpu-easel
```

Plugin metadata is generated at `dist/claude/.claude-plugin/plugin.json`; local marketplace metadata is generated at `dist/claude/.claude-plugin/marketplace.json`.

### OpenCode

OpenCode can use the root `AGENTS.md` as project guidance. Packaged skill assets are generated under `dist/opencode/templates/skills/webcpu-easel`; copy that directory into the OpenCode skills location used by your setup.

### GitHub Copilot / Copilot CLI

Copilot repository instructions are committed at `.github/copilot-instructions.md`. Packaged Copilot skill assets are generated under:

- `dist/copilot/templates/.github/skills/webcpu-easel`
- `dist/copilot/templates/.copilot/skills/webcpu-easel`

Copilot CLI support is documented as partial: use the same repository files as prompt context unless the CLI surface documents separate repository instruction ingestion.

### Cursor

Cursor project rules are committed at `.cursor/rules/webcpu-easel.mdc`. Open the repository in Cursor; the rule is marked `alwaysApply: true`.

### Gemini CLI

Gemini CLI reads `GEMINI.md`. This generated file imports `AGENTS.md` with `@./AGENTS.md`, keeping Gemini-specific setup thin and canonical.

### Zed

Zed reads `.rules` at the project root before compatibility fallbacks such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`. The generated `.rules` file materializes `AGENTS.md` so Zed receives the same contract.

### JetBrains AI Assistant / IntelliJ / Junie

JetBrains AI Assistant project rules live under `.aiassistant/rules/`. Junie prefers `.junie/AGENTS.md` and falls back to root `AGENTS.md`. Both generated files materialize the canonical contract.

### Cline

Cline workspace rules live under `.clinerules/`. The generated `00-webcpu-easel.md` file is loaded as shared workspace guidance.

### Roo Code

Roo Code workspace rules live under `.roo/rules/`. The generated `00-webcpu-easel.md` file is the project rule surface.

### Augment / Auggie CLI

Augment workspace rules live under `.augment/rules/`. Augment also discovers `AGENTS.md` and `CLAUDE.md` hierarchically, so the generated rule and canonical file agree.

### Amp / Neovim

Amp reads `AGENTS.md` automatically in CLI and supported IDE integrations, including Neovim through Amp's Neovim plugin path. Neovim has no single universal AI-agent instruction file; use the active plugin/CLI adapter and point it at `AGENTS.md`, `llms.txt`, or the packaged skill output.

### Google Antigravity

Antigravity rules/workflows docs are JavaScript-rendered. Until a static repository rule-file path is verified, use `AGENTS.md`, `GEMINI.md`, and `llms.txt` as the portable fallback context.

### Generic LLMs

Start with `llms.txt`, then `AGENTS.md`, then `source/skills/webcpu-easel/REFERENCE.md`. Use `llms-full.txt` when full repository context is needed.

## Ask Your Agent to Install This

Paste one prompt into the AI agent you are using. Replace placeholders first.

### Claude Code plugin marketplace

```text
Install the WebCPU EASEL.js agent skill from <path-to-webcpu-agent-skill> into Claude Code for <path-to-target-project>. Run `bun run check` in the skill repo first. Use the local Claude plugin marketplace at `dist/claude`: add it with `/plugin marketplace add ./dist/claude`, install `webcpu-agent-skill@webcpu-agent-skill`, and verify the skill is listed by `/plugin`. Do not symlink `CLAUDE.md`; this repo uses a real generated wrapper importing `AGENTS.md`.
```

### Claude Code manual skill fallback

```text
Install the WebCPU EASEL.js Claude skill manually from <path-to-webcpu-agent-skill>. Run `bun run check`, then copy `dist/claude/skills/webcpu-easel` into `~/.claude/skills/webcpu-easel`. Verify `SKILL.md`, `REFERENCE.md`, `reference/`, `examples/`, and `templates/` exist after copying.
```

### Codex / OpenAI agents

```text
Use <path-to-webcpu-agent-skill> as a Codex/OpenAI agent skill source for <path-to-target-project>. Read `AGENTS.md` first, then `llms.txt`, then `source/skills/webcpu-easel/REFERENCE.md`. Run `bun run check`. If installing as a local Codex plugin, use `dist/codex/plugin/webcpu-agent-skill` after packaging.
```

### OpenCode

```text
Install the WebCPU EASEL.js skill from <path-to-webcpu-agent-skill> into OpenCode for <path-to-target-project>. Run `bun run check`, then copy or register `dist/opencode/templates/skills/webcpu-easel` using the OpenCode skill location configured on this machine. Use root `AGENTS.md` as the project guidance source.
```

### GitHub Copilot / Copilot CLI

```text
Configure GitHub Copilot for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, copy or adapt `.github/copilot-instructions.md` as repository instructions, and use `llms.txt` as compact prompt context for Copilot CLI if the CLI does not ingest repository instructions automatically.
```

### Cursor

```text
Configure Cursor for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then copy or adapt `.cursor/rules/webcpu-easel.mdc` into the target project. Keep `alwaysApply: true` if the project should always use EASEL.js grounding.
```

### Gemini CLI

```text
Configure Gemini CLI for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then use `GEMINI.md` as the Gemini entry file; it imports `AGENTS.md` with `@./AGENTS.md`. Keep `AGENTS.md` beside it or update the import path.
```

### Zed

```text
Configure Zed for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then copy or adapt `.rules` into the target project root. Treat `.rules` as generated from `AGENTS.md`; do not hand-maintain divergent rules.
```

### JetBrains AI Assistant / IntelliJ / Junie

```text
Configure JetBrains AI Assistant and Junie for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, copy or adapt `.aiassistant/rules/webcpu-easel.md` for AI Assistant, and copy or adapt `.junie/AGENTS.md` for Junie. Keep root `AGENTS.md` as the canonical fallback.
```

### Cline

```text
Configure Cline for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then copy or adapt `.clinerules/00-webcpu-easel.md` into the target project. Keep the generated rule aligned with `AGENTS.md`.
```

### Roo Code

```text
Configure Roo Code for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then copy or adapt `.roo/rules/00-webcpu-easel.md` into the target project. Keep the generated rule aligned with `AGENTS.md`.
```

### Augment / Auggie CLI

```text
Configure Augment or Auggie CLI for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then copy or adapt `.augment/rules/webcpu-easel.md`. Also keep root `AGENTS.md` available because Augment discovers repository guidance hierarchically.
```

### Amp / Neovim

```text
Configure Amp or an Amp-backed Neovim workflow for <path-to-target-project> using <path-to-webcpu-agent-skill>. Run `bun run check`, then use root `AGENTS.md` as the primary instruction file and `llms.txt` as compact context. Neovim has no single universal AI-rule format, so wire these files into the active plugin or CLI adapter.
```

### Generic LLM

```text
Use <path-to-webcpu-agent-skill> as context for generating EASEL.js code. Read `llms.txt` first, then `AGENTS.md`, then `source/skills/webcpu-easel/REFERENCE.md`. Use `@xsyetopz/easel@0.4.5` as the baseline. If an API is not verified by the references or installed declarations, answer `UNKNOWN` instead of inventing behavior.
```

## LLM Context Forms

- `llms.txt` is the concise llmstxt.org manifest.
- `llms-full.txt` is the expanded manifest.
- `.build/llms/llms-ctx.txt` is generated context from required `llms.txt` links.
- `.build/llms/llms-ctx-full.txt` is generated context from `llms-full.txt`, including `## Optional` links.

Generate context files:

```bash
bun run generate:llms
```

These `.build/llms` files are generated artifacts. Do not edit them by hand.

## Build

```bash
bun install
bun run check
```

If dependencies are unavailable, point extraction at a local EASEL.js package:

```bash
EASEL_PACKAGE_DIR=/path/to/node_modules/@xsyetopz/easel bun run check
```

## Runtime Support

- Browser bundlers: Vite, React, Astro, vanilla TypeScript.
- Deno-managed browser apps: `templates/deno-browser` with `deno.json`, JSR import map, `deno check`, `deno bundle`, and static dev server task.
- Rendering requires browser DOM canvas; Deno CLI can typecheck and serve, not provide headless Canvas2D by itself.

## Outputs

Generated platform files:

- `.build/generated/claude/skills/webcpu-easel/SKILL.md`
- `.build/generated/codex/plugin/webcpu-agent-skill/skills/webcpu-easel/SKILL.md`
- `.build/generated/opencode/templates/skills/webcpu-easel/SKILL.md`
- `.build/generated/copilot/templates/.github/skills/webcpu-easel/SKILL.md`
- `.build/generated/copilot/templates/.copilot/skills/webcpu-easel/SKILL.md`

Installable self-contained bundles:

- `dist/claude/`
- `dist/codex/`
- `dist/opencode/`
- `dist/copilot/`
- `dist/.agents/plugins/marketplace.json`
- `dist/claude/.claude-plugin/marketplace.json`

## Grounding contract

Use `@xsyetopz/easel@0.4.5` as the baseline. If a requested API is not in `source/skills/webcpu-easel/reference/api-index.md` or `class-signatures.md`, inspect installed package types before generating code. If still absent, say `UNKNOWN` with the missing symbol or behavior instead of inventing an API.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow, validation, generated-surface rules, and contribution checks.

All contributors must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Star History

<a href="https://www.star-history.com/?repos=xsyetopz%2Fwebcpu-agent-skill&type=date&logscale=&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/image?repos=xsyetopz/webcpu-agent-skill&type=date&theme=dark&logscale&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/image?repos=xsyetopz/webcpu-agent-skill&type=date&logscale&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/image?repos=xsyetopz/webcpu-agent-skill&type=date&logscale&legend=top-left" />
 </picture>
</a>

# License

[MIT](LICENSE)
