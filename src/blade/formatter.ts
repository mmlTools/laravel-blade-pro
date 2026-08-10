import * as prettier from 'prettier';
import * as bladePlugin from 'prettier-plugin-laravel-blade';

export interface BladeFormattingOptions {
    filepath: string | undefined;
    tabWidth: number;
    useTabs: boolean;
    printWidth: number;
    singleQuote: boolean;
    formatPhpBlocks: boolean;
    formatEmbeddedCss: boolean;
    formatEmbeddedJavaScript: boolean;
    formatEmbeddedTypeScript: boolean;
    wrapAttributes: 'auto' | 'always' | 'never';
    preserveAttributeOrder: boolean;
    endOfLine: 'lf' | 'crlf';
}
export interface BladeFormattingEngine {
    format(source: string, options: BladeFormattingOptions): Promise<string>;
}

export class PrettierBladeFormattingEngine implements BladeFormattingEngine {
    async format(source: string, options: BladeFormattingOptions): Promise<string> {
        if (!isStructurallySafe(source)) return source;
        const prepared = await formatEmbeddedRegions(source, options);
        const formatted = await prettier.format(prepared, {
            parser: 'blade',
            plugins: [bladePlugin],
            ...(options.filepath ? { filepath: options.filepath } : {}),
            tabWidth: options.tabWidth,
            useTabs: options.useTabs,
            printWidth: options.printWidth,
            singleQuote: options.singleQuote,
            endOfLine: options.endOfLine,
            bladeQuoteStyle: 'preserve',
            bladeDirectiveSpacing: 'preserve',
            bladeWrapAttributes: options.wrapAttributes,
            bladeAttributeSort: options.preserveAttributeOrder ? 'none' : 'by_type',
            bladeSelfClosingStyle: 'preserve',
            bladeSlotFormatting: 'compact',
            bladeSlotNameStyle: 'preserve',
            bladeSlotSpacing: 'none',
            bladeDirectiveParenthesisSpacing: 'spaced',
            bladeEchoSpacing: 'spaced',
        });
        return options.formatPhpBlocks ? formatPhpRegions(formatted, options) : formatted;
    }
}

function formatPhpRegions(source: string, options: BladeFormattingOptions): string {
    const pattern = /^([\t ]*)@php[\t ]*\r?\n([\s\S]*?)^[\t ]*@endphp[\t ]*(?=\r?$)/gim;
    return source.replace(pattern, (region: string, baseIndent: string, bodyWithNewline: string) => {
        if (/<<<[~'-]?[A-Za-z_]/.test(bodyWithNewline)) return region;
        const eol = region.includes('\r\n') ? '\r\n' : '\n';
        const body = bodyWithNewline.replace(/\r?\n$/, '');
        const indentUnit = options.useTabs ? '\t' : ' '.repeat(options.tabWidth);
        const formattedBody = indentPhpBody(body, baseIndent, indentUnit, eol);
        return `${baseIndent}@php${eol}${formattedBody}${eol}${baseIndent}@endphp`;
    });
}

function indentPhpBody(body: string, baseIndent: string, indentUnit: string, eol: string): string {
    const lines = body.split(/\r?\n/);
    const state: PhpLexicalState = { blockComment: false, quote: undefined };
    let depth = 0;

    return lines
        .map((line) => {
            const content = line.trim();
            if (content === '') return '';

            const code = visiblePhpCode(content, state);
            const leadingClosers = code.trimStart().match(/^[\])}]+/)?.[0].length ?? 0;
            const lineDepth = Math.max(0, depth - leadingClosers);
            depth = Math.max(0, depth + countCharacters(code, '[({') - countCharacters(code, '])}'));

            return `${baseIndent}${indentUnit.repeat(lineDepth + 1)}${content}`;
        })
        .join(eol);
}

interface PhpLexicalState {
    blockComment: boolean;
    quote: "'" | '"' | '`' | undefined;
}

