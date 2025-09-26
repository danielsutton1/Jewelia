import { z } from 'zod';

// Helper regex for SKU (e.g., alphanumeric, dashes, 3-20 chars)
const skuRegex = /^[A-Z0-9-]{3,20}$/i;
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

export const OrderItemSchema = z.object({
  inventory_id: z.string().uuid({ message: 'Invalid inventory item ID.' }),
  sku: z.string().regex(skuRegex, { message: 'SKU must be 3-20 alphanumeric characters or dashes.' }),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer.' }),
  unit_price: z.number().positive({ message: 'Unit price must be a positive number.' }),
  customization: z.string().max(500, { message: 'Customization instructions too long.' }).optional(),
  serial_number: z.string().optional(),
});

export const CompleteOrderRequestSchema = z.object({
  customer_id: z.string().uuid({ message: 'Invalid customer ID.' }),
  items: z.array(OrderItemSchema).min(1, { message: 'At least one order item is required.' }),
  special_instructions: z.string().max(1000, { message: 'Special instructions too long.' }).optional(),
  expected_delivery: z.string().datetime({ message: 'Expected delivery must be a valid ISO date.' }),
  rush_order: z.boolean().optional(),
  payment_method: z.enum(['cash', 'credit_card', 'financing', 'store_credit', 'other'], { message: 'Invalid payment method.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().regex(phoneRegex, { message: 'Invalid phone number format.' }),
  shipping_address: z.string().max(500, { message: 'Shipping address too long.' }).optional(),
  billing_address: z.string().max(500, { message: 'Billing address too long.' }).optional(),
});

export const OrderUpdateSchema = z.object({
  special_instructions: z.string().max(1000, { message: 'Special instructions too long.' }).optional(),
  expected_delivery: z.string().datetime({ message: 'Expected delivery must be a valid ISO date.' }).optional(),
  rush_order: z.boolean().optional(),
  payment_method: z.enum(['cash', 'credit_card', 'financing', 'store_credit', 'other'], { message: 'Invalid payment method.' }).optional(),
  shipping_address: z.string().max(500, { message: 'Shipping address too long.' }).optional(),
  billing_address: z.string().max(500, { message: 'Billing address too long.' }).optional(),
}).partial(); // Support partial updates

export const ProductionStageUpdateSchema = z.object({
  current_stage: z.string({ required_error: 'Current stage is required.' }),
  next_stage: z.string({ required_error: 'Next stage is required.' }),
  updated_by: z.string().uuid({ message: 'Invalid employee ID.' }),
  notes: z.string().max(1000, { message: 'Notes too long.' }).optional(),
  estimated_completion: z.string().datetime({ message: 'Estimated completion must be a valid ISO date.' }).optional(),
}); 