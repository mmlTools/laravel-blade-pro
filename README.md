# Laravel Blade Pro

Laravel Blade Pro brings Blade-aware formatting, syntax highlighting, indentation, and folding to Laravel templates in Visual Studio Code. It understands the structure created by Blade directives while safely preserving embedded HTML, JavaScript, CSS, Alpine.js, and Livewire syntax.

## Features

- Dedicated **Laravel Blade** language mode for `*.blade.php` files.
- Custom light and dark file icons for Blade templates in supported VS Code icon themes.
- Formatting for complete documents and selected ranges.
- Support for **Format on Save**.
- Blade-aware indentation and folding for nested directives.
- Highlighting for Blade comments, escaped and raw echoes, directives, components, and slots.
- Support for Alpine.js attributes such as `x-data`, `@click`, and `:class`.
- Support for Livewire attributes such as `wire:model` and `wire:click`.
- Safe handling of Blade expressions inside scripts and styles.
- Optional formatting providers for HTML, CSS, SCSS, JavaScript, JSX, TypeScript, TSX, and JSON.
- Local-only formatting with no telemetry, background network requests, template execution, or automatic project commands.

## Example

Before formatting:

```blade
@section('content')
@if($user)
<div><span>{{$user->name}}</span></div>
@endif
@endsection
```

After formatting:

```blade
@section('content')
    @if ($user)
        <div><span>{{ $user->name }}</span></div>
    @endif
@endsection
```

## Installation

Install **Laravel Blade Pro** from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=MMLTECH.laravel-blade-pro), or open the Extensions view in VS Code and search for `Laravel Blade Pro`.

Files ending in `.blade.php` are automatically recognized as Laravel Blade templates.

## Formatting setup

Open the Command Palette and run **Laravel Blade: Configure Workspace Formatter** to enable Laravel Blade Pro for the current workspace.

You can also configure it manually in your workspace settings:

```json
{
    "[laravel-blade]": {
        "editor.defaultFormatter": "MMLTECH.laravel-blade-pro",
        "editor.formatOnSave": true
    }
}
```

To select the formatter for only the current document, run **Format Document With...** and choose **Laravel Blade Pro**.

The optional web-language formatters do not replace your existing defaults automatically. They can coexist with Prettier, ESLint, Tailwind CSS IntelliSense, Intelephense, and other Laravel extensions.

## Configuration

| Setting                                 | Default | Description                                                                       |
| --------------------------------------- | ------: | --------------------------------------------------------------------------------- |
| `laravelBlade.tabWidth`                 |     `4` | Fallback indentation width when the editor does not provide one.                  |
| `laravelBlade.useTabs`                  | `false` | Use tabs as the fallback indentation style.                                       |
| `laravelBlade.printWidth`               |   `120` | Preferred maximum line width.                                                     |
| `laravelBlade.singleQuote`              |  `true` | Prefer single quotes where applicable.                                            |
| `laravelBlade.wrapAttributes`           |  `auto` | Control attribute wrapping.                                                       |
| `laravelBlade.maxPreserveNewlines`      |     `2` | Maximum number of consecutive newlines to preserve.                               |
| `laravelBlade.formatEmbeddedCss`        |  `true` | Enable formatting for embedded CSS.                                               |
| `laravelBlade.formatEmbeddedJavaScript` |  `true` | Enable formatting for embedded JavaScript.                                        |
| `laravelBlade.formatEmbeddedTypeScript` |  `true` | Enable formatting for embedded TypeScript.                                        |
| `laravelBlade.formatPhpBlocks`          |  `true` | Indent code inside `@php` blocks without running external tools.                  |
| `laravelBlade.useLaravelPintForPhp`     | `false` | Reserved for optional Laravel Pint integration.                                   |
| `laravelBlade.preserveAttributeOrder`   |  `true` | Preserve the original HTML attribute order.                                       |
| `laravelBlade.supportReminder.enabled`  |  `true` | Show the optional weekly rating and support reminder after the first week of use. |

### Custom directives

Custom block directives can participate in indentation and folding:

```json
{
    "laravelBlade.customDirectivePairs": [
        {
            "start": "feature",
            "middle": ["elsefeature"],
            "end": "endfeature"
        }
    ],
    "laravelBlade.customStandaloneDirectives": ["tenant"]
}
```

## Workspace trust and privacy

Formatting works in untrusted workspaces. Laravel Blade Pro does not load executable project configuration, run project Node modules, execute PHP or Laravel Pint, or send telemetry.

The optional support reminder is stored locally by VS Code and appears at most once a week after the first week of use. It can be dismissed permanently with **Don't show again** or disabled through the `laravelBlade.supportReminder.enabled` setting.

## Known limitations

- Malformed or highly whitespace-sensitive templates may be left unchanged to avoid damaging their contents.
- Range formatting requires the selected lines to form a parseable fragment.
- Custom directives are structurally recognized, but their final layout can depend on the underlying Blade parser.
- TypeScript inside Blade `<script>` tags is handled conservatively.
- `<pre>`, `<textarea>`, `@verbatim` blocks, inline SVG, strings, and expression bodies are preserved conservatively.
- Use Laravel Pint separately when complete PHP source formatting is required.

## Help and feedback

If you encounter a problem, [open a GitHub issue](https://github.com/mmlTools/laravel-blade-pro/issues) with:

- A minimal Blade example.
- The expected and actual output.
- Your extension version.
- Any relevant Laravel Blade Pro settings.

For additional guidance, see the [support information](https://github.com/mmlTools/laravel-blade-pro/blob/main/SUPPORT.md). Security issues should follow the [security policy](https://github.com/mmlTools/laravel-blade-pro/blob/main/SECURITY.md).

## Support the project

Laravel Blade Pro is free and open source. If it saves you time, you can help by leaving a [Marketplace rating](https://marketplace.visualstudio.com/items?itemName=MMLTECH.laravel-blade-pro&ssr=false#review-details), sharing the extension, or making an optional [donation](https://paypal.me/mmltools).

## License

Laravel Blade Pro is available under the [MIT License](https://github.com/mmlTools/laravel-blade-pro/blob/main/LICENSE).
