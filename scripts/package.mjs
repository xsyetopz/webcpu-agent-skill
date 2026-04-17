import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SOURCE_SKILL = join(ROOT, "source/skills/webcpu-easel");
const GENERATED = join(ROOT, ".build/generated");
const DIST = join(ROOT, "dist");
const NAME = "webcpu-easel";

/** @param {string} path @returns {Promise<boolean>} */
async function exists(path) {
	return await stat(path)
		.then(() => true)
		.catch(() => false);
}

/** @param {string} source @param {string} target @returns {Promise<void>} */
async function copy(source, target) {
	await mkdir(dirname(target), { recursive: true });
	await cp(source, target, { recursive: true });
}

/** @param {string} path @param {string} content @returns {Promise<void>} */
async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

/** @param {string} skillDir @returns {Promise<void>} */
async function packageSkill(skillDir) {
	await copy(
		join(SOURCE_SKILL, "REFERENCE.md"),
		join(skillDir, "REFERENCE.md"),
	);
	for (const dir of ["reference", "examples", "templates"]) {
		await copy(join(SOURCE_SKILL, dir), join(skillDir, dir));
	}
}

async function main() {
	if (!(await exists(join(GENERATED, "claude/skills", NAME, "SKILL.md")))) {
		throw new Error("Run `bun run generate` before `bun run package`.");
	}
	await rm(DIST, { recursive: true, force: true });
	await copy(GENERATED, DIST);
	const skillDirs = [
		join(DIST, "claude/skills", NAME),
		join(DIST, "codex/plugin/webcpu-agent-skill/skills", NAME),
		join(DIST, "opencode/templates/skills", NAME),
		join(DIST, "copilot/templates/.github/skills", NAME),
		join(DIST, "copilot/templates/.copilot/skills", NAME),
	];
	for (const dir of skillDirs) await packageSkill(dir);
	await write(
		join(DIST, ".agents/plugins/marketplace.json"),
		`${JSON.stringify(
			{
				name: "webcpu-agent-skill-local",
				interface: { displayName: "webcpu-agent-skill Local Marketplace" },
				plugins: [
					{
						name: "webcpu-agent-skill",
						source: {
							source: "local",
							path: "./codex/plugin/webcpu-agent-skill",
						},
						policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
						category: "Development",
					},
				],
			},
			null,
			"\t",
		)}\n`,
	);
	const readme = await readFile(join(ROOT, "README.md"), "utf8");
	await write(join(DIST, "README.md"), readme);
	console.log(`Packaged self-contained bundles in ${DIST}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
