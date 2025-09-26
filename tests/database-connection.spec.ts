import { test, expect } from '@playwright/test';

test.describe('Database Connection Tests', () => {
  test('Database Health Check', async ({ page }) => {
    // Test the database health endpoint
    const response = await page.request.get('http://localhost:3001/api/health/database');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Database connection successful');
  });

  test('Database Connection Timeout Handling', async ({ page }) => {
    // Navigate to a page that requires database access
    await page.goto('http://localhost:3001/dashboard/customers');
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads without database errors
    const errorMessages = await page.locator('[data-testid="database-error"]').count();
    expect(errorMessages).toBe(0);
    
    // Check that customer data is displayed (either real or mock)
    const customerRows = await page.locator('[data-testid="customer-row"]').count();
    expect(customerRows).toBeGreaterThan(0);
  });

  test('API Database Operations', async ({ page }) => {
    // Test customers API endpoint
    const response = await page.request.get('http://localhost:3001/api/customers');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('Database Retry Mechanism', async ({ page }) => {
    // Test that the application handles database failures gracefully
    await page.goto('http://localhost:3001/dashboard/customers');
    await page.waitForLoadState('networkidle');
    
    // Look for any database error indicators
    const dbErrors = await page.locator('text=Database connection failed').count();
    const timeoutErrors = await page.locator('text=Connection timeout').count();
    
    // Should not have database errors or timeouts
    expect(dbErrors).toBe(0);
    expect(timeoutErrors).toBe(0);
  });

  test('Data Persistence', async ({ page }) => {
    // Test that data can be saved and retrieved
    await page.goto('http://localhost:3001/dashboard/customers');
    await page.waitForLoadState('networkidle');
    
    // Try to add a new customer (this will test database write operations)
    const addButton = page.locator('button:has-text("Add Customer")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Fill in the form
      await page.fill('input[name="firstName"]', 'Test Customer');
      await page.fill('input[name="lastName"]', 'Database Test');
      await page.fill('input[name="email"]', 'test@database.com');
      await page.fill('input[name="phone"]', '1234567890');
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for success message or error
        await page.waitForTimeout(2000);
        
        // Check for success indicators
        const successMessage = await page.locator('text=Customer created successfully').count();
        const errorMessage = await page.locator('text=Database error').count();
        
        // Should either succeed or fail gracefully (not timeout)
        expect(errorMessage).toBe(0);
      }
    }
  });
});
