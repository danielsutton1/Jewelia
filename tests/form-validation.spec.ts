import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the customers page where forms are available
    await page.goto('http://localhost:3001/dashboard/customers');
    await page.waitForLoadState('networkidle');
  });

  test('Required Field Validation', async ({ page }) => {
    // Test customer form validation
    await test.step('Customer form validation', async () => {
      // Click on "Add Customer" button
      const addCustomerButton = page.locator('button:has-text("Add Customer")').first();
      await addCustomerButton.click();
      
      // Wait for the form to appear
      await page.waitForSelector('form', { timeout: 5000 });
      
      // Try to submit the form without filling required fields
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Check for validation error messages
      const errorMessages = page.locator('[role="alert"], .error, .text-red-500, .text-destructive');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test('Service Request Form Validation', async ({ page }) => {
    // Navigate to a page with service request form
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for service request form or similar
    const serviceForm = page.locator('form').first();
    if (await serviceForm.isVisible()) {
      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Check for validation errors
      const errorMessages = page.locator('[role="alert"], .error, .text-red-500, .text-destructive');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Finance Form Validation', async ({ page }) => {
    // Navigate to finance page
    await page.goto('http://localhost:3001/dashboard/finance');
    await page.waitForLoadState('networkidle');
    
    // Look for finance forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      if (await form.isVisible()) {
        // Try to submit without filling required fields
        const submitButton = form.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Check for validation errors
          const errorMessages = form.locator('[role="alert"], .error, .text-red-500, .text-destructive');
          await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('Order Form Validation', async ({ page }) => {
    // Navigate to orders page
    await page.goto('http://localhost:3001/dashboard/orders');
    await page.waitForLoadState('networkidle');
    
    // Look for order forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      if (await form.isVisible()) {
        // Try to submit without filling required fields
        const submitButton = form.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Check for validation errors
          const errorMessages = form.locator('[role="alert"], .error, .text-red-500, .text-destructive');
          await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('Inventory Form Validation', async ({ page }) => {
    // Navigate to inventory page
    await page.goto('http://localhost:3001/dashboard/inventory');
    await page.waitForLoadState('networkidle');
    
    // Look for inventory forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      if (await form.isVisible()) {
        // Try to submit without filling required fields
        const submitButton = form.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Check for validation errors
          const errorMessages = form.locator('[role="alert"], .error, .text-red-500, .text-destructive');
          await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
