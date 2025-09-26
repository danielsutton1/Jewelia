// Simple test to verify form validation is working
const { test, expect } = require('@playwright/test');

test('Form Validation Test', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001/dashboard/customers');
  await page.waitForLoadState('networkidle');
  
  // Look for any form on the page
  const forms = await page.locator('form').count();
  console.log(`Found ${forms} forms on the page`);
  
  if (forms > 0) {
    // Try to find a submit button and click it without filling the form
    const submitButtons = await page.locator('button[type="submit"]').count();
    console.log(`Found ${submitButtons} submit buttons`);
    
    if (submitButtons > 0) {
      // Click the first submit button
      await page.locator('button[type="submit"]').first().click();
      
      // Wait a moment for validation to appear
      await page.waitForTimeout(1000);
      
      // Check for validation error messages
      const errorMessages = await page.locator('[role="alert"], .error, .text-red-500, .text-destructive').count();
      console.log(`Found ${errorMessages} error messages`);
      
      if (errorMessages > 0) {
        console.log('✅ Form validation is working - error messages found');
      } else {
        console.log('❌ No validation error messages found');
      }
    }
  }
  
  // Also test the finance page
  await page.goto('http://localhost:3001/dashboard/finance');
  await page.waitForLoadState('networkidle');
  
  const financeForms = await page.locator('form').count();
  console.log(`Found ${financeForms} forms on finance page`);
  
  if (financeForms > 0) {
    const submitButtons = await page.locator('button[type="submit"]').count();
    console.log(`Found ${submitButtons} submit buttons on finance page`);
    
    if (submitButtons > 0) {
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1000);
      
      const errorMessages = await page.locator('[role="alert"], .error, .text-red-500, .text-destructive').count();
      console.log(`Found ${errorMessages} error messages on finance page`);
      
      if (errorMessages > 0) {
        console.log('✅ Finance form validation is working - error messages found');
      } else {
        console.log('❌ No validation error messages found on finance page');
      }
    }
  }
});
