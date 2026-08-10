import * as vscode from "vscode";
import { isLikelyLaravelProject } from "../utils/projectDetection.js";

export async function configureWorkspaceFormatter(extensionId: string): Promise<void> {
  if (!vscode.workspace.workspaceFolders?.length) { void vscode.window.showInformationMessage("Open a workspace before configuring its formatter."); return; }
  const folder = vscode.workspace.workspaceFolders[0];
  if (!folder) return;
  const detected = await isLikelyLaravelProject(folder);
  const choice = await vscode.window.showQuickPick([
    { label: "Blade only", detail: "Set Laravel Blade Pro as the default formatter for Laravel Blade." },
    { label: "Blade + web languages", detail: "Also set it for HTML, CSS, SCSS, JavaScript, JSX, TypeScript, TSX, and JSON." },
    { label: "Leave settings unchanged", detail: "Cancel without writing workspace settings." }
  ], { placeHolder: detected ? "Laravel project detected — choose languages to configure" : "Choose languages to configure" });
  if (!choice || choice.label === "Leave settings unchanged") return;
  const config = vscode.workspace.getConfiguration(undefined, folder.uri);
  const ids = choice.label === "Blade only" ? ["laravel-blade"] : ["laravel-blade", "html", "css", "scss", "javascript", "javascriptreact", "typescript", "typescriptreact", "json"];
  for (const id of ids) {
    const existing = config.get<Record<string, unknown>>(`[${id}]`, {});
    await config.update(`[${id}]`, { ...existing, "editor.defaultFormatter": extensionId }, vscode.ConfigurationTarget.Workspace);
  }
  const enable = await vscode.window.showQuickPick(["Enable format on save", "Keep current format-on-save setting"], { placeHolder: "Format on save" });
  if (enable === "Enable format on save") await config.update("editor.formatOnSave", true, vscode.ConfigurationTarget.Workspace);
}
