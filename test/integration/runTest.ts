import { runTests } from "@vscode/test-electron";
import { resolve } from "node:path";
async function main(): Promise<void> {
  delete process.env.ELECTRON_RUN_AS_NODE;
  await runTests({ extensionDevelopmentPath: resolve(__dirname, ".."), extensionTestsPath: resolve(__dirname, "suite", "index.js"), launchArgs: [resolve(__dirname, "..", "sample-workspace"), "--disable-extensions"] });
}
void main().catch((error: unknown) => { console.error(error); process.exit(1); });
