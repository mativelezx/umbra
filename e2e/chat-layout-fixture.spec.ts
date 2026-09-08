import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import AxeBuilder from '@axe-core/playwright';

// The real chat route requires authentication. This harness renders the real
// ChatShell and layout with synthetic data, stubbed navigation/auth, and HTTP
// fixtures. It is test-only, and is never a production route or provider demo.
test.describe('Chat layout — isolated synthetic fixture', () => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Requires explicit local fixture mode');
  let fixtureScript: string;

  test.beforeAll(async () => {
    const result = await build({
      stdin: {
        contents: `import React from 'react';
          import { createRoot } from 'react-dom/client';
          import { ChatShell } from './components/chat/ChatShell';
          import { DEMO_BIG_FIVE, DEMO_JUNG_FUNCTIONS } from './lib/demo/seed';
          createRoot(document.getElementById('fixture-root')).render(
            <ChatShell profile={{ firstName: 'Ana (prueba sintética)', archetype: 'sage', bigFive: DEMO_BIG_FIVE, jungFunctions: DEMO_JUNG_FUNCTIONS }} />
          );`,
        resolveDir: process.cwd(), loader: 'tsx',
      },
      bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_DEMO_MODE': '"true"' },
      plugins: [{
        name: 'isolated-chat-fixture',
        setup(builder) {
          builder.onResolve({ filter: /^(next\/navigation|next\/link|@\/lib\/providers\/auth-context)$/ }, (args) => ({ path: args.path, namespace: 'fixture' }));
          builder.onLoad({ filter: /.*/, namespace: 'fixture' }, (args) => ({
            contents: args.path === 'next/navigation'
              ? `export const usePathname = () => '/chat';`
              : args.path === 'next/link'
                ? `import React from 'react'; export default function Link({children, ...props}) { return <a {...props}>{children}</a>; }`
                : `export const useAuth = () => ({user: null, signOut: async () => {}});`,
            loader: 'tsx', resolveDir: process.cwd(),
          }));
        },
      }],
    });
    fixtureScript = result.outputFiles[0].text;
  });

  for (const width of [390, 1152, 1440]) {
    test(`history and composer remain accessible at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.route('**/api/chat/conversations*', (route) => route.fulfill({
        json: { data: { conversations: [{ id: 'test-only-conversation', title: 'Conversación sintética', lastMessageAt: '2026-09-07', messageCount: 1 }] } },
      }));
      await page.goto('/dashboard');
      const styles = await page.locator('link[rel="stylesheet"]').evaluateAll((links) => links.map((link) => link.outerHTML).join(''));
      const fontClass = await page.locator('body').getAttribute('class');
      const fontVariable = await page.locator('html').getAttribute('class');
      await page.setContent(`<html lang="es" class="${fontVariable ?? ''}"><head><title>Prueba aislada de ChatShell</title>${styles}</head><body class="${fontClass ?? ''}"><div role="note" style="padding:12px;background:#fff;color:#242424">Prueba aislada · datos y servicios simulados · no es una sesión real</div><div id="fixture-root"></div></body></html>`);
      await page.addScriptTag({ content: fixtureScript });
      await page.evaluate(() => document.fonts.ready);
      const toggle = page.getByRole('button', { name: 'Tus conversaciones' });
      const newChat = page.getByRole('button', { name: 'Empezar una conversación nueva' });
      if (width < 1280) {
        await expect(toggle).toBeVisible();
        await expect(newChat).toBeHidden();
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        // Reduced motion must not remove the chevron's expanded-state rotation.
        await expect(toggle.locator('svg').last()).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
      } else {
        await expect(toggle).toBeHidden();
      }
      await expect(newChat).toBeVisible();
      await expect(page.getByRole('button', { name: /Conversación sintética/ })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `.impeccable/review/polish-2026-09-07/${test.info().project.name}/${width}-chat-fixture-history.png`, fullPage: true });
      await newChat.click();
      if (width < 1280) await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const input = page.getByRole('textbox', { name: 'Tu mensaje' });
      await input.fill('Mensaje sintético que no se envía.');
      await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(a11y.violations).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `.impeccable/review/polish-2026-09-07/${test.info().project.name}/${width}-chat-fixture.png`, fullPage: true });
    });
  }
});
