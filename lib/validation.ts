import { z } from 'zod'

// Common validation patterns
export const emailSchema = z.string().email({
  message: "Please enter a valid email address.",
})

export const phoneSchema = z.string().min(10, {
  message: "Please enter a valid phone number.",
}).regex(/^[\+]?[1-9][\d]{0,15}$/, {
  message: "Please enter a valid phone number format.",
})

export const nameSchema = z.string().min(2, {
  message: "Name must be at least 2 characters.",
}).max(50, {
  message: "Name must be less than 50 characters.",
})

export const requiredStringSchema = z.string().min(1, {
  message: "This field is required.",
})

export const optionalStringSchema = z.string().optional()

export const skuSchema = z.string().min(3, {
  message: "SKU must be at least 3 characters.",
}).max(20, {
  message: "SKU must be less than 20 characters.",
}).regex(/^[A-Z0-9-]+$/i, {
  message: "SKU must contain only letters, numbers, and dashes.",
})

export const priceSchema = z.string().min(1, {
  message: "Please enter a valid price.",
}).refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
  message: "Price must be a valid positive number.",
})

export const quantitySchema = z.string().min(1, {
  message: "Please enter a valid quantity.",
}).refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
  message: "Quantity must be a valid positive integer.",
})

// Customer validation schemas
export const customerFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  company: optionalStringSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: optionalStringSchema,
  notes: optionalStringSchema,
})

// Order validation schemas
export const orderItemSchema = z.object({
  productId: requiredStringSchema,
  quantity: quantitySchema,
  material: z.object({
    type: requiredStringSchema,
    karat: optionalStringSchema,
    color: optionalStringSchema,
  }),
  diamond: z.object({
    clarity: optionalStringSchema,
    color: optionalStringSchema,
    cut: optionalStringSchema,
    caratWeight: optionalStringSchema,
    shape: optionalStringSchema,
  }).optional(),
  setting: z.object({
    type: optionalStringSchema,
    style: optionalStringSchema,
    size: optionalStringSchema,
  }).optional(),
  customSpecs: optionalStringSchema,
})

export const orderFormSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  items: z.array(orderItemSchema).min(1, {
    message: "Please add at least one item to the order.",
  }),
  deliveryMethod: requiredStringSchema,
  paymentMethod: requiredStringSchema,
  notes: optionalStringSchema,
})

// Product validation schemas
export const productFormSchema = z.object({
  name: nameSchema,
  sku: skuSchema,
  category: requiredStringSchema,
  price: priceSchema,
  stock: quantitySchema,
  image: optionalStringSchema,
  status: optionalStringSchema,
  // Diamond-specific fields
  carat_weight: optionalStringSchema,
  clarity: optionalStringSchema,
  color: optionalStringSchema,
  cut: optionalStringSchema,
  shape: optionalStringSchema,
  certification: optionalStringSchema,
  fluorescence: optionalStringSchema,
  polish: optionalStringSchema,
  symmetry: optionalStringSchema,
  depth_percentage: optionalStringSchema,
  table_percentage: optionalStringSchema,
  measurements: optionalStringSchema,
  origin: optionalStringSchema,
  treatment: optionalStringSchema,
  description: optionalStringSchema,
})

// Service request validation schemas
export const serviceRequestFormSchema = z.object({
  priority: requiredStringSchema,
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  currency: requiredStringSchema,
  serviceType: requiredStringSchema,
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  materialProvision: requiredStringSchema,
  materialDetails: optionalStringSchema,
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  budgetMin: z.coerce.number().min(0, {
    message: "Minimum budget must be a positive number.",
  }),
  budgetMax: z.coerce.number().min(0, {
    message: "Maximum budget must be a positive number.",
  }),
  tags: optionalStringSchema,
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget.",
  path: ["budgetMax"],
})

// Appointment validation schemas
export const appointmentFormSchema = z.object({
  customerName: nameSchema,
  type: requiredStringSchema,
  date: z.date({
    required_error: "Appointment date is required.",
  }),
  time: requiredStringSchema,
  notes: optionalStringSchema,
})

// Partner validation schemas
export const partnerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: optionalStringSchema,
  address: optionalStringSchema,
  notes: optionalStringSchema,
})

// Inventory validation schemas
export const inventoryItemSchema = z.object({
  sku: skuSchema,
  name: nameSchema,
  category: requiredStringSchema,
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  cost: z.coerce.number().min(0, {
    message: "Cost must be a positive number.",
  }),
  quantity_available: z.coerce.number().int().min(0, {
    message: "Quantity available must be zero or positive.",
  }),
  quantity_reserved: z.coerce.number().int().min(0).optional(),
  quantity_on_order: z.coerce.number().int().min(0).optional(),
  reorder_level: z.coerce.number().int().min(0, {
    message: "Reorder level must be zero or positive.",
  }),
  is_serialized: z.boolean(),
  serial_numbers: z.array(z.string()).optional(),
})

// Quality control validation schemas
export const inspectionFormSchema = z.object({
  itemId: requiredStringSchema,
  inspectorName: nameSchema,
  inspectionDate: z.date({
    required_error: "Inspection date is required.",
  }),
  qualityGrade: requiredStringSchema,
  defects: z.array(z.string()).optional(),
  notes: optionalStringSchema,
  passed: z.boolean(),
})

// Message validation schemas
export const messageFormSchema = z.object({
  recipient: requiredStringSchema,
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  priority: requiredStringSchema,
  attachments: z.array(z.string()).optional(),
})

// Export all schemas
export const validationSchemas = {
  customer: customerFormSchema,
  order: orderFormSchema,
  product: productFormSchema,
  serviceRequest: serviceRequestFormSchema,
  appointment: appointmentFormSchema,
  partner: partnerFormSchema,
  inventory: inventoryItemSchema,
  inspection: inspectionFormSchema,
  message: messageFormSchema,
}

// Utility functions for validation
export const validateForm = (schema: z.ZodSchema, data: unknown) => {
  try {
    schema.parse(data)
    return { success: true, errors: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    return { success: false, errors: [{ message: "Validation failed" }] }
  }
}

export const getFieldError = (errors: z.ZodError["errors"], fieldName: string) => {
  return errors.find(error => error.path.includes(fieldName))?.message
}

export const hasValidationErrors = (errors: z.ZodError["errors"]) => {
  return errors.length > 0
}
