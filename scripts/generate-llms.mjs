import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ title: string, href: string, optional: boolean }} LinkEntry */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, ".build/llms");
const LINK_RE = /^- \[([^\]]+)\]\(([^)]+)\):/;
const URL_SCHEME_RE = /^[a-z]+:/i;
const LLMS_OPTIONAL_HEADING_RE = /^## Optional$/m;
const LLMS_H2_RE = /^## .+/m;
const LOCAL_TEXT_EXTENSIONS = new Set([
	".astro",
	".html",
	".json",
	".md",
	".mdc",
	".mjs",
	".rules",
	".ts",
	".tsx",
	".txt",
	".yaml",
	".yml",
]);

/** @param {string} path @returns {Promise<string>} */
async function read(path) {
	return await readFile(path, "utf8");
}

/** @param {string} path @param {string} content @returns {Promise<void>} */
async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

/** @param {string} href @returns {boolean} */
function isLocalHref(href) {
	return !(URL_SCHEME_RE.test(href) || href.startsWith("#"));
}

/** @param {string} href @returns {string} */
function localPath(href) {
	const [path] = href.split("#");
	return normalize(path ?? "");
}

/** @param {string} path @returns {boolean} */
function isLocalTextPath(path) {
	return (
		LOCAL_TEXT_EXTENSIONS.has(extname(path)) || basename(path) === ".rules"
	);
}

/** @param {string} text @param {string} source @returns {LinkEntry[]} */
function parseManifest(text, source) {
	if (!text.startsWith("# ")) throw new Error(`${source} must start with H1`);
	if (!text.split("\n").some((line) => line.startsWith("> "))) {
		throw new Error(`${source} must include blockquote summary`);
	}
	if (!LLMS_OPTIONAL_HEADING_RE.test(text))
		throw new Error(`${source} missing ## Optional`);
	if (!LLMS_H2_RE.test(text))
		throw new Error(`${source} must include H2 sections`);
	const entries = [];
	let optional = false;
	for (const line of text.split("\n")) {
		if (line.startsWith("## ")) optional = line === "## Optional";
		const match = line.match(LINK_RE);
		if (!match) continue;
		const title = match[1];
		const href = match[2];
		if (!(title && href)) continue;
		entries.push({ title, href, optional });
	}
	if (entries.length === 0) throw new Error(`${source} must include links`);
	return entries;
}

/** @param {LinkEntry[]} entries @param {boolean} includeOptional @returns {Promise<string>} */
async function renderContext(entries, includeOptional) {
	let output = "<documents>\n";
	for (const entry of entries) {
		if (entry.optional && !includeOptional) continue;
		if (!isLocalHref(entry.href)) continue;
		const path = localPath(entry.href);
		if (!isLocalTextPath(path)) continue;
		const content = await read(join(ROOT, path));
		output += `<document title=${JSON.stringify(entry.title)} path=${JSON.stringify(path)}>\n`;
		output += `${content.trim()}\n`;
		output += "</document>\n";
	}
	output += "</documents>\n";
	return output;
}

async function main() {
	const concise = await read(join(ROOT, "llms.txt"));
	const full = await read(join(ROOT, "llms-full.txt"));
	const conciseEntries = parseManifest(concise, "llms.txt");
	const fullEntries = parseManifest(full, "llms-full.txt");
	await write(
		join(OUT, "llms-ctx.txt"),
		await renderContext(conciseEntries, false),
	);
	await write(
		join(OUT, "llms-ctx-full.txt"),
		await renderContext(fullEntries, true),
	);
	console.log(`Generated LLM context files in ${OUT}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
