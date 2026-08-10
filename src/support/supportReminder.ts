import * as vscode from 'vscode';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const FIRST_USED_AT_KEY = 'supportReminder.firstUsedAt';
const LAST_SHOWN_AT_KEY = 'supportReminder.lastShownAt';
const MARKETPLACE_REVIEW_URL = vscode.Uri.parse(
    'https://marketplace.visualstudio.com/items?itemName=MMLTECH.laravel-blade-pro&ssr=false#review-details',
);
const SPONSOR_URL = vscode.Uri.parse('https://paypal.me/mmltools');

export async function showSupportReminderWhenDue(context: vscode.ExtensionContext): Promise<void> {
    if (context.extensionMode !== vscode.ExtensionMode.Production) return;

    const configuration = vscode.workspace.getConfiguration('laravelBlade');
    const enabled = configuration.get<boolean>('supportReminder.enabled', true);
    if (!enabled) return;

    const now = Date.now();
    const firstUsedAt = context.globalState.get<number>(FIRST_USED_AT_KEY);
    if (firstUsedAt === undefined) {
        await context.globalState.update(FIRST_USED_AT_KEY, now);
        return;
    }

    const lastShownAt = context.globalState.get<number>(LAST_SHOWN_AT_KEY, firstUsedAt);
    if (now - lastShownAt < ONE_WEEK_MS) return;

    await context.globalState.update(LAST_SHOWN_AT_KEY, now);
    showSupportPanel(context);
}

function showSupportPanel(context: vscode.ExtensionContext): void {
    const panel = vscode.window.createWebviewPanel(
        'laravelBlade.support',
        'Support Laravel Blade Pro',
        vscode.ViewColumn.Active,
        { enableScripts: true },
    );

    panel.webview.html = getSupportPanelHtml(panel.webview);

    panel.webview.onDidReceiveMessage(
        async (message: { action?: unknown }) => {
            switch (message.action) {
                case 'rate':
                    await vscode.env.openExternal(MARKETPLACE_REVIEW_URL);
                    panel.dispose();
                    break;
                case 'sponsor':
                    await vscode.env.openExternal(SPONSOR_URL);
                    panel.dispose();
                    break;
                case 'later':
                    panel.dispose();
                    break;
                case 'disable':
                    await vscode.workspace
                        .getConfiguration('laravelBlade')
                        .update('supportReminder.enabled', false, vscode.ConfigurationTarget.Global);
                    panel.dispose();
                    void vscode.window.showInformationMessage(
                        'Laravel Blade Pro support reminders have been turned off.',
                    );
                    break;
            }
        },
        undefined,
        context.subscriptions,
    );
}

function getSupportPanelHtml(webview: vscode.Webview): string {
    const nonce = createNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>Support Laravel Blade Pro</title>
  <style nonce="${nonce}">
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      padding: 48px 24px;
      display: grid;
      place-items: center;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
    }
    main {
      width: min(620px, 100%);
      padding: 40px;
      text-align: center;
      border: 1px solid var(--vscode-widget-border, transparent);
      border-radius: 12px;
      background: var(--vscode-editorWidget-background);
      box-shadow: 0 8px 32px var(--vscode-widget-shadow);
    }
    .heart { margin-bottom: 16px; font-size: 38px; }
    h1 { margin: 0 0 16px; font-size: 26px; }
    p { margin: 0 auto; max-width: 520px; font-size: 15px; line-height: 1.65; }
    .actions {
      margin-top: 28px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    button {
      padding: 9px 16px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      border: 1px solid transparent;
      border-radius: 3px;
      cursor: pointer;
      font: inherit;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    button.link {
      color: var(--vscode-textLink-foreground);
      background: transparent;
    }
    button.link:hover { color: var(--vscode-textLink-activeForeground); background: transparent; }
    .note { margin-top: 24px; color: var(--vscode-descriptionForeground); font-size: 12px; }
  </style>
</head>
<body>
  <main>
    <div class="heart" aria-hidden="true">&#10084;&#65039;</div>
    <h1>Enjoying Laravel Blade Pro?</h1>
    <p>
      You've been using Laravel Blade Pro for a week now. If it has made your work a little easier,
      please consider leaving a Marketplace rating or supporting the project. Either one helps this
      open-source extension continue to improve—thank you!
    </p>
    <div class="actions">
      <button data-action="rate">Leave a rating</button>
      <button class="secondary" data-action="sponsor">Support the project</button>
      <button class="link" data-action="later">Maybe later</button>
      <button class="link" data-action="disable">Don't show again</button>
    </div>
    <p class="note">This reminder appears at most once a week and never interrupts formatting.</p>
  </main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => vscode.postMessage({ action: button.dataset.action }));
    });
  </script>
</body>
</html>`;
}

function createNonce(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}
