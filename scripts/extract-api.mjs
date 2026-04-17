import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string, group: string, source: string }} ExportRow */
/** @typedef {{ name: string, rel: string, text: string }} SignatureBlock */
/** @typedef {{ name: string, version: string }} PackageJson */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "source/skills/webcpu-easel/reference");
const EXPORT_LINE_RE = /^export \{\s*(.*?)\s*\} from "(.*?)";/;
const EXPORT_ALIAS_RE = /\s+as\s+.*/;
const REVISION_RE = /REVISION = "([^"]+)"/;
const CLASS_DECLARATION_RE =
	/export declare class ([A-Za-z0-9_]+)[\s\S]*?(?=\nexport |\ninterface |\n\/\/# sourceMappingURL|$)/g;
const INTERFACE_DECLARATION_RE =
	/export interface ([A-Za-z0-9_]+)[\s\S]*?\n\}/g;

function packageDir() {
	const env = process.env["EASEL_PACKAGE_DIR"];
	if (env && existsSync(join(env, "package.json"))) return env;
	const local = join(ROOT, "node_modules/@xsyetopz/easel");
	if (existsSync(join(local, "package.json"))) return local;
	throw new Error(
		"Cannot find @xsyetopz/easel package. Run `bun install` or set EASEL_PACKAGE_DIR.",
	);
}

/** @param {string} dir @returns {Promise<string[]>} */
async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(path)));
		else if (entry.isFile() && entry.name.endsWith(".d.ts")) files.push(path);
	}
	return files;
}

/** @param {string} indexText @returns {ExportRow[]} */
function exportRows(indexText) {
	const rows = [];
	for (const line of indexText.split("\n")) {
		const match = line.match(EXPORT_LINE_RE);
		if (!match) continue;
		const [, rawNames, source] = match;
		if (!(rawNames && source)) continue;
		const names = rawNames
			.split(",")
			.map((name) => name.trim())
			.filter(Boolean)
			.map((name) => name.replace(EXPORT_ALIAS_RE, ""));
		const group = source.split("/")[1] ?? source.split("/")[0] ?? "root";
		for (const name of names) rows.push({ name, group, source });
	}
	const revision = indexText.match(REVISION_RE)?.[1] ?? "UNKNOWN";
	rows.unshift({
		name: "REVISION",
		group: "root",
		source: `literal ${revision}`,
	});
	return rows;
}

/** @param {string} fileText @param {string} rel @returns {SignatureBlock[]} */
function signatureBlocks(fileText, rel) {
	const blocks = [];
	for (const match of fileText.matchAll(CLASS_DECLARATION_RE)) {
		const name = match[1];
		if (!name) continue;
		const lines = match[0]
			.split("\n")
			.map((line) => line.trimEnd())
			.filter((line) => !line.includes("#private"));
		blocks.push({ name, rel, text: lines.join("\n") });
	}
	for (const match of fileText.matchAll(INTERFACE_DECLARATION_RE)) {
		const name = match[1];
		if (!name) continue;
		blocks.push({ name, rel, text: match[0].trim() });
	}
	return blocks;
}

async function main() {
	const pkgDir = packageDir();
	/** @type {PackageJson} */
	const pkg = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf8"));
	const dist = join(pkgDir, "dist");
	const indexText = await readFile(join(dist, "index.d.ts"), "utf8");
	const rows = exportRows(indexText).sort(
		(a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
	);

	/** @type {Map<string, ExportRow[]>} */
	const byGroup = new Map();
	for (const row of rows) {
		const list = byGroup.get(row.group) ?? [];
		list.push(row);
		byGroup.set(row.group, list);
	}

	let api = `# API Index\n\nGenerated from \`${pkg.name}@${pkg.version}\` \`dist/index.d.ts\`.\n\n`;
	for (const [group, groupRows] of byGroup) {
		api += `## ${group}\n\n`;
		for (const row of groupRows)
			api += `- \`${row.name}\` -- \`${row.source}\`\n`;
		api += "\n";
	}

	const files = await walk(dist);
	const wanted = new Set([
		"renderers/Renderer.d.ts",
		"geometry/Geometry.d.ts",
		"geometry/Attribute.d.ts",
		"materials/Material.d.ts",
		"materials/BasicMaterial.d.ts",
		"materials/LambertMaterial.d.ts",
		"materials/ToonMaterial.d.ts",
		"materials/LineMaterial.d.ts",
		"materials/PointsMaterial.d.ts",
		"cameras/PerspectiveCamera.d.ts",
		"cameras/OrthographicCamera.d.ts",
		"core/Scene.d.ts",
		"core/Node.d.ts",
		"core/Raycaster.d.ts",
		"objects/Group.d.ts",
		"objects/Mesh.d.ts",
		"objects/Line.d.ts",
		"objects/Points.d.ts",
		"textures/Texture.d.ts",
		"textures/DataTexture.d.ts",
		"textures/CanvasTexture.d.ts",
		"scenes/Fog.d.ts",
		"animation/Track.d.ts",
		"animation/AnimationClip.d.ts",
		"animation/Animator.d.ts",
		"animation/AnimationAction.d.ts",
	]);
	const blocks = [];
	for (const file of files) {
		const rel = relative(dist, file).replaceAll("\\", "/");
		if (!wanted.has(rel)) continue;
		blocks.push(...signatureBlocks(await readFile(file, "utf8"), rel));
	}
	blocks.sort((a, b) => a.name.localeCompare(b.name));
	let sig = `# Class Signatures\n\nGenerated from \`${pkg.name}@${pkg.version}\` declaration files. Private fields removed.\n\n`;
	for (const block of blocks)
		sig += `## ${block.name}\n\nSource: \`${block.rel}\`\n\n\`\`\`ts\n${block.text}\n\`\`\`\n\n`;

	const constants = await readFile(join(dist, "core/Constants.d.ts"), "utf8");
	const enumDoc = `# Enums and Constants\n\nGenerated from \`${pkg.name}@${pkg.version}\` \`dist/core/Constants.d.ts\`.\n\n\`\`\`ts\n${constants.trim()}\n\`\`\`\n`;

	await mkdir(OUT, { recursive: true });
	await writeFile(join(OUT, "api-index.md"), api);
	await writeFile(join(OUT, "class-signatures.md"), sig);
	await writeFile(join(OUT, "enums-constants.md"), enumDoc);
	console.log(`Generated API references from ${pkgDir}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
