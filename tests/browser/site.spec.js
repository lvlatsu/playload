import { baseURL } from '../../playwright.config.js';

import {
  test,
  expect,
  watchPolicyViolations,
  policyViolations,
} from './fixtures.js';

import { encode } from '../../src/payload.js';

const legacy = '#1.09dXcCjJLMlJVfBJTU9MruRKK81LLsnMz1MoyUzO1tBUqFZIzinWMNG0VqgFAA';

const source = '// @title Legacy\nfunction tick() { cls(4); }';

function expectSharedPolicy(header) {
  const policy = Object.fromEntries(
    header.split(';').map((directive) => {
      const [name, ...values] = directive.trim().split(/\s+/);
      return [name, values];
    }),
  );
  expect(policy['default-src']).toEqual(["'none'"]);
  expect(policy['script-src']).toContain('https://static.cloudflareinsights.com');
  expect(policy['connect-src']).toContain('https://cloudflareinsights.com');
  for (const name of ['base-uri', 'form-action', 'frame-ancestors'])
    expect(policy[name], name).toEqual(["'none'"]);
  return policy;
}

test('the PLU homepage presents its sample projects and origin link', async ({ page }) => {
  await page.goto('/playload/');
  await page.getByRole('button', { name: '日本語', exact: true }).click();

  const samples = page.locator('.plu-sample');
  await expect(samples).toHaveCount(2);
  await expect(samples.nth(0)).toContainText('GEM SURVIVOR');
  await expect(samples.nth(1)).toContainText('STAR FLOW');
  await expect(samples.nth(0)).toHaveAttribute('href', /playload\/app\/#v1\./);
  await expect(samples.nth(1)).toHaveAttribute('href', /playload\/app\/#v1\./);
  await expect(page.getByRole('link', { name: /PlayLoad Origin/ })).toHaveAttribute(
    'href',
    'https://kitao.dev/playload/',
  );
});

test('sample links open the shared app with their source restored', async ({ page }) => {
  await page.goto('/playload/');
  await page.getByRole('button', { name: '日本語', exact: true }).click();
  const sample = page.locator('.plu-sample').nth(1);
  const href = await sample.getAttribute('href');
  await sample.click();
  await expect(page).toHaveURL((url) => url.pathname === '/playload/app/' && url.hash.startsWith('#v1.'));
  await expect(page.locator('#editor')).not.toHaveValue('');
  expect(href).toContain('/playload/app/#v1.');
});

test('language selection still works when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage unavailable', 'SecurityError');
      },
    });
  });
  await page.goto('/playload/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: '日本語', exact: true }).click();
  await expect(page.locator('.introduction:visible')).toHaveAttribute('lang', 'ja');
  await expect(page.getByRole('button', { name: '日本語', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('existing shared root URLs restore their code and drop tracking parameters', async ({
  page,
}) => {
  for (const hash of [legacy, (await encode(source)).hash]) {
    await page.goto('/playload/?ref=shared' + hash);
    await expect(page.locator('#editor')).toHaveValue(source);
    await expect(page).toHaveURL(baseURL + '/playload/app/' + hash);
  }
  await page.goto('/playload/#specifications');
  await expect(page.locator('.introduction:visible')).toBeVisible();
  await expect(page).toHaveURL(baseURL + '/playload/#specifications');
  await page.evaluate((hash) => (location.hash = hash), legacy);
  await expect(page).toHaveURL(baseURL + '/playload/app/' + legacy);
  await expect(page.locator('#editor')).toHaveValue(source);
});

test('the language choice uses the shared kitao.dev key and reads the earlier one without it', async ({
  page,
}) => {
  await page.goto('/playload/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('playload-language', 'ja');
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page.locator('.language-switch button[data-language="en"]').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(
    await page.evaluate(() => [
      localStorage.getItem('kitao.dev.language'),
      localStorage.getItem('playload-language'),
    ]),
  ).toEqual(['en', 'ja']);
});

test('trailing slashes follow Workers defaults and keep a legacy fragment', async ({ page }) => {
  await page.goto('/playload?ref=legacy' + legacy);
  await expect(page).toHaveURL(baseURL + '/playload/app/' + legacy);
  await expect(page.locator('#editor')).toHaveValue(source);
  await page.goto('/playload/index.html?ref=legacy' + legacy);
  await expect(page).toHaveURL(baseURL + '/playload/app/' + legacy);
  await page.goto('/playload/app?ref=legacy' + legacy);
  await expect(page).toHaveURL(baseURL + '/playload/app/' + legacy);
  // Static assets' default auto-trailing-slash handling, as wrangler dev serves it.
  for (const [path, status, location] of [
    ['/playload?ref=alias', 307, '/playload/?ref=alias'],
    ['/playload.html?ref=alias', 307, '/playload/?ref=alias'],
    ['/playload/app.html', 307, '/playload/app/'],
    ['/playload/app/index', 307, '/playload/app/'],
    ['/playload/LICENSE.txt', 200],
    ['/playload/app/index.html/', 404],
  ]) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(status);
    expect(response.headers().location, path).toBe(location);
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
    expect(response.headers()['referrer-policy'], path).toBe('strict-origin-when-cross-origin');
  }
  // Browsers style an image or text opened on its own inline, so PNGs and text carry no content
  // policy; SVG documents keep it.
  for (const [path, policy] of [
    ['/playload/assets/images/info-api@2x.png', false],
    ['/playload/LICENSE.txt', false],
    ['/playload/assets/logo.svg', true],
  ]) {
    const headers = (await page.request.get(path)).headers();
    expect(headers['x-content-type-options'], path).toBe('nosniff');
    expect('content-security-policy' in headers, path).toBe(policy);
  }
});

test('the introduction and the app run under their own content policies without violations', async ({
  page,
}) => {
  await watchPolicyViolations(page);
  const site = expectSharedPolicy(
    (await page.goto('/playload/')).headers()['content-security-policy'],
  );
  expect(site['style-src']).toContain('https://fonts.googleapis.com');
  expect(site['script-src']).not.toContain("'unsafe-eval'");
  await page.locator('.language-switch button[data-language="ja"]').click();
  await page.locator('.plu-origin').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  expect(await policyViolations(page)).toEqual([]);
  // Game evaluation belongs to the opaque host; the app only needs its audio worklet blob.
  const app = expectSharedPolicy(
    (await page.goto('/playload/app/' + legacy)).headers()['content-security-policy'],
  );
  expect(app['script-src']).not.toContain("'unsafe-eval'");
  expect(app['script-src']).toContain('blob:');
  expect(app['worker-src']).toEqual(["'self'"]);
  expect(app['frame-src']).toEqual(["'self'"]);
  expect(app['style-src']).toEqual(["'self'"]);
  await page.locator('#start-game').click();
  await expect(page.locator('#pause')).toBeEnabled();
  // The formatter worker runs under the policy of its own script response.
  await page.getByRole('button', { name: 'Format', exact: false }).click();
  await expect(page.locator('#format')).toBeEnabled();
  await expect(page.locator('#status')).not.toHaveText(/^Format:/);
  await page.getByRole('tab', { name: 'Info', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  expect(await policyViolations(page)).toEqual([]);
});
