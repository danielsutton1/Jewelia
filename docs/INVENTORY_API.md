# Inventory API Documentation

## Overview

The Inventory API provides comprehensive inventory management functionality for the Jewelia CRM system. It includes CRUD operations, stock tracking, low stock alerts, and business intelligence features.

## Base URL

```
http://localhost:3000/api/inventory
```

## Authentication

All endpoints require authentication via Supabase service role key.

## Data Models

### InventoryItem

```typescript
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  cost: number | null;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
  created_at: string;
  updated_at: string;
}
```

### InventoryStatus

- `in_stock`: Item has sufficient stock (quantity > 10)
- `low_stock`: Item has low stock (quantity ≤ 10)
- `out_of_stock`: Item has no stock (quantity = 0)
- `on_order`: Item is on order from supplier

## Endpoints

### 1. List Inventory Items

**GET** `/api/inventory`

Returns a paginated list of inventory items with optional filtering.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Search in name, SKU, or description | - |
| `category` | string | Filter by category | - |
| `status` | string | Filter by status | - |
| `min_price` | number | Minimum price filter | - |
| `max_price` | number | Maximum price filter | - |
| `low_stock_only` | boolean | Show only low stock items | false |
| `limit` | number | Number of items per page (1-100) | 20 |
| `offset` | number | Number of items to skip | 0 |
| `sort_by` | string | Sort field (name, sku, price, quantity, created_at) | created_at |
| `sort_order` | string | Sort direction (asc, desc) | desc |

#### Example Request

```bash
curl "http://localhost:3000/api/inventory?category=Rings&status=low_stock&limit=10"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "c93928eb-ca87-4ddd-9084-1897d060e537",
      "sku": "RING001",
      "name": "Gold Ring",
      "description": "Beautiful gold ring",
      "category": "Rings",
      "price": 299.99,
      "cost": 150.00,
      "quantity": 5,
      "status": "low_stock",
      "created_at": "2025-05-29T15:23:02.113371+00:00",
      "updated_at": "2025-05-29T15:23:02.113371+00:00"
    }
  ]
}
```

### 2. Create Inventory Item

**POST** `/api/inventory`

Creates a new inventory item.

#### Request Body

```typescript
{
  sku: string;           // Required, unique
  name: string;          // Required
  description?: string;  // Optional
  category?: string;     // Optional
  price: number;         // Required, positive
  cost?: number;         // Optional, positive
  quantity: number;      // Optional, default 0, non-negative
  status?: string;       // Optional, auto-calculated
}
```

#### Example Request

```bash
curl -X POST "http://localhost:3000/api/inventory" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "NECK001",
    "name": "Diamond Necklace",
    "description": "Elegant diamond necklace",
    "category": "Necklaces",
    "price": 1299.99,
    "cost": 800.00,
    "quantity": 5
  }'
```

#### Example Response

```json
{
  "data": {
    "id": "d409a659-3a17-4d21-93e7-4d72c5639edd",
    "sku": "NECK001",
    "name": "Diamond Necklace",
    "description": "Elegant diamond necklace",
    "category": "Necklaces",
    "price": 1299.99,
    "cost": 800.00,
    "quantity": 5,
    "status": "low_stock",
    "created_at": "2025-07-14T17:11:51.401109+00:00",
    "updated_at": "2025-07-14T17:11:51.401109+00:00"
  }
}
```

### 3. Get Inventory Item

**GET** `/api/inventory/{id}`

Returns a specific inventory item by ID.

#### Example Request

```bash
curl "http://localhost:3000/api/inventory/d409a659-3a17-4d21-93e7-4d72c5639edd"
```

#### Example Response

```json
{
  "data": {
    "id": "d409a659-3a17-4d21-93e7-4d72c5639edd",
    "sku": "NECK001",
    "name": "Diamond Necklace",
    "description": "Elegant diamond necklace",
    "category": "Necklaces",
    "price": 1299.99,
    "cost": 800.00,
    "quantity": 5,
    "status": "low_stock",
    "created_at": "2025-07-14T17:11:51.401109+00:00",
    "updated_at": "2025-07-14T17:11:51.401109+00:00"
  }
}
```

### 4. Update Inventory Item

**PUT** `/api/inventory/{id}`

Updates an existing inventory item.

#### Request Body

Same as POST, but all fields are optional.

#### Example Request

```bash
curl -X PUT "http://localhost:3000/api/inventory/d409a659-3a17-4d21-93e7-4d72c5639edd" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "price": 1399.99
  }'
```

### 5. Delete Inventory Item

**DELETE** `/api/inventory/{id}`

Deletes an inventory item. Cannot delete items that are used in orders.

#### Example Request

```bash
curl -X DELETE "http://localhost:3000/api/inventory/d409a659-3a17-4d21-93e7-4d72c5639edd"
```

#### Example Response

```json
{
  "success": true
}
```

### 6. Get Low Stock Items

**GET** `/api/inventory/low-stock`

Returns items with low stock or out of stock status.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `threshold` | number | Quantity threshold for low stock | 10 |

#### Example Request

```bash
curl "http://localhost:3000/api/inventory/low-stock?threshold=5"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "c93928eb-ca87-4ddd-9084-1897d060e537",
      "sku": "RING001",
      "name": "Gold Ring",
      "quantity": 0,
      "status": "out_of_stock"
    }
  ]
}
```

### 7. Get Inventory Statistics

**GET** `/api/inventory/statistics`

Returns comprehensive inventory statistics.

#### Example Request

```bash
curl "http://localhost:3000/api/inventory/statistics"
```

#### Example Response

```json
{
  "data": {
    "total_items": 15,
    "total_value": 33499.95,
    "low_stock_count": 2,
    "out_of_stock_count": 0,
    "categories": [
      {
        "category": "Necklaces",
        "count": 1
      },
      {
        "category": "Rings",
        "count": 1
      }
    ]
  }
}
```

## Business Logic

### Automatic Status Updates

The system automatically updates item status based on quantity:

- **out_of_stock**: quantity = 0
- **low_stock**: quantity ≤ 10
- **in_stock**: quantity > 10

### SKU Validation

- SKUs must be unique across all inventory items
- Attempting to create an item with an existing SKU will return an error

### Quantity Validation

- Quantities cannot be negative
- When updating quantity, the system automatically recalculates status
- Quantity changes are logged in the audit trail

### Deletion Restrictions

- Items cannot be deleted if they are referenced in order_items
- This prevents data integrity issues

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details or stack trace"
}
```

### Common Error Codes

- `400`: Bad Request (validation errors)
- `404`: Not Found (item doesn't exist)
- `409`: Conflict (SKU already exists)
- `500`: Internal Server Error

## Testing

Run the comprehensive test suite:

```bash
node scripts/test-inventory-api.js
```

This will test all endpoints and verify the business logic.

## Integration

The Inventory API integrates with:

- **Orders API**: Inventory items are referenced in order_items
- **Audit Logs**: All quantity changes are logged for audit trail
- **Frontend Components**: Used by inventory management interfaces

## Performance Considerations

- All queries include proper indexing on frequently searched fields
- Pagination is implemented for large datasets
- Status calculations are done at the application level for flexibility 