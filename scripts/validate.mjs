import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string, platforms: string[] }} SkillJson */
/** @typedef {{ refCount: number, exampleCount: number }} ValidationSummary */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, "source/skills/webcpu-easel");
const GENERATED = join(ROOT, ".build/generated");
const DIST = join(ROOT, "dist");
const MODE = process.argv.includes("--package") ? "package" : "source-clean";
const REQUIRED_REFERENCES = [
	"api-index.md",
	"class-signatures.md",
	"enums-constants.md",
	"version-provenance.md",
	"package-identity.md",
	"module-imports.md",
	"deno-runtime.md",
	"type-inspection-guide.md",
	"setup.md",
	"core-concepts.md",
	"renderer-framebuffer.md",
	"render-pipeline.md",
	"cpu-rasterizer-constraints.md",
	"lifecycle-disposal.md",
	"cameras-controls.md",
	"geometry-builtins.md",
	"geometry-manual.md",
	"materials.md",
	"lights-fog.md",
	"textures-assets.md",
	"render-loop-recipes.md",
	"input-picking.md",
	"animation.md",
	"voxel-worlds.md",
	"sprites-lines-points.md",
	"loaders-serialization.md",
	"performance.md",
	"threejs-migration.md",
	"createjs-easeljs-comparison.md",
	"webgl-webgpu-comparison.md",
	"renderer-orchestration.md",
	"chunked-voxel-terrain.md",
	"texture-atlas-pipeline.md",
	"hierarchical-voxel-rigging.md",
	"pointer-input-and-grid-picking.md",
];
const GENERATED_SKILLS = [
	"claude/skills/webcpu-easel/SKILL.md",
	"codex/plugin/webcpu-agent-skill/skills/webcpu-easel/SKILL.md",
	"opencode/templates/skills/webcpu-easel/SKILL.md",
	"copilot/templates/.github/skills/webcpu-easel/SKILL.md",
	"copilot/templates/.copilot/skills/webcpu-easel/SKILL.md",
];
const TYPE_IMPORT_PREFIX_RE = /^type\s+/;
const EXPORT_ALIAS_RE = /\s+as\s+.*/;
const DUPLICATED_SHARED_ASSET_RE = /(^|\/)(reference|examples|templates)\//;
const BODY_REFERENCE_LINK_RE = /`(reference\/[^`]+\.md)`/g;
const IMPORTED_EASEL_SYMBOL_RE =
	/import(?:\s+type)?\s+\{([^}]+)\} from "@xsyetopz\/easel"/g;
const API_SYMBOL_RE = /- `([^`]+)`/g;
const FORBIDDEN_SOURCE_TEXT_PATTERNS = [
	["fun", "times"].join(""),
	["/Users/", "krystian"].join(""),
	["Code", "Projects"].join(""),
	["Local source", " basis"].join(""),
	["biome", "-ignore"].join(""),
];
const SOURCE_TEXT_EXTENSIONS = new Set([
	".html",
	".md",
	".mjs",
	".ts",
	".tsx",
	".json",
]);
const TEMPLATES = [
	"vite-vanilla-ts",
	"react-canvas",
	"astro-canvas",
	"voxel-world-starter",
	"deno-browser",
];
const DENO_REQUIRED_TEXT = [
	"deno.json",
	"npm:",
	"jsr:",
	"HTMLCanvasElement",
	"deno check",
];
const PACKAGED_SKILL_DIRS = [
	"claude/skills/webcpu-easel",
	"codex/plugin/webcpu-agent-skill/skills/webcpu-easel",
	"opencode/templates/skills/webcpu-easel",
	"copilot/templates/.github/skills/webcpu-easel",
	"copilot/templates/.copilot/skills/webcpu-easel",
];

/** @param {string} path @returns {Promise<string>} */
async function read(path) {
	return await readFile(path, "utf8");
}

/** @param {string} dir @returns {Promise<string[]>} */
async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.name === "node_modules") continue;
		if (entry.isDirectory()) files.push(...(await walk(path)));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

/** @param {unknown} condition @param {string} message @returns {asserts condition} */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

/** @param {string} apiText @returns {Set<string>} */
function parseApiSymbols(apiText) {
	const symbols = new Set();
	for (const match of apiText.matchAll(API_SYMBOL_RE)) {
		const symbol = match[1];
		if (symbol) symbols.add(symbol);
	}
	return symbols;
}

/** @param {string} text @returns {Set<string>} */
function importedSymbols(text) {
	const symbols = new Set();
	for (const match of text.matchAll(IMPORTED_EASEL_SYMBOL_RE)) {
		const imports = match[1];
		if (!imports) continue;
		for (const raw of imports.split(",")) {
			const name = raw
				.trim()
				.replace(TYPE_IMPORT_PREFIX_RE, "")
				.replace(EXPORT_ALIAS_RE, "");
			if (name) symbols.add(name);
		}
	}
	return symbols;
}

/** @param {string} path @returns {boolean} */
function isTextSource(path) {
	return SOURCE_TEXT_EXTENSIONS.has(path.slice(path.lastIndexOf(".")));
}

async function validateNoForbiddenSourceText() {
	for (const root of ["scripts", "source", "README.md"]) {
		const rootPath = join(ROOT, root);
		const files =
			existsSync(rootPath) && rootPath.endsWith(".md")
				? [rootPath]
				: await walk(rootPath);
		for (const file of files) {
			if (!isTextSource(file)) continue;
			const text = await read(file);
			assert(
				!FORBIDDEN_SOURCE_TEXT_PATTERNS.some((pattern) =>
					text.toLowerCase().includes(pattern.toLowerCase()),
				),
				`forbidden local/provenance text in ${relative(ROOT, file)}`,
			);
		}
	}
}

function validateNoTemplateNodeModules() {
	for (const template of TEMPLATES) {
		assert(
			!existsSync(join(SKILL, "templates", template, "node_modules")),
			`template ${template} must not contain node_modules`,
		);
	}
}

async function validateDenoSupport() {
	const denoDoc = await read(join(SKILL, "reference/deno-runtime.md"));
	const moduleDoc = await read(join(SKILL, "reference/module-imports.md"));
	for (const text of DENO_REQUIRED_TEXT) {
		assert(
			denoDoc.includes(text) || moduleDoc.includes(text),
			`Deno documentation missing ${text}`,
		);
	}
	const denoJson = join(SKILL, "templates/deno-browser/deno.json");
	const denoMain = join(SKILL, "templates/deno-browser/src/main.ts");
	const denoHtml = join(SKILL, "templates/deno-browser/index.html");
	assert(existsSync(denoJson), "missing Deno template deno.json");
	assert(existsSync(denoMain), "missing Deno template src/main.ts");
	assert(existsSync(denoHtml), "missing Deno template index.html");
	const config = JSON.parse(await read(denoJson));
	assert(
		config.imports?.["@xsyetopz/easel"] === "jsr:@xsyetopz/easel@0.4.5",
		"Deno template must pin @xsyetopz/easel import",
	);
}

async function validateNoRootDuplication() {
	for (const root of ["claude", "codex", "opencode", "copilot", ".agents"]) {
		const rootPath = join(ROOT, root);
		if (!existsSync(rootPath)) continue;
		for (const file of await walk(rootPath)) {
			const normalized = relative(ROOT, file).replaceAll("\\", "/");
			assert(
				!(
					DUPLICATED_SHARED_ASSET_RE.test(normalized) ||
					normalized.endsWith("/REFERENCE.md")
				),
				`duplicated shared skill asset outside source/build/dist: ${normalized}`,
			);
		}
	}
}

function validateSourceCleanMode() {
	for (const generated of [".build", "dist", ".agents"]) {
		assert(
			!existsSync(join(ROOT, generated)),
			`${generated} exists; run bun run clean before source-clean validation`,
		);
	}
}

async function validateGenerated() {
	for (const file of GENERATED_SKILLS) {
		assert(existsSync(join(GENERATED, file)), `missing generated ${file}`);
		const text = await read(join(GENERATED, file));
		assert(text.startsWith("---\n"), `missing frontmatter ${file}`);
		assert(text.includes("# WebCPU EASEL.js"), `missing skill body ${file}`);
	}
	for (const plugin of [
		"claude/.claude-plugin/plugin.json",
		"codex/plugin/webcpu-agent-skill/.codex-plugin/plugin.json",
	]) {
		assert(
			existsSync(join(GENERATED, plugin)),
			`missing generated plugin ${plugin}`,
		);
		JSON.parse(await read(join(GENERATED, plugin)));
	}
}

async function validatePackageMode() {
	await validateGenerated();
	for (const dir of PACKAGED_SKILL_DIRS) {
		const full = join(DIST, dir);
		assert(existsSync(join(full, "SKILL.md")), `missing packaged skill ${dir}`);
		for (const child of [
			"REFERENCE.md",
			"reference",
			"examples",
			"templates",
		]) {
			assert(existsSync(join(full, child)), `missing packaged ${dir}/${child}`);
		}
	}
	assert(
		existsSync(join(DIST, ".agents/plugins/marketplace.json")),
		"missing dist marketplace",
	);
}

/** @returns {Promise<ValidationSummary>} */
async function validateSourceContent() {
	/** @type {SkillJson} */
	const meta = JSON.parse(await read(join(SKILL, "skill.json")));
	assert(meta.name === "webcpu-easel", "skill.json name mismatch");
	assert(meta.platforms.length === 4, "skill.json must target 4 platforms");
	for (const ref of REQUIRED_REFERENCES) {
		assert(
			existsSync(join(SKILL, "reference", ref)),
			`missing reference/${ref}`,
		);
	}
	await validateNoForbiddenSourceText();
	validateNoTemplateNodeModules();
	await validateDenoSupport();
	await validateNoRootDuplication();
	const body = await read(join(SKILL, "body.md"));
	for (const match of body.matchAll(BODY_REFERENCE_LINK_RE)) {
		const refPath = match[1];
		assert(refPath, "empty body reference link");
		assert(existsSync(join(SKILL, refPath)), `body links missing ${refPath}`);
	}
	const apiText = await read(join(SKILL, "reference/api-index.md"));
	assert(
		apiText.includes("@xsyetopz/easel@0.4.5"),
		"api-index missing baseline version",
	);
	const symbols = parseApiSymbols(apiText);
	for (const required of [
		"Renderer",
		"Scene",
		"PerspectiveCamera",
		"Geometry",
		"BasicMaterial",
		"DataTexture",
		"Raycaster",
	]) {
		assert(symbols.has(required), `api-index missing ${required}`);
	}
	const exampleFiles = await walk(join(SKILL, "examples"));
	assert(exampleFiles.length >= 12, "expected at least 12 examples");
	for (const file of exampleFiles) {
		const text = await read(file);
		assert(
			text.includes("@xsyetopz/easel"),
			`example missing package import ${relative(ROOT, file)}`,
		);
		for (const symbol of importedSymbols(text)) {
			assert(
				symbols.has(symbol),
				`example imports unknown symbol ${symbol} in ${relative(ROOT, file)}`,
			);
		}
	}
	for (const template of TEMPLATES) {
		if (template === "deno-browser") continue;
		const pkgPath = join(SKILL, "templates", template, "package.json");
		assert(existsSync(pkgPath), `missing template package ${template}`);
		const pkg = JSON.parse(await read(pkgPath));
		assert(
			pkg.dependencies?.["@xsyetopz/easel"] === "0.4.5",
			`template ${template} must pin easel 0.4.5`,
		);
	}
	const refFiles = await walk(join(SKILL, "reference"));
	for (const file of refFiles) {
		const st = await stat(file);
		assert(st.size > 80, `reference too small ${relative(ROOT, file)}`);
	}
	return { refCount: refFiles.length, exampleCount: exampleFiles.length };
}

async function validate() {
	const result = await validateSourceContent();
	if (MODE === "source-clean") validateSourceCleanMode();
	else await validatePackageMode();
	console.log(
		`Validation passed (${MODE}): ${result.refCount} source references, ${result.exampleCount} examples.`,
	);
}

validate().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
