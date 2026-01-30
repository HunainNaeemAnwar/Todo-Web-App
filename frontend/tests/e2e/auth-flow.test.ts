/**
 * E2E integration tests for the authentication flow.
 *
 * Tests the complete user journey:
 * 1. Registration → Login → Dashboard access → Task operations → Logout
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
  });

  test('complete registration and login flow', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'SecureP@ssw0rd123';

    await test.step('Navigate to registration page', async () => {
      await page.goto(`${FRONTEND_URL}/register`);
      await expect(page.locator('text=Create your account')).toBeVisible();
    });

    await test.step('Register a new user', async () => {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(`${FRONTEND_URL}/dashboard`, { timeout: 10000 });
    });

    await test.step('Verify user is logged in on dashboard', async () => {
      await expect(page.locator('text=Your Tasks')).toBeVisible();
    });

    await test.step('Logout and verify redirect to login', async () => {
      await page.click('text=Logout');
      await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
    });

    await test.step('Login with registered credentials', async () => {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(`${FRONTEND_URL}/dashboard`, { timeout: 10000 });
    });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await test.step('Enter invalid credentials', async () => {
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
    });

    await test.step('Verify error message is shown', async () => {
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    await test.step('Access dashboard without authentication', async () => {
      await page.goto(`${FRONTEND_URL}/dashboard`);
    });

    await test.step('Verify redirect to login', async () => {
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe('Task Operations Flow', () => {
  const testEmail = `task-test-${Date.now()}@example.com`;
  const testPassword = 'SecureP@ssw0rd123';

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${FRONTEND_URL}/dashboard`);

    await context.close();
  });

  test('create, view, complete, and delete task', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`);

    await test.step('Create a new task', async () => {
      await page.click('text=Create Task');
      await page.fill('input[name="title"]', 'E2E Test Task');
      await page.fill('textarea[name="description"]', 'This is a test task created by E2E tests');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=E2E Test Task')).toBeVisible();
    });

    await test.step('Mark task as completed', async () => {
      const taskItem = page.locator('text=E2E Test Task').locator('..');
      await taskItem.locator('input[type="checkbox"]').check();
      await expect(taskItem).toHaveClass(/bg-green-50/);
    });

    await test.step('Delete the task', async () => {
      const taskItem = page.locator('text=E2E Test Task').locator('..');
      await taskItem.locator('text=Delete').click();
      await page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Delete this task?');
        await dialog.accept();
      });
      await expect(page.locator('text=E2E Test Task')).not.toBeVisible();
    });
  });
});

test.describe('Session Management', () => {
  test('JWT token is stored in cookie after login', async ({ page }) => {
    const testEmail = `session-test-${Date.now()}@example.com`;
    const testPassword = 'SecureP@ssw0rd123';

    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${FRONTEND_URL}/dashboard`);

    await test.step('Verify auth_token cookie is set', async () => {
      const cookies = await page.context().cookies();
      const authToken = cookies.find((c) => c.name === 'auth_token');
      expect(authToken).toBeDefined();
      expect(authToken?.value).toBeTruthy();
    });
  });
});
