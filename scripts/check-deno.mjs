import { spawnSync } from "node:child_process";

const deno = spawnSync("deno", ["--version"], { stdio: "ignore" });
if (deno.status !== 0) {
	console.log("Skipped Deno check: deno executable not found");
	process.exit(0);
}

const result = spawnSync(
	"deno",
	[
		"task",
		"--config",
		"source/skills/webcpu-easel/templates/deno-browser/deno.json",
		"check",
	],
	{ stdio: "inherit" },
);
process.exit(result.status ?? 1);
