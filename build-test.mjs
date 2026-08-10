import esbuild from "esbuild";
await esbuild.build({ entryPoints: ["test/integration/runTest.ts", "test/integration/suite/index.ts", "test/integration/suite/extension.test.ts"], outdir: "dist-test", outbase: "test/integration", bundle: true, platform: "node", format: "cjs", target: "node22", external: ["vscode", "mocha"], sourcemap: false });
