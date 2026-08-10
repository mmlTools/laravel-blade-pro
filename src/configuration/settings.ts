import * as vscode from 'vscode';
import type { BladeFormattingOptions } from '../blade/formatter.js';
import type { CustomDirectivePair } from '../blade/directives.js';

export interface ExtensionSettings {
    blade: BladeFormattingOptions;
    customPairs: CustomDirectivePair[];
    customStandalone: string[];
}
export function readSettings(document: vscode.TextDocument, options: vscode.FormattingOptions): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('laravelBlade', document.uri);
    const customPairs = config.get<CustomDirectivePair[]>('customDirectivePairs', []).filter(validPair);
    const customStandalone = config.get<string[]>('customStandaloneDirectives', []).filter(validName);
    return {
        blade: {
            filepath: document.uri.scheme === 'file' ? document.uri.fsPath : undefined,
            tabWidth: Number(options.tabSize || config.get('tabWidth', 4)),
            useTabs: !options.insertSpaces,
            printWidth: config.get('printWidth', 120),
            singleQuote: config.get('singleQuote', true),
            formatPhpBlocks: config.get('formatPhpBlocks', true),
            formatEmbeddedCss: config.get('formatEmbeddedCss', true),
            formatEmbeddedJavaScript: config.get('formatEmbeddedJavaScript', true),
            formatEmbeddedTypeScript: config.get('formatEmbeddedTypeScript', true),
            wrapAttributes: config.get<'auto' | 'always' | 'never'>('wrapAttributes', 'auto'),
            preserveAttributeOrder: config.get('preserveAttributeOrder', true),
            endOfLine: document.eol === vscode.EndOfLine.CRLF ? 'crlf' : 'lf',
        },
        customPairs,
        customStandalone,
    };
}
const validName = (value: string): boolean => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
const validPair = (value: CustomDirectivePair): boolean =>
    validName(value.start) && validName(value.end) && (value.middle ?? []).every(validName);
