# webcpu-agent-skill

All-agent skill/plugin for building CPU-rendered Canvas2D scenes with [`EASEL.js`](https://easeljs.org). Baseline package: `@xsyetopz/easel@0.5.0`.

The repo is DRY by design: references, examples, and templates live once under `source/skills/webcpu-easel/`. Platform-specific skill files are generated into `.build/generated/`; self-contained installable bundles are packaged into `dist/`; online installer archives are committed under `prebuilt/archives/`.

## Fast online install

No local clone required:

```bash
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target kilocode --project /path/to/project
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target claude
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target codex
```

Targets:

- `kilocode`: installs `webcpu-easel` into `<project>/.kilocode/skills/webcpu-easel`.
- `claude`: installs the Claude skill into `~/.claude/skills/webcpu-easel`.
- `codex`: installs the Codex plugin into `~/.codex/plugins/webcpu-agent-skill`.
- `all`: installs all three.

## Hosted marketplaces

### Claude Code

This repository hosts a Claude plugin marketplace at `.claude-plugin/marketplace.json`.

In Claude Code:

```text
/plugin marketplace add xsyetopz/webcpu-agent-skill
/plugin install webcpu-agent-skill@webcpu-agent-skill
/plugin
```

Fallback without marketplace support:

```bash
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target claude
```

### Codex / OpenAI agents

This repository hosts a Codex marketplace at `.agents/plugins/marketplace.json`. The hosted plugin lives at `plugins/webcpu-agent-skill` and includes `.codex-plugin/plugin.json`, `skills/webcpu-easel/SKILL.md`, `REFERENCE.md`, references, examples, and templates.

Fallback without repo marketplace support:

```bash
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target codex
```

### KiloCode Legacy

KiloCode Legacy discovers project skills from `.kilocode/skills/` and global skills from `~/.kilocode/skills/`.

Project install:

```bash
curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target kilocode --project /path/to/project
```

Then open that project in KiloCode Legacy. The skill path should be:

```text
/path/to/project/.kilocode/skills/webcpu-easel/SKILL.md
```

## Agent instruction surfaces

`AGENTS.md` is canonical. Generated files keep platform configs aligned:

- `CLAUDE.md` -- Claude Code wrapper importing `AGENTS.md`; real file, not symlink.
- `GEMINI.md` -- Gemini CLI wrapper importing `AGENTS.md`.
- `.github/copilot-instructions.md` -- GitHub Copilot repository instructions.
- `.cursor/rules/webcpu-easel.mdc` -- Cursor always-apply rule.
- `.rules` -- Zed rules.
- `.aiassistant/rules/webcpu-easel.md` and `.junie/AGENTS.md` -- JetBrains AI Assistant / Junie.
- `.clinerules/00-webcpu-easel.md` -- Cline workspace rule.
- `.augment/rules/webcpu-easel.md` -- Augment rule.
- `docs/agent-platforms.md` -- generated support matrix.
- `llms.txt` and `llms-full.txt` -- LLM context manifests.

Regenerate after changing `AGENTS.md`:

```bash
bun run generate:agents
```

## Ask your agent to install this

### KiloCode Legacy

```text
Install WebCPU EASEL.js skill into this project for KiloCode Legacy. Do not clone the repository. Run:

curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target kilocode --project .

Verify `.kilocode/skills/webcpu-easel/SKILL.md`, `REFERENCE.md`, `reference/`, `examples/`, and `templates/` exist.
```

### Claude Code marketplace

```text
Install WebCPU EASEL.js from the hosted Claude marketplace. In Claude Code, run `/plugin marketplace add xsyetopz/webcpu-agent-skill`, then `/plugin install webcpu-agent-skill@webcpu-agent-skill`, then `/plugin` to verify. If marketplace install is unavailable, run the online installer: `curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target claude`.
```

### Codex / OpenAI agents

```text
Install WebCPU EASEL.js for Codex without cloning. Prefer the hosted repo marketplace at `xsyetopz/webcpu-agent-skill` (`.agents/plugins/marketplace.json`, plugin path `plugins/webcpu-agent-skill`). If this Codex build cannot add repo marketplaces, run: `curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target codex`. Verify the plugin contains `.codex-plugin/plugin.json` and `skills/webcpu-easel/SKILL.md`.
```

### Generic LLM

```text
Use WebCPU EASEL.js context from https://github.com/xsyetopz/webcpu-agent-skill. Read `llms.txt`, then `AGENTS.md`, then `source/skills/webcpu-easel/REFERENCE.md`. Use `@xsyetopz/easel@0.5.0` as the baseline. If an API is not verified by the references or installed declarations, answer `UNKNOWN` with the missing symbol or behavior.
```

## EASEL.js 0.5.0 notes

The skill tracks `@xsyetopz/easel@0.5.0`. Important changes from the EASEL.js `CHANGELOG.md`:

- `renderer.sortObjects` controls THREE-style draw-call sorting.
- Materials support `transparent`, `depthTest`, and `depthWrite`.
- Opaque scenes use depth-buffered raster paths; transparent materials still use safe sorted/blended paths.
- Static Object3D transform flags and renderer cache paths improve static scene traversal.

## Build

```bash
bun install
bun run check
```

If dependencies are unavailable, point extraction at a local EASEL.js package:

```bash
EASEL_PACKAGE_DIR=/path/to/node_modules/@xsyetopz/easel bun run check
```

## Runtime support

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
- `.build/generated/kilocode/skills/webcpu-easel/SKILL.md`

Installable bundles:

- `dist/claude/`
- `dist/codex/`
- `dist/opencode/`
- `dist/copilot/`
- `dist/kilocode/`
- `dist/.agents/plugins/marketplace.json`
- `dist/claude/.claude-plugin/marketplace.json`

Online installer archives:

- `prebuilt/archives/claude.tar.gz`
- `prebuilt/archives/codex.tar.gz`
- `prebuilt/archives/kilocode.tar.gz`
- `prebuilt/archives/webcpu-agent-skill-all.tar.gz`
- `prebuilt/archives/SHA256SUMS.txt`

## CI/CD

GitHub Actions validate source checks, full package checks on Linux/macOS/Windows, generated-surface drift, template checks, package archives, and release archives.

Local release-equivalent check:

```bash
bun install
bun run check
bun run templates:check
bun run pack:archive
```

Tag release flow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Grounding contract

Use `@xsyetopz/easel@0.5.0` as the baseline. If a requested API is not in `source/skills/webcpu-easel/reference/api-index.md` or `class-signatures.md`, inspect installed package types before generating code. If still absent, say `UNKNOWN` with the missing symbol or behavior instead of inventing an API.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow, validation, generated-surface rules, and contribution checks.

All contributors must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
