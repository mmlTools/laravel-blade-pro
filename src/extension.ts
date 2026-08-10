import * as vscode from 'vscode';
import { PrettierBladeFormattingEngine } from './blade/formatter.js';
import { LaravelBladeDocumentFormattingProvider } from './formatting/formatterProvider.js';
import { LaravelBladeRangeFormattingProvider } from './formatting/rangeFormatterProvider.js';
import { PrettierDocumentFormattingProvider, PRETTIER_LANGUAGES } from './formatting/prettierProvider.js';
import { BladeFoldingProvider } from './blade/foldingProvider.js';
import { configureWorkspaceFormatter } from './commands/configureWorkspace.js';
import { showSupportReminderWhenDue } from './support/supportReminder.js';

export function activate(context: vscode.ExtensionContext): void {
    const output = vscode.window.createOutputChannel('Laravel Blade Pro', { log: true });
    const engine = new PrettierBladeFormattingEngine();
    const selector: vscode.DocumentSelector = [
        { language: 'laravel-blade', scheme: 'file' },
        { language: 'laravel-blade', scheme: 'untitled' },
    ];
    context.subscriptions.push(
        output,
        vscode.languages.registerDocumentFormattingEditProvider(
            selector,
            new LaravelBladeDocumentFormattingProvider(engine, output),
        ),
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            selector,
            new LaravelBladeRangeFormattingProvider(engine, output),
        ),
        vscode.languages.registerFoldingRangeProvider(selector, new BladeFoldingProvider()),
        vscode.commands.registerCommand('laravelBlade.configureWorkspace', () =>
            configureWorkspaceFormatter(context.extension.id),
        ),
        vscode.commands.registerCommand('laravelBlade.showOutput', () => output.show(true)),
    );
    const webProvider = new PrettierDocumentFormattingProvider(output);
    for (const language of PRETTIER_LANGUAGES)
        context.subscriptions.push(
            vscode.languages.registerDocumentFormattingEditProvider(
                [
                    { language, scheme: 'file' },
                    { language, scheme: 'untitled' },
                ],
                webProvider,
            ),
        );
    void showSupportReminderWhenDue(context);
}
export function deactivate(): void {
    /* subscriptions are disposed by VS Code */
}
