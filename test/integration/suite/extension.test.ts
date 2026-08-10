import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Laravel Blade Pro integration", () => {
  test("detects Blade and returns document/range formatting edits", async () => {
    const extension = vscode.extensions.getExtension("your-publisher-id.laravel-blade-pro");
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
