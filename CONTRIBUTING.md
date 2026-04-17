# Contributing to webcpu-agent-skill

Keep changes small, source-grounded, and validated. This repository packages a precise EASEL.js agent skill; public docs must not contain local-only provenance or unverified API claims.

## Read first

Before changing behavior, read:

- `AGENTS.md`
- `README.md`
- `llms.txt`
- `source/skills/webcpu-easel/body.md`
- `source/skills/webcpu-easel/REFERENCE.md`

For API/reference work, also read `source/skills/webcpu-easel/reference/api-index.md` and `source/skills/webcpu-easel/reference/class-signatures.md`.

## Workflow

1. Create a focused branch.
2. Make one coherent change set.
3. Edit canonical source first.
4. Regenerate derived files with the matching script.
5. Run targeted validation.
6. Include validation evidence in the pull request.

## Source rules

- Canonical skill content lives under `source/skills/webcpu-easel/`.
- Root agent surfaces are generated from `AGENTS.md`; run `bun run generate:agents` after changing it.
- LLM context files are generated from `llms.txt` and `llms-full.txt`; run `bun run generate:llms` after manifest edits.
- Do not edit `.build/`, `dist/`, or `.agents/` by hand.
- Do not commit generated artifacts from `.build/`, `dist/`, or `.agents/`.
- Do not symlink `CLAUDE.md`; this repo uses real generated wrapper files.
- Do not duplicate reference, example, or template trees outside canonical source and package output.

## Documentation rules

- Use `@xsyetopz/easel@0.4.5` as the documented baseline.
- If an EASEL.js API is not verified by references or installed declarations, write `UNKNOWN` instead of inventing behavior.
- Keep Deno wording precise: Deno can typecheck, bundle, and serve browser code; plain Deno CLI is not a headless Canvas2D renderer.
- Do not mention private local repositories, local filesystem paths, or private provenance in public docs.
- Keep tool-specific install files generated rather than hand-maintained.

## Validation

Run the smallest relevant set first, then the full gate before a substantial PR.

### Docs or agent-surface changes

```bash
bun run generate:agents
bun run generate:llms
bun run biome:check
```

### Skill, reference, example, or template changes

```bash
bun run check
bun run templates:check
```

### Release package check

```bash
bun run check
bun run templates:check
bun run pack:archive
```

### Clean source gate

```bash
bun run clean
bun run validate:source
```

`bun run deno:check` is part of `bun run check`; it skips when the `deno` executable is not installed.

## Pull request checklist

- [ ] Scope is focused.
- [ ] Canonical source changed before generated surfaces.
- [ ] `llms.txt` / `llms-full.txt` updated when context paths changed.
- [ ] No generated `.build/`, `dist/`, or `.agents/` artifacts committed.
- [ ] No private/local provenance in public docs.
- [ ] Validation commands and results are included in the PR description.
- [ ] CI/CD changes mention the matching local command in `README.md`.
- [ ] AI-assisted text and code were reviewed against the reference docs.

## Reporting bugs

Include:

- reproduction steps
- expected vs actual behavior
- relevant prompt, code, or generated output
- validation command output
- package/runtime versions

## Using AI tools

AI assistance is allowed. You own the result.

- read the relevant references first
- verify generated changes
- run real validation
- do not merge content you do not understand

## Code of Conduct

All contributors must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
