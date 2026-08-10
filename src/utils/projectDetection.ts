import * as vscode from "vscode";
const INDICATORS = ["artisan", "composer.json", "resources/views", "package.json", "vite.config.js", "vite.config.ts", "vite.config.mjs"];
export async function isLikelyLaravelProject(folder: vscode.WorkspaceFolder): Promise<boolean> {
  let matches = 0;
  await Promise.all(INDICATORS.map(async (relative) => { try { await vscode.workspace.fs.stat(vscode.Uri.joinPath(folder.uri, relative)); matches++; } catch { /* absent */ } }));
  return matches >= 2 || (matches >= 1 && INDICATORS.some((item) => item === "artisan"));
}
