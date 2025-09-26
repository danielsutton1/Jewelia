# OrdersService - Real Supabase Integration

## Overview
The `OrdersService` provides a complete, production-ready API for managing orders in the Jewelia jewelry business app. It replaces all mock implementations with real Supabase database operations.

## Features
- ✅ **Real Supabase Integration** - No more mock data
- ✅ **Type Safety** - Full TypeScript support with Zod validation
- ✅ **Order Lifecycle Management** - Status transitions with validation
- ✅ **Audit Trail** - Automatic logging of status changes
- ✅ **Error Handling** - Comprehensive error handling and validation
- ✅ **Performance** - Efficient queries with proper joins
- ✅ **Business Logic** - Order validation and business rules

## Quick Start

### Basic Usage
```typescript
import { ordersService } from './lib/services/OrdersService'

// List all orders
const orders = await ordersService.list()

// Get a specific order
const order = await ordersService.get('order-id')

// Create a new order
const newOrder = await ordersService.create({
  customer_id: 'customer-uuid',
  items: [
    {
      inventory_id: 'inventory-uuid',
      quantity: 2,
      unit_price: 500.00
    }
  ],
  notes: 'Customer requested rush delivery',
  payment_status: 'pending'
})

// Update order status
const updatedOrder = await ordersService.updateStatus('order-id', 'in_progress')
```

### Advanced Filtering
```typescript
// Filter orders by status and date range
const pendingOrders = await ordersService.list({
  status: 'pending',
  date_range: [new Date('2024-01-01'), new Date('2024-01-31')],
  limit: 50,
  offset: 0
})

// Get orders for a specific customer
const customerOrders = await ordersService.getByCustomer('customer-uuid')

// Get recent orders
const recentOrders = await ordersService.getRecent(10)
```

## API Reference

### Core Methods

#### `list(filters?)`
Lists orders with optional filtering and pagination.

**Parameters:**
- `filters` (optional):
  - `status`: Order status filter
  - `customer_id`: Filter by customer
  - `date_range`: Date range filter `[startDate, endDate]`
  - `limit`: Number of results (max 100, default 20)
  - `offset`: Pagination offset (default 0)

**Returns:** `Promise<OrderWithDetails[]>`

#### `get(orderId)`
Gets a single order with all related data (customer, items, inventory).

**Parameters:**
- `orderId`: UUID of the order

**Returns:** `Promise<OrderWithDetails | null>`

#### `create(orderData)`
Creates a new order with items.

**Parameters:**
- `orderData`:
  - `customer_id`: Customer UUID
  - `items`: Array of order items
  - `notes` (optional): Order notes
  - `payment_status` (optional): Payment status

**Returns:** `Promise<OrderWithDetails>`

#### `update(orderId, updates)`
Updates order data.

**Parameters:**
- `orderId`: Order UUID
- `updates`: Partial order data to update

**Returns:** `Promise<OrderWithDetails>`

#### `updateStatus(orderId, newStatus, metadata?)`
Updates order status with validation.

**Parameters:**
- `orderId`: Order UUID
- `newStatus`: New status
- `metadata` (optional): Additional metadata for audit trail

**Returns:** `Promise<OrderWithDetails>`

#### `delete(orderId)`
Deletes/cancels an order.

**Parameters:**
- `orderId`: Order UUID

**Returns:** `Promise<boolean>`

### Helper Methods

#### `getByCustomer(customerId)`
Gets all orders for a specific customer.

#### `getByStatus(status)`
Gets all orders with a specific status.

#### `getRecent(limit?)`
Gets recent orders from the last 30 days.

#### `getStatusHistory(orderId)`
Gets the audit trail of status changes for an order.

#### `canTransitionTo(currentStatus, newStatus)`
Validates if a status transition is allowed.

## Order Status Flow

```
pending → in_progress → completed
    ↓
cancelled
```

**Valid Transitions:**
- `pending` → `in_progress` or `cancelled`
- `in_progress` → `completed` or `cancelled`
- `completed` → (terminal state)
- `cancelled` → (terminal state)

## Database Schema

The service works with these Supabase tables:

### `orders`
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key)
- `status` (order_status enum)
- `total_amount` (DECIMAL)
- `payment_status` (payment_status enum)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `order_items`
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `inventory_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `unit_price` (DECIMAL)
- `created_at` (TIMESTAMP)

### `customers`
- `id` (UUID, Primary Key)
- `full_name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `inventory`
- `id` (UUID, Primary Key)
- `sku` (VARCHAR)
- `name` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR)
- `price` (DECIMAL)
- `quantity` (INTEGER)
- `status` (inventory_status enum)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `audit_logs`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `action` (VARCHAR)
- `table_name` (VARCHAR)
- `record_id` (UUID)
- `changes` (JSONB)
- `created_at` (TIMESTAMP)

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Invalid data throws descriptive errors
- **Database Errors**: Network and database errors are caught and re-thrown
- **Business Logic Errors**: Invalid status transitions throw errors
- **Not Found Errors**: Missing orders return null instead of throwing

## Integration with Frontend

### Update useApi Hook
The `useApi` hook in `lib/api-service.ts` has been updated to use the real OrdersService:

```typescript
// In useApi hook
orders: {
  list: async (filters?: any) => {
    return ordersService.list(filters)
  },
  get: async (id: string) => {
    return ordersService.get(id)
  },
  create: async (data: any) => {
    return ordersService.create(data)
  },
  update: async (id: string, data: any) => {
    return ordersService.update(id, data)
  },
  delete: async (id: string) => {
    const success = await ordersService.delete(id)
    return { success }
  },
  updateStatus: async (id: string, status: any, metadata?: any) => {
    return ordersService.updateStatus(id, status, metadata)
  },
  // ... additional methods
}
```

### Remove Mock Dependencies
- Remove imports of `mockApi` for orders
- Update components to use real API methods
- Remove demo mode switches for orders

## Testing

### Sample Test Data
```typescript
// Create test customer
const testCustomer = {
  id: 'test-customer-uuid',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
}

// Create test inventory item
const testInventory = {
  id: 'test-inventory-uuid',
  sku: 'RING-001',
  name: 'Diamond Engagement Ring',
  price: 5000.00,
  quantity: 10
}

// Create test order
const testOrder = {
  customer_id: testCustomer.id,
  items: [
    {
      inventory_id: testInventory.id,
      quantity: 1,
      unit_price: testInventory.price
    }
  ],
  notes: 'Test order for development',
  payment_status: 'pending'
}
```

### Verification Steps
1. **Test Order Creation**: Create orders and verify they appear in Supabase
2. **Test Status Transitions**: Move orders through the lifecycle
3. **Test Filtering**: Use different filters and verify results
4. **Test Error Handling**: Try invalid operations and verify error messages
5. **Test Performance**: Load large datasets and verify response times

## Performance Considerations

- **Indexing**: Ensure proper indexes on `customer_id`, `status`, `created_at`
- **Pagination**: Always use pagination for large datasets
- **Joins**: Efficient joins with related tables
- **Caching**: Consider caching for frequently accessed data

## Security

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection**: Protected by Supabase client
- **Access Control**: Implement row-level security in Supabase
- **Audit Trail**: All changes logged for compliance

## Next Steps

1. **Test the Implementation**: Verify all methods work with real data
2. **Update Components**: Replace mock data usage in frontend components
3. **Add Error Boundaries**: Implement error boundaries for API failures
4. **Performance Monitoring**: Add monitoring for API response times
5. **Extend Functionality**: Add more business logic as needed 