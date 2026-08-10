import esbuild from "esbuild";
import { copyFile, mkdir, rm } from "node:fs/promises";

if (process.argv.includes("--clean")) {
  await rm("dist", { recursive: true, force: true });
  process.exit(0);
}

const context = await esbuild.context({
  entryPoints: ["src/extension.ts"], bundle: true, outfile: "dist/extension.js",
  platform: "node", format: "cjs", target: "node22", external: ["vscode"],
  define: { "import.meta.url": "__laravel_blade_import_meta_url" },
  banner: { js: "const __laravel_blade_import_meta_url = require('node:url').pathToFileURL(__filename).href;" },
  sourcemap: false, minify: true, logLevel: "info"
});
if (process.argv.includes("--watch")) await context.watch();
else {
  await context.rebuild(); await context.dispose();
  await mkdir("dist", { recursive: true });
  await copyFile("node_modules/prettier-plugin-laravel-blade/dist/blade-formatter.js", "dist/blade-formatter.js");
}