function visiblePhpCode(line: string, state: PhpLexicalState): string {
    let visible = '';

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index] ?? '';
        const next = line[index + 1] ?? '';

        if (state.blockComment) {
            if (character === '*' && next === '/') {
                state.blockComment = false;
                index += 1;
            }
            visible += ' ';
            continue;
        }

        if (state.quote !== undefined) {
            if (character === '\\') {
                visible += '  ';
                index += 1;
                continue;
            }
            if (character === state.quote) state.quote = undefined;
            visible += ' ';
            continue;
        }

        if (character === '/' && next === '*') {
            state.blockComment = true;
            visible += '  ';
            index += 1;
            continue;
        }
        if ((character === '/' && next === '/') || character === '#') break;
        if (character === "'" || character === '"' || character === '`') {
            state.quote = character;
            visible += ' ';
            continue;
        }

        visible += character;
    }

    return visible;
}

function countCharacters(source: string, characters: string): number {
    return [...source].filter((character) => characters.includes(character)).length;
}

function isStructurallySafe(source: string): boolean {
    const pairs: readonly [string, string][] = [
        ['{{--', '--}}'],
        ['{!!', '!!}'],
        ['{{{', '}}}'],
        ['{{', '}}'],
    ];
    for (const [open, close] of pairs) {
        let at = 0;
        while ((at = source.indexOf(open, at)) >= 0) {
            const end = source.indexOf(close, at + open.length);
            if (end < 0) return false;
            at = end + close.length;
        }
    }
    return true;
}

async function formatEmbeddedRegions(source: string, options: BladeFormattingOptions): Promise<string> {
    const regionPattern = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
    const matches = [...source.matchAll(regionPattern)];
    let result = source;
    for (const match of matches.reverse()) {
        const full = match[0];
        const tag = (match[1] ?? '').toLowerCase();
        const attributes = match[2] ?? '';
        const body = match[3] ?? '';
        const start = match.index;
        const isTypeScript =
            tag === 'script' && /\btype\s*=\s*["'](?:text|application)\/typescript["']/i.test(attributes);
        if (
            start === undefined ||
            (tag === 'script'
                ? isTypeScript
                    ? !options.formatEmbeddedTypeScript
                    : !options.formatEmbeddedJavaScript
                : !options.formatEmbeddedCss)
        )
            continue;
        const protectedBody = protectBladeExpressions(body);
        try {
            const formatted = await prettier.format(protectedBody.text.trim(), {
                parser: tag === 'script' ? (isTypeScript ? 'typescript' : 'babel') : 'css',
                tabWidth: options.tabWidth,
                useTabs: options.useTabs,
                singleQuote: options.singleQuote,
                printWidth: options.printWidth,
                endOfLine: options.endOfLine,
            });
            const restored = restoreBladeExpressions(formatted.trimEnd(), protectedBody.values);
            const replacement = `<${tag}${attributes}>\n${restored}\n</${tag}>`;
            result = result.slice(0, start) + replacement + result.slice(start + full.length);
        } catch {
            /* Keep the original region if its host parser cannot safely parse the placeholders. */
        }
    }
    return result;
}

function protectBladeExpressions(source: string): { text: string; values: string[] } {
    const values: string[] = [];
    const pattern =
        /\{\{--[\s\S]*?--\}\}|\{!![\s\S]*?!!\}|\{\{\{[\s\S]*?\}\}\}|\{\{[\s\S]*?\}\}|@(json|js)\s*\((?:[^()]|\([^()]*\))*\)/gi;
    return {
        text: source.replace(pattern, (value) => {
            const index = values.push(value) - 1;
            return `__LARAVEL_BLADE_EXPR_${index}__`;
        }),
        values,
    };
}
function restoreBladeExpressions(source: string, values: readonly string[]): string {
    return source.replace(/__LARAVEL_BLADE_EXPR_(\d+)__/g, (_match, index: string) => values[Number(index)] ?? _match);
}
