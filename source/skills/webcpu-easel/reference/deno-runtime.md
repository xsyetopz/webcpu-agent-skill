# Deno Runtime

Use when a project uses Deno to manage TypeScript, imports, tasks, or browser app serving.

## Agent Rule

EASEL.js rendering is browser-canvas rendering. Deno can manage, typecheck, and serve the app, but render code still runs in a browser with `HTMLCanvasElement` and Canvas2D.

## Choose One Import Mode

Use `npm:` when matching npm/Bun/Node examples:

```ts
import * as EASEL from "npm:@xsyetopz/easel@0.4.5";
```

Use `jsr:` for JSR-native Deno projects:

```ts
import * as EASEL from "jsr:@xsyetopz/easel@0.4.5";
```

Use `deno.json` imports when code should keep bare package imports:

```json
{
  "imports": {
    "@xsyetopz/easel": "jsr:@xsyetopz/easel@0.4.5"
  },
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"],
    "strict": true
  },
  "tasks": {
    "check": "deno check src/main.ts",
    "build": "deno bundle src/main.ts --output dist/main.js",
    "dev": "deno task build && deno run --allow-net --allow-read jsr:@std/http/file-server ."
  }
}
```

## Minimal Browser Entry

```ts
import * as EASEL from "@xsyetopz/easel";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (!canvas) throw new Error("Missing #scene canvas");

const renderer = new EASEL.Renderer({ width: 320, height: 180, canvas });
const scene = new EASEL.Scene();
const camera = new EASEL.PerspectiveCamera({ fov: 60, aspect: 320 / 180, near: 0.1, far: 100 });

camera.position.set(2, 2, 4);
camera.lookAt(0, 0, 0);
scene.add(new EASEL.Mesh(new EASEL.BoxGeometry(1, 1, 1), new EASEL.BasicMaterial({ color: 0x66ccff })));

function frame() {
	renderer.render(scene, camera);
	requestAnimationFrame(frame);
}
frame();
```

## Validate

```bash
deno check src/main.ts
deno task check
deno task build
deno task dev
```

Browser console check:

```ts
console.log(EASEL.REVISION);
```

Expected baseline output: `0.4.5`.

## Do Not

- Do not promise headless rendering from plain Deno CLI.
- Do not use Node-only globals in Deno browser entries.
- Do not mix `npm:` and `jsr:` imports in one source file.
- Do not point browser HTML directly at `.ts` files unless the dev server transpiles them.
- Do not point browser HTML at `jsr:` specifiers directly; bundle or use a browser-aware dev server.
- Do not replace `requestAnimationFrame` with Deno timers for browser rendering.
