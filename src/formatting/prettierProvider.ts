import * as vscode from "vscode";
import * as prettier from "prettier";
import { fullRange } from "./formatterProvider.js";

const PARSERS: Readonly<Record<string, string>> = { html: "html", css: "css", scss: "scss", javascript: "babel", javascriptreact: "babel", typescript: "typescript", typescriptreact: "typescript", json: "json" };
export class PrettierDocumentFormattingProvider implements vscode.DocumentFormattingEditProvider {
  constructor(private readonly output: vscode.OutputChannel) {}
  async provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]> {
    const parser = PARSERS[document.languageId]; if (!parser || token.isCancellationRequested) return [];
    try {
      const source = document.getText();
      const formatted = await prettier.format(source, { parser, ...(document.uri.scheme === "file" ? { filepath: document.uri.fsPath } : {}), tabWidth: Number(options.tabSize), useTabs: !options.insertSpaces, endOfLine: document.eol === vscode.EndOfLine.CRLF ? "crlf" : "lf" });
      return token.isCancellationRequested || formatted === source ? [] : [vscode.TextEdit.replace(fullRange(document), formatted)];
    } catch (error) { this.output.appendLine(`Prettier formatting failed for ${document.uri.toString()}: ${error instanceof Error ? error.message : String(error)}`); return []; }
  }
}
export const PRETTIER_LANGUAGES = Object.keys(PARSERS);
