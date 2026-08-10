# Laravel Blade Pro

Laravel Blade Pro gives `.blade.php` files their own **Laravel Blade** language mode, theme-aware syntax highlighting, Blade-aware formatting, indentation, folding, and safe mixed-language handling. It also provides optional Prettier-backed formatters for HTML, CSS, SCSS, JavaScript, JSX, TypeScript, TSX, and JSON.

Blade needs more than HTML indentation because directives form a second nesting tree. For example:

```blade
@section('content')
@if($user)
<div><span>{{$user->name}}</span></div>
@endif
@endsection
```

formats to:

```blade
@section('content')
    @if ($user)
        <div><span>{{ $user->name }}</span></div>
    @endif
@endsection
```

## Features

- Dedicated `laravel-blade` mode for `*.blade.php`, with Blade comments, escaped/raw echoes, PHP-like expression scopes, built-in and custom directives.
- HTML, Laravel components and slots, Alpine (`x-*`, `@click`, `:class`) and Livewire (`wire:*`) attribute highlighting.
- Embedded JavaScript and CSS scopes; formatter preservation for Blade expressions inside scripts and styles.
- Format Document (`Ctrl+Shift+F` / `Format Document With...`), range formatting, format on save, typing indentation, and nested Blade folding.
- Local-only formatting with no telemetry, network requests, template execution, or automatic project command execution.

## Formatting setup

Run **Laravel Blade: Configure Workspace Formatter** to update only language-specific workspace settings, or configure manually after replacing the publisher placeholder before publication:

```json
{
    "[laravel-blade]": {
        "editor.defaultFormatter": "your-publisher-id.laravel-blade-pro",
        "editor.formatOnSave": true
    }
}
```

The web-language providers are opt-in: select Laravel Blade Pro through **Format Document With...**. They do not change your default formatter and can coexist with Prettier, ESLint, TypeScript tooling, Tailwind CSS IntelliSense, Intelephense, and Laravel extensions.

## Configuration

| Setting | Default | Purpose |
|---|---:|---|
| `laravelBlade.tabWidth` | `4` | Fallback indentation width; editor options win. |
| `laravelBlade.useTabs` | `false` | Fallback indentation style; editor options win. |
| `laravelBlade.printWidth` | `120` | Preferred line width. |
| `laravelBlade.singleQuote` | `true` | Prettier quote preference where applicable. |
| `laravelBlade.wrapAttributes` | `auto` | Attribute wrapping preference. |
| `laravelBlade.maxPreserveNewlines` | `2` | Reserved newline preservation preference. |
| `laravelBlade.formatEmbeddedCss` | `true` | Embedded CSS preference. |
| `laravelBlade.formatEmbeddedJavaScript` | `true` | Embedded JavaScript preference. |
| `laravelBlade.formatEmbeddedTypeScript` | `true` | Embedded TypeScript preference. |
| `laravelBlade.formatPhpBlocks` | `false` | Reserved compatibility option; PHP blocks are preserved in 0.1. |
| `laravelBlade.useLaravelPintForPhp` | `false` | Reserved; 0.1 never executes Pint. |
| `laravelBlade.preserveAttributeOrder` | `true` | Do not opt into attribute sorting. |

Custom block directives participate in folding and indentation analysis:

```json
{
    "laravelBlade.customDirectivePairs": [
        { "start": "feature", "middle": ["elsefeature"], "end": "endfeature" }
    ],
    "laravelBlade.customStandaloneDirectives": ["tenant"]
}
```

## Compatibility and trust

The bundled parser supports modern Blade directives, Laravel components, Alpine and Livewire attributes. Pure formatting works in untrusted workspaces. The extension does not load executable project configuration, project Node modules, Pint, PHP, or shell commands. Use Laravel Pint separately for complete PHP source formatting.

Known limitations: malformed or highly whitespace-sensitive templates may be left unchanged; range formatting requires the selected lines to form a parseable fragment; custom directives are structurally recognized by extension features but their final layout depends on the Blade parser; TypeScript inside Blade `<script>` tags is conservatively handled as embedded script content. `<pre>`, `<textarea>`, verbatim blocks, inline SVG, strings, and expression bodies are treated conservatively.

## Install and develop

Marketplace installation will be available after the placeholder publisher and repository metadata are replaced. For a local VSIX, run `npm ci && npm run package`, then choose **Extensions: Install from VSIX...**.

Development requires Node.js 22 and npm. Run `npm ci`, open the repository in VS Code, and press F5. The Extension Development Host opens the included Laravel-style sample workspace. Useful checks are `npm run lint`, `npm run compile`, `npm run test:unit`, and `npm run test:integration`.

Report reproducible issues through the repository issue tracker after replacing the placeholder URL. Include a minimal Blade sample, expected output, actual output, extension version, and relevant settings. See [SUPPORT.md](SUPPORT.md) and [SECURITY.md](SECURITY.md).

## Releasing

1. Create the Marketplace publisher and replace every `your-publisher-id` / repository placeholder.
2. In Marketplace publisher management, create a trusted-publishing policy for this GitHub repository, the `marketplace` environment, and `.github/workflows/publish.yml`.
3. Confirm `package.json` is `0.1.0`, run `npm test && npm run package`, commit, then `git tag v0.1.0 && git push origin v0.1.0`.
4. The tag workflow requests a short-lived Marketplace credential with GitHub OIDC and publishes using `vsce publish --oidc`; no long-lived Marketplace PAT is stored.

## License

MIT. The formatter dependency is also MIT-licensed. The original extension icon does not use the Laravel or VS Code trademarks.
