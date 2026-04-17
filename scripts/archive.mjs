import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const DIST = "dist";
const ARCHIVES = join(DIST, "archives");
const TARGETS = [
	{
		name: "claude",
		required: [
			"claude/.claude-plugin/plugin.json",
			"claude/.claude-plugin/marketplace.json",
		],
	},
	{
		name: "codex",
		required: ["codex/plugin/webcpu-agent-skill/.codex-plugin/plugin.json"],
	},
	{
		name: "opencode",
		required: ["opencode/templates/skills/webcpu-easel/SKILL.md"],
	},
	{
		name: "copilot",
		required: ["copilot/templates/.github/skills/webcpu-easel/SKILL.md"],
	},
];

/** @param {string} path */
async function assertFile(path) {
	const info = await stat(path).catch(() => undefined);
	if (!info?.isFile()) throw new Error(`missing archive input ${path}`);
}

/** @param {string} output @param {string[]} entries */
function tar(output, entries) {
	const result = spawnSync("tar", ["-czf", output, "-C", DIST, ...entries], {
		stdio: "inherit",
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

/** @param {string} path @returns {Promise<string>} */
async function sha256(path) {
	const hash = createHash("sha256");
	hash.update(await readFile(path));
	return hash.digest("hex");
}

async function main() {
	await mkdir(ARCHIVES, { recursive: true });
	const archives = [];
	for (const target of TARGETS) {
		for (const path of target.required) await assertFile(join(DIST, path));
		const output = join(ARCHIVES, `${target.name}.tar.gz`);
		tar(output, [target.name]);
		archives.push(output);
	}
	const allOutput = join(ARCHIVES, "webcpu-agent-skill-all.tar.gz");
	const entries = (await readdir(DIST, { withFileTypes: true }))
		.filter((entry) => entry.name !== "archives")
		.map((entry) => entry.name);
	tar(allOutput, entries);
	archives.push(allOutput);
	const checksums = [];
	for (const archive of archives) {
		checksums.push(`${await sha256(archive)}  ${basename(archive)}`);
	}
	await writeFile(
		join(ARCHIVES, "SHA256SUMS.txt"),
		`${checksums.join("\n")}\n`,
	);
	console.log(`Created package archives in ${ARCHIVES}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
