
import { test, expect } from '@playwright/test';

test('Yield Guardian Landing Page', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify Title
    await expect(page).toHaveTitle(/Yield Guardian/);

    // Verify Start Agent Button exists
    const startBtn = page.getByRole('button', { name: 'Start' });
    await expect(startBtn).toBeVisible();

    // Verify Risk Dial is present (starts at 0)
    await expect(page.getByText('Risk Score')).toBeVisible();
});
