import { z } from 'zod';

const skuRegex = /^[A-Z0-9-]{3,20}$/i;

export const InventoryCreateSchema = z.object({
  sku: z.string().regex(skuRegex, { message: 'SKU must be 3-20 alphanumeric characters or dashes.' }),
  name: z.string().min(2, { message: 'Name is required.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  price: z.number().positive({ message: 'Price must be a positive number.' }),
  cost: z.number().positive({ message: 'Cost must be a positive number.' }),
  quantity_available: z.number().int().min(0, { message: 'Quantity available must be zero or positive.' }),
  quantity_reserved: z.number().int().min(0, { message: 'Quantity reserved must be zero or positive.' }).optional(),
  quantity_on_order: z.number().int().min(0, { message: 'Quantity on order must be zero or positive.' }).optional(),
  reorder_level: z.number().int().min(0, { message: 'Reorder level must be zero or positive.' }),
  is_serialized: z.boolean(),
  serial_numbers: z.array(z.string()).optional(),
});

export const InventoryUpdateSchema = z.object({
  price: z.number().positive({ message: 'Price must be a positive number.' }).optional(),
  cost: z.number().positive({ message: 'Cost must be a positive number.' }).optional(),
  quantity_available: z.number().int().min(0, { message: 'Quantity available must be zero or positive.' }).optional(),
  reorder_level: z.number().int().min(0, { message: 'Reorder level must be zero or positive.' }).optional(),
  is_serialized: z.boolean().optional(),
  serial_numbers: z.array(z.string()).optional(),
}).partial(); // Support partial updates

export const StockUpdateSchema = z.object({
  sku: z.string().regex(skuRegex, { message: 'SKU must be 3-20 alphanumeric characters or dashes.' }),
  quantity_delta: z.number().int().refine(val => val !== 0, { message: 'Quantity delta must be nonzero.' }),
  reason: z.enum(['sale', 'restock', 'adjustment', 'return', 'transfer'], { message: 'Invalid stock update reason.' }),
  updated_by: z.string().uuid({ message: 'Invalid employee ID.' }),
});

export const ReservationRequestSchema = z.object({
  sku: z.string().regex(skuRegex, { message: 'SKU must be 3-20 alphanumeric characters or dashes.' }),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer.' }),
  reserved_by: z.string().uuid({ message: 'Invalid employee ID.' }),
  reservation_note: z.string().max(500, { message: 'Reservation note too long.' }).optional(),
}); 