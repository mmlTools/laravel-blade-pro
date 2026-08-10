import * as vscode from "vscode";
import type { BladeFormattingEngine } from "../blade/formatter.js";
import { readSettings } from "../configuration/settings.js";

export class LaravelBladeDocumentFormattingProvider implements vscode.DocumentFormattingEditProvider {
  constructor(private readonly engine: BladeFormattingEngine, private readonly output: vscode.OutputChannel) {}
  async provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]> {
    if (token.isCancellationRequested) return [];
    try {
      const source = document.getText(); const settings = readSettings(document, options);
      const formatted = await this.engine.format(source, settings.blade);
      if (token.isCancellationRequested || formatted === source) return [];
      return [vscode.TextEdit.replace(fullRange(document), preserveFinalNewline(source, formatted))];
    } catch (error) {
      this.output.appendLine(`[${new Date().toISOString()}] Blade formatting failed for ${document.uri.toString()}`);
      this.output.appendLine(error instanceof Error ? error.stack ?? error.message : String(error));
      void vscode.window.showErrorMessage("Laravel Blade Pro could not format this file. Open its output for details.", "Show Output").then((choice) => { if (choice) this.output.show(true); });
      return [];
    }
  }
}
export function fullRange(document: vscode.TextDocument): vscode.Range { return new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)); }
function preserveFinalNewline(source: string, formatted: string): string {
  const hadFinal = /\r?\n$/.test(source); return hadFinal ? formatted : formatted.replace(/\r?\n$/, "");
}
