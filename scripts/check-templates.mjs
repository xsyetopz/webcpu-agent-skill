import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TEMPLATES = join(ROOT, "source/skills/webcpu-easel/templates");
const WORK = join(ROOT, ".build/template-check");

const BUN_TEMPLATES = [
	"vite-vanilla-ts",
	"react-canvas",
	"astro-canvas",
	"voxel-world-starter",
];
const DENO_TEMPLATE = "deno-browser";

/** @param {string} command @param {string[]} args @param {string} cwd */
function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, stdio: "inherit" });
	if (result.status !== 0) process.exit(result.status ?? 1);
}

/** @param {string} path @returns {Promise<Record<string, unknown>>} */
async function readJson(path) {
	return JSON.parse(await readFile(path, "utf8"));
}

/** @param {string} name @returns {Promise<void>} */
async function checkBunTemplate(name) {
	const source = join(TEMPLATES, name);
	const target = join(WORK, name);
	await cp(source, target, { recursive: true });
	console.log(`Checking Bun template ${name}`);
	run("bun", ["install", "--frozen-lockfile"], target);
	run("bun", ["run", "typecheck"], target);
	const pkg = await readJson(join(target, "package.json"));
	const scripts =
		pkg["scripts"] && typeof pkg["scripts"] === "object" ? pkg["scripts"] : {};
	const dependencies =
		pkg["dependencies"] && typeof pkg["dependencies"] === "object"
			? pkg["dependencies"]
			: {};
	const devDependencies =
		pkg["devDependencies"] && typeof pkg["devDependencies"] === "object"
			? pkg["devDependencies"]
			: {};
	if ("build" in scripts) run("bun", ["run", "build"], target);
	else if ("vite" in dependencies || "vite" in devDependencies) {
		run("bunx", ["vite", "build"], target);
	}
}

/** @returns {Promise<void>} */
async function checkDenoTemplate() {
	const source = join(TEMPLATES, DENO_TEMPLATE);
	const target = join(WORK, DENO_TEMPLATE);
	await cp(source, target, { recursive: true });
	console.log(`Checking Deno template ${DENO_TEMPLATE}`);
	run("deno", ["task", "check"], target);
	run("deno", ["task", "build"], target);
}

/** @returns {Promise<void>} */
async function main() {
	await rm(WORK, { recursive: true, force: true });
	await mkdir(WORK, { recursive: true });
	for (const name of BUN_TEMPLATES) await checkBunTemplate(name);
	await checkDenoTemplate();
	console.log(`Template validation passed in ${WORK}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
