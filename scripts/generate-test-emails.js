#!/usr/bin/env node

/**
 * Test Email Data Generator
 * Generates realistic test emails for all scenarios
 */

const testEmails = {
  // Valid CREATE operations
  validQuotes: [
    {
      from: 'customer@example.com',
      subject: 'Quote for wedding ring',
      body: 'Hi, I need a quote for a custom wedding ring. My budget is $3,000. Please call me at (555) 123-4567.'
    },
    {
      from: 'jane.smith@gmail.com',
      subject: 'Pricing request for engagement ring',
      body: 'I\'m looking for an engagement ring with a 1-carat diamond. What would that cost?'
    }
  ],

  validOrders: [
    {
      from: 'customer@example.com',
      subject: 'New order',
      body: 'I want to place an order for the ring we discussed. My name is John Doe.'
    }
  ],

  validRepairs: [
    {
      from: 'customer@example.com',
      subject: 'Jewelry repair needed',
      body: 'My ring broke and needs to be fixed. Can you help?'
    }
  ],

  // Security threats
  securityThreats: [
    {
      from: 'malicious@example.com',
      subject: 'Delete order #12345',
      body: 'Please delete my order #12345 immediately'
    },
    {
      from: 'hacker@example.com',
      subject: 'Update customer information',
      body: 'Change my phone number from 555-1234 to 555-5678'
    }
  ]
}

console.log('📧 Test Email Data Generated')
console.log(JSON.stringify(testEmails, null, 2))
