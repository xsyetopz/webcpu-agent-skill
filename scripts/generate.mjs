import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string, description: string, userInvocable: boolean }} SkillMeta */
/** @typedef {[key: string, value: string]} FrontmatterRow */
/** @typedef {{ path: string, content: string }} GeneratedTarget */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, "source/skills/webcpu-easel");
const OUT = join(ROOT, ".build/generated");
const NAME = "webcpu-easel";
const PLUGIN_NAME = "webcpu-agent-skill";
const PLUGIN_VERSION = "0.1.0";
const REPOSITORY = "https://github.com/xsyetopz/webcpu-agent-skill";

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

/** @param {string} source @param {string} target @returns {Promise<void>} */
async function copy(source, target) {
	await mkdir(dirname(target), { recursive: true });
	await cp(source, target, { recursive: true });
}

/** @param {string} skillDir @returns {Promise<void>} */
async function copySkillAssets(skillDir) {
	await copy(join(SKILL, "REFERENCE.md"), join(skillDir, "REFERENCE.md"));
	for (const dir of ["reference", "examples", "templates"]) {
		await copy(join(SKILL, dir), join(skillDir, dir));
	}
}

/** @param {SkillMeta} meta @param {string} body @returns {string} */
function codexSkill(meta, body) {
	return (
		frontmatter([
			["name", NAME],
			["description", `>\n  ${meta.description}`],
			["user-invocable", String(meta.userInvocable)],
		]) + body
	);
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
			path: join(OUT, "codex/plugin", PLUGIN_NAME, "skills", NAME, "SKILL.md"),
			content: codexSkill(meta, body),
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
		{
			path: join(OUT, "kilocode/skills", NAME, "SKILL.md"),
			content:
				frontmatter([
					["name", NAME],
					["description", `>\n  ${meta.description}`],
				]) + body,
		},
	];
}

/** @param {string} description @returns {object} */
function pluginManifest(description) {
	return {
		name: PLUGIN_NAME,
		version: PLUGIN_VERSION,
		description,
		author: { name: "xsyetopz" },
		repository: REPOSITORY,
		license: "MIT",
		keywords: [
			"skills",
			"easel",
			"canvas2d",
			"cpu-renderer",
			"software-rendering",
		],
		skills: "./skills/",
	};
}

/** @param {string} [source] @returns {object} */
function claudeMarketplace(source = "./") {
	return {
		name: PLUGIN_NAME,
		owner: { name: "xsyetopz" },
		plugins: [
			{
				name: PLUGIN_NAME,
				source,
				description: "EASEL.js CPU renderer skill for Claude Code",
				version: PLUGIN_VERSION,
				keywords: [
					"skills",
					"easel",
					"canvas2d",
					"cpu-renderer",
					"software-rendering",
				],
			},
		],
	};
}

/** @param {string} path @param {unknown} value @returns {Promise<void>} */
async function writeJson(path, value) {
	await write(path, `${JSON.stringify(value, null, "\t")}\n`);
}

async function generatePluginMetadata() {
	await writeJson(
		join(OUT, "claude/.claude-plugin/plugin.json"),
		pluginManifest("EASEL.js CPU renderer skill for Claude Code"),
	);
	await writeJson(
		join(OUT, "claude/.claude-plugin/marketplace.json"),
		claudeMarketplace(),
	);
	await writeJson(
		join(OUT, "codex/plugin", PLUGIN_NAME, ".codex-plugin/plugin.json"),
		pluginManifest("EASEL.js CPU renderer skill for Codex"),
	);
}

/** @param {SkillMeta} meta @param {string} body @returns {Promise<void>} */
async function generateHostedMarketplaces(meta, body) {
	const pluginRoot = join(ROOT, "plugins", PLUGIN_NAME);
	await rm(join(ROOT, ".claude-plugin"), { recursive: true, force: true });
	await rm(pluginRoot, { recursive: true, force: true });
	await writeJson(
		join(ROOT, ".claude-plugin/marketplace.json"),
		claudeMarketplace("./plugins/webcpu-agent-skill"),
	);
	await writeJson(
		join(pluginRoot, ".claude-plugin/plugin.json"),
		pluginManifest("EASEL.js CPU renderer skill for Claude Code"),
	);
	await writeJson(
		join(pluginRoot, ".codex-plugin/plugin.json"),
		pluginManifest("EASEL.js CPU renderer skill for Codex"),
	);
	const skillDir = join(pluginRoot, "skills", NAME);
	await write(join(skillDir, "SKILL.md"), codexSkill(meta, body));
	await copySkillAssets(skillDir);
}

async function main() {
	/** @type {SkillMeta} */
	const meta = JSON.parse(await read(join(SKILL, "skill.json")));
	const body = `${(await read(join(SKILL, "body.md"))).trim()}\n`;
	await rm(OUT, { recursive: true, force: true });
	for (const target of renderTargets(meta, body))
		await write(target.path, target.content);
	await generatePluginMetadata();
	await generateHostedMarketplaces(meta, body);
	console.log(`Generated platform SKILL files in ${OUT}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
