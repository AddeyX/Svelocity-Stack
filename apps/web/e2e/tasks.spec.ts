import { expect, test, type Page } from '@playwright/test';

// Requires a live Convex backend (see playwright.config.ts). Self-skips otherwise.
test.skip(!process.env.PUBLIC_CONVEX_URL, 'PUBLIC_CONVEX_URL not set — no live backend');

const email = `e2e-${Date.now()}@svelocity.dev`;
const password = 'e2e-password-1234';

// Interacting before hydration triggers native form submission (the onsubmit
// handler isn't attached yet), so wait for the layout's hydration marker.
async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page.waitForSelector('body[data-hydrated]', { timeout: 15_000 });
}

test.describe.serial('Shared Tasks golden path', () => {
	test('unauthenticated visit to /tasks lands on login', async ({ page }) => {
		await gotoHydrated(page, '/tasks');
		await expect(page).toHaveURL(/\/login/);
	});

	test('register → create → toggle → delete → logout', async ({ page }) => {
		// Register
		await gotoHydrated(page, '/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/tasks/, { timeout: 15_000 });

		// Create
		await page.fill('input[aria-label="New task title"]', 'E2E task');
		await page.click('button[aria-label="Add task"]');
		await expect(page.getByText('E2E task')).toBeVisible();

		// Toggle
		await page.click('[aria-label*="Mark \\"E2E task\\" complete"]');
		await expect(page.locator('.task-item--done', { hasText: 'E2E task' })).toBeVisible();

		// Persists across reload
		await page.reload();
		await expect(page.locator('.task-item--done', { hasText: 'E2E task' })).toBeVisible();

		// Delete (confirm dialog)
		await page.click('button[aria-label*="Delete \\"E2E task\\""]');
		await page.click('.sv-dialog-content button.sv-btn--destructive');
		// scope to task items — the closing confirm dialog also contains the title
		await expect(page.locator('.task-item', { hasText: 'E2E task' })).toHaveCount(0);

		// Logout
		await page.click('button[aria-label="Account menu"]');
		await page.getByText('Sign out').click();
		await expect(page).toHaveURL(/\/login/);
	});
});
