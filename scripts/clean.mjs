import { rm } from "node:fs/promises";

for (const path of [".build", "dist", "tsconfig.tsbuildinfo"]) {
	await rm(path, { recursive: true, force: true });
}
console.log("Removed generated artifacts: .build, dist, tsconfig.tsbuildinfo");
