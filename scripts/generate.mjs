import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string, description: string, userInvocable: boolean }} SkillMeta */
/** @typedef {[key: string, value: string]} FrontmatterRow */
/** @typedef {{ path: string, content: string }} GeneratedTarget */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, "source/skills/webcpu-easel");
const OUT = join(ROOT, ".build/generated");
const NAME = "webcpu-easel";

/** @param {string} path @returns {Promise<string>} */
async function read(path) {
	return await readFile(path, "utf8");
}

/** @param {FrontmatterRow[]} rows @returns {string} */
function frontmatter(rows) {
	let text = "---\n";
	for (const [key, value] of rows) text += `${key}: ${value}\n`;
	return `${text}---\n`;
}

/** @param {string} path @param {string} content @returns {Promise<void>} */
async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

/** @param {SkillMeta} meta @param {string} body @returns {GeneratedTarget[]} */
function renderTargets(meta, body) {
	return [
		{
			path: join(OUT, "claude/skills", NAME, "SKILL.md"),
			content:
				frontmatter([
					["description", `>\n  ${meta.description}`],
					["user-invocable", String(meta.userInvocable)],
				]) + body,
		},
		{
			path: join(
				OUT,
				"codex/plugin/webcpu-agent-skill/skills",
				NAME,
				"SKILL.md",
			),
			content:
				frontmatter([
					["name", NAME],
					["description", `>\n  ${meta.description}`],
					["user-invocable", String(meta.userInvocable)],
				]) + body,
		},
		{
			path: join(OUT, "opencode/templates/skills", NAME, "SKILL.md"),
			content:
				frontmatter([
					["name", NAME],
					["description", JSON.stringify(meta.description)],
					["compatibility", "opencode"],
				]) + body,
		},
		{
			path: join(OUT, "copilot/templates/.github/skills", NAME, "SKILL.md"),
			content:
				frontmatter([
					["name", NAME],
					["description", `>\n  ${meta.description}`],
				]) + body,
		},
		{
			path: join(OUT, "copilot/templates/.copilot/skills", NAME, "SKILL.md"),
			content:
				frontmatter([
					["name", NAME],
					["description", `>\n  ${meta.description}`],
				]) + body,
		},
	];
}

async function generatePluginMetadata() {
	await write(
		join(OUT, "claude/.claude-plugin/plugin.json"),
		`${JSON.stringify(
			{
				name: "webcpu-agent-skill",
				version: "0.1.0",
				description: "EASEL.js CPU renderer skill for Claude Code",
				author: { name: "xsyetopz" },
				repository: "https://github.com/xsyetopz/webcpu-agent-skill",
				license: "MIT",
				keywords: [
					"skills",
					"easel",
					"canvas2d",
					"cpu-renderer",
					"software-rendering",
				],
				skills: "./skills/",
			},
			null,
			"\t",
		)}\n`,
	);

	await write(
		join(OUT, "claude/.claude-plugin/marketplace.json"),
		`${JSON.stringify(
			{
				name: "webcpu-agent-skill",
				owner: { name: "xsyetopz" },
				plugins: [
					{
						name: "webcpu-agent-skill",
						source: "./",
						description: "EASEL.js CPU renderer skill for Claude Code",
						version: "0.1.0",
						keywords: [
							"skills",
							"easel",
							"canvas2d",
							"cpu-renderer",
							"software-rendering",
						],
					},
				],
			},
			null,
			"\t",
		)}\n`,
	);
	await write(
		join(OUT, "codex/plugin/webcpu-agent-skill/.codex-plugin/plugin.json"),
		`${JSON.stringify(
			{
				name: "webcpu-agent-skill",
				version: "0.1.0",
				description: "EASEL.js CPU renderer skill for Codex",
				author: { name: "xsyetopz" },
				repository: "https://github.com/xsyetopz/webcpu-agent-skill",
				license: "MIT",
				keywords: ["skills", "easel", "canvas2d", "cpu-renderer"],
				skills: "./skills/",
			},
			null,
			"\t",
		)}\n`,
	);
}

async function main() {
	/** @type {SkillMeta} */
	const meta = JSON.parse(await read(join(SKILL, "skill.json")));
	const body = `${(await read(join(SKILL, "body.md"))).trim()}\n`;
	await rm(OUT, { recursive: true, force: true });
	for (const target of renderTargets(meta, body))
		await write(target.path, target.content);
	await generatePluginMetadata();
	console.log(`Generated platform SKILL files in ${OUT}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
