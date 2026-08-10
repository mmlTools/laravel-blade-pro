import * as assert from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as vscode from "vscode";

suite("Laravel Blade Pro integration", () => {
  test("detects Blade and returns document/range formatting edits", async () => {
    const manifest: unknown = JSON.parse(readFileSync(resolve(__dirname, "..", "..", "package.json"), "utf8"));
    assert.ok(isExtensionManifest(manifest), "Extension manifest does not contain a valid publisher and name");
    const extension = vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`);
    assert.ok(extension, "Development extension was not discovered");
    await extension.activate();
    const document = await vscode.workspace.openTextDocument({ language: "laravel-blade", content: "@if($user)\n<div>{{$user->name}}</div>\n@endif" });
    assert.equal(document.languageId, "laravel-blade");
    const full = await vscode.commands.executeCommand<vscode.TextEdit[]>("vscode.executeFormatDocumentProvider", document.uri, { tabSize: 4, insertSpaces: true });
    assert.ok(full?.length);
    const workspaceEdit = new vscode.WorkspaceEdit(); workspaceEdit.set(document.uri, full); assert.ok(await vscode.workspace.applyEdit(workspaceEdit));
    assert.match(document.getText(), /@if \(\$user\)/); assert.match(document.getText(), /\n {4}<div>/);
    const rangeDocument = await vscode.workspace.openTextDocument({ language: "laravel-blade", content: "@if($user)\n<div>{{$user->name}}</div>\n@endif" });
    const range = await vscode.commands.executeCommand<vscode.TextEdit[]>("vscode.executeFormatRangeProvider", rangeDocument.uri, new vscode.Range(0, 0, 2, 6), { tabSize: 4, insertSpaces: true });
    assert.ok(range?.length);
  });
});

function isExtensionManifest(value: unknown): value is { publisher: string; name: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.publisher === "string" && typeof record.name === "string";
}
