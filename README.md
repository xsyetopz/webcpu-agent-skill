# webcpu-agent-skill

All-agent skill/plugin for building CPU-rendered Canvas2D scenes with [`@xsyetopz/easel`](https://www.npmjs.com/package/@xsyetopz/easel). Written as prompt-contract documentation for AI agents, with npm/Bun/browser and Deno-managed browser runtime paths.

The repo is DRY by design: references, examples, and templates live once under `source/skills/webcpu-easel/`. Platform-specific skill files are generated into `.build/generated/`; self-contained installable bundles are packaged into `dist/`.

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

## Grounding contract

Use `@xsyetopz/easel@0.4.5` as the baseline. If a requested API is not in `source/skills/webcpu-easel/reference/api-index.md` or `class-signatures.md`, inspect installed package types before generating code. If still absent, say `UNKNOWN` with the missing symbol or behavior instead of inventing an API.

# License

[MIT](LICENSE)
