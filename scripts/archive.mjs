import { spawnSync } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

await mkdir("dist/archives", { recursive: true });
const entries = await readdir("dist", { withFileTypes: true });
for (const entry of entries) {
	if (!entry.isDirectory() || entry.name === "archives") continue;
	const out = join("dist", "archives", `${entry.name}.tar.gz`);
	const result = spawnSync("tar", ["-czf", out, "-C", "dist", entry.name], {
		stdio: "inherit",
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("Created package archives in dist/archives");
