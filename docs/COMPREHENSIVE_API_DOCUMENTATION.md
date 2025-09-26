# 🚀 **COMPREHENSIVE API & INTEGRATION DOCUMENTATION**

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Core API Endpoints](#core-api-endpoints)
5. [Integration System](#integration-system)
6. [Webhook System](#webhook-system)
7. [Import/Export System](#importexport-system)
8. [Analytics & Monitoring](#analytics--monitoring)
9. [Error Handling](#error-handling)
10. [SDKs & Libraries](#sdks--libraries)
11. [Examples & Tutorials](#examples--tutorials)
12. [Changelog](#changelog)

---

## 🌟 **Overview**

Jewelia CRM provides a comprehensive RESTful API system designed specifically for the jewelry industry. Our API enables seamless integration with jewelry design software, inventory management systems, accounting platforms, and more.

### **Key Features**
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Responses**: All responses in JSON format
- **Comprehensive Authentication**: JWT tokens and API keys
- **Real-time Updates**: WebSocket support for live data
- **Rate Limiting**: Configurable rate limits per API key
- **Webhook System**: Real-time event notifications
- **Integration Marketplace**: Third-party integrations
- **Custom Integration Builder**: No-code integration creation

### **Base URL**
```
Production: https://api.jewelia-crm.com/v1
Staging: https://staging-api.jewelia-crm.com/v1
Development: http://localhost:3000/api
```

---

## 🔐 **Authentication**

### **API Key Authentication**
```http
Authorization: Bearer YOUR_API_KEY
```

### **JWT Authentication**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Getting API Keys**
1. Navigate to **Settings > API Keys** in your Jewelia CRM dashboard
2. Click **Create New API Key**
3. Configure permissions and expiration
4. Copy the generated key (shown only once)

### **Permissions**
- `read`: Read access to resources
- `write`: Create and update resources
- `delete`: Delete resources
- `admin`: Full administrative access

---

## ⚡ **Rate Limiting**

### **Default Limits**
- **Free Tier**: 1,000 requests/hour
- **Professional**: 10,000 requests/hour
- **Enterprise**: 100,000 requests/hour

### **Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Exceeded Response**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

---

## 🎯 **Core API Endpoints**

### **Customers**

#### **List Customers**
```http
GET /customers?page=1&limit=20&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "company": "Jewelry Store",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### **Create Customer**
```http
POST /customers
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0124",
  "company": "Design Studio"
}
```

#### **Update Customer**
```http
PUT /customers/{id}
Content-Type: application/json

{
  "phone": "+1-555-0125"
}
```

#### **Delete Customer**
```http
DELETE /customers/{id}
```

### **Inventory**

#### **List Inventory Items**
```http
GET /inventory?category=rings&status=in_stock&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "RING-001",
      "name": "Diamond Engagement Ring",
      "category": "rings",
      "price": 2500.00,
      "quantity": 5,
      "status": "in_stock",
      "specifications": {
        "metal": "18k White Gold",
        "stone": "1.5ct Diamond",
        "clarity": "VS1",
        "color": "F"
      }
    }
  ]
}
```

#### **Create Inventory Item**
```http
POST /inventory
Content-Type: application/json

{
  "sku": "RING-002",
  "name": "Sapphire Ring",
  "category": "rings",
  "price": 1200.00,
  "quantity": 3,
  "specifications": {
    "metal": "14k Yellow Gold",
    "stone": "2.0ct Sapphire",
    "clarity": "VS2"
  }
}
```

### **Orders**

#### **List Orders**
```http
GET /orders?status=pending&customer_id={id}&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_id": "customer-uuid",
      "status": "pending",
      "total_amount": 2500.00,
      "payment_status": "pending",
      "items": [
        {
          "inventory_id": "inventory-uuid",
          "quantity": 1,
          "unit_price": 2500.00
        }
      ],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **Create Order**
```http
POST /orders
Content-Type: application/json

{
  "customer_id": "customer-uuid",
  "items": [
    {
      "inventory_id": "inventory-uuid",
      "quantity": 1,
      "unit_price": 2500.00
    }
  ],
  "notes": "Customer prefers white gold setting"
}
```

---

## 🔌 **Integration System**

### **Jewelry Industry Integrations**

#### **List Integrations**
```http
GET /integrations/jewelry-industry?type=design_software&provider=rhino
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Rhino CAD Integration",
      "type": "design_software",
      "provider": "Robert McNeel & Associates",
      "version": "7.0",
      "apiVersion": "2.1",
      "features": ["3D Modeling", "Jewelry Design", "File Export"],
      "supportedFormats": ["3dm", "stl", "obj", "iges"],
      "isActive": true,
      "metadata": {
        "industryStandards": ["ISO 128", "ANSI Y14.5"],
        "certifications": ["ISO 9001"],
        "integrationLevel": "premium"
      }
    }
  ]
}
```

#### **Create Integration**
```http
POST /integrations/jewelry-industry
Content-Type: application/json

{
  "name": "Custom CAD Integration",
  "type": "design_software",
  "provider": "Your Company",
  "version": "1.0",
  "features": ["Custom Design", "File Import"],
  "isActive": true
}
```

### **Integration Marketplace**

#### **Browse Marketplace**
```http
GET /integrations/marketplace?category=inventory_management&pricingModel=free&sortBy=rating&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jewelry Inventory Pro",
      "description": "Advanced inventory management system",
      "developer": "JewelTech Solutions",
      "category": "inventory_management",
      "pricing": {
        "model": "subscription",
        "amount": 29.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": ["Real-time inventory", "Barcode scanning"],
      "rating": 4.8,
      "reviewCount": 127,
      "downloadCount": 1543,
      "isVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### **Custom Integration Builder**

#### **Create Custom Integration**
```http
POST /integrations/builder
Content-Type: application/json

{
  "name": "Customer Data Sync",
  "description": "Sync customer data with external CRM",
  "template": "data_sync",
  "configuration": {
    "triggers": [
      {
        "type": "database_change",
        "config": { "table": "customers", "operation": "insert,update" }
      }
    ],
    "actions": [
      {
        "type": "http_request",
        "config": { "url": "https://external-crm.com/api/customers", "method": "POST" }
      }
    ]
  },
  "isActive": true
}
```

#### **Update Integration**
```http
PUT /integrations/builder
Content-Type: application/json

{
  "id": "integration-uuid",
  "configuration": {
    "actions": [
      {
        "type": "http_request",
        "config": { "url": "https://new-crm.com/api/customers", "method": "POST" }
      }
    ]
  }
}
```

---

## 🔔 **Webhook System**

### **Webhook Endpoints**

#### **Receive Webhook**
```http
POST /webhooks/{integrationId}
Content-Type: application/json

{
  "event": "order.created",
  "data": {
    "order_id": "uuid",
    "customer_id": "uuid",
    "total_amount": 2500.00
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "sha256=..."
}
```

### **Webhook Testing**

#### **Test Webhook**
```http
POST /webhooks/test
Content-Type: application/json

{
  "webhookUrl": "https://your-endpoint.com/webhook",
  "method": "POST",
  "payload": {
    "event": "test",
    "data": { "message": "Test webhook" }
  },
  "timeout": 10000,
  "retries": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "statusCode": 200,
    "responseTime": 150,
    "responseData": { "received": true },
    "attempts": 1
  }
}
```

### **Webhook Templates**

#### **Get Templates**
```http
GET /webhooks/test?category=order_events
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "order_created",
      "description": "Template for order creation events",
      "category": "order_events",
      "template": {
        "method": "POST",
        "headers": { "Content-Type": "application/json" },
        "payload": {
          "event": "order.created",
          "data": {
            "order_id": "{{order.id}}",
            "customer_id": "{{order.customer_id}}"
          }
        },
        "variables": [
          {
            "name": "order.id",
            "type": "string",
            "description": "Order ID",
            "required": true
          }
        ]
      }
    }
  ]
}
```

---

## 📤📥 **Import/Export System**

### **Data Import**

#### **Start Import Job**
```http
POST /import-export?action=import
Content-Type: application/json

{
  "type": "customers",
  "format": "csv",
  "data": "base64-encoded-csv-data",
  "options": {
    "updateExisting": true,
    "skipDuplicates": false,
    "validateData": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid",
    "status": "processing",
    "message": "Import job started successfully"
  }
}
```

### **Data Export**

#### **Start Export Job**
```http
POST /import-export?action=export
Content-Type: application/json

{
  "type": "inventory",
  "format": "excel",
  "filters": { "status": "in_stock" },
  "fields": ["sku", "name", "price", "quantity"],
  "options": {
    "includeMetadata": true,
    "compress": false
  }
}
```

### **Job Status**

#### **Check Job Status**
```http
GET /import-export?jobId=job-uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-uuid",
    "type": "import",
    "status": "completed",
    "progress": 100,
    "result": {
      "imported": 150,
      "errors": 2,
      "downloadUrl": "https://api.jewelia-crm.com/downloads/export-uuid"
    }
  }
}
```

---

## 📊 **Analytics & Monitoring**

### **API Usage Analytics**

#### **Get Analytics**
```http
GET /analytics/api-usage?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z&groupBy=day&apiKey=your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRequests": 15420,
      "successfulRequests": 15380,
      "failedRequests": 40,
      "averageResponseTime": 245
    },
    "timeline": [
      {
        "date": "2024-01-15",
        "requests": 520,
        "successful": 518,
        "failed": 2,
        "avgResponseTime": 230
      }
    ],
    "endpoints": [
      {
        "endpoint": "/customers",
        "requests": 5200,
        "successful": 5180,
        "failed": 20,
        "avgResponseTime": 180
      }
    ],
    "apiKeys": [
      {
        "apiKey": "key-prefix",
        "requests": 8200,
        "successful": 8180,
        "failed": 20
      }
    ]
  }
}
```

### **Log API Request**

#### **Log Request**
```http
POST /analytics/api-usage
Content-Type: application/json

{
  "endpoint": "/customers",
  "method": "GET",
  "apiKey": "your-api-key",
  "userId": "user-uuid",
  "statusCode": 200,
  "responseTime": 150,
  "requestSize": 1024,
  "responseSize": 2048,
  "userAgent": "Jewelia-API-Client/1.0",
  "ipAddress": "192.168.1.1"
}
```

---

## ❌ **Error Handling**

### **Standard Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Common Error Codes**
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or expired credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_ERROR`: Server internal error

### **Validation Errors**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    }
  ]
}
```

---

## 📚 **SDKs & Libraries**

### **JavaScript/TypeScript SDK**
```bash
npm install @jewelia/api-client
```

**Usage:**
```typescript
import { JeweliaClient } from '@jewelia/api-client'

const client = new JeweliaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.jewelia-crm.com/v1'
})

// List customers
const customers = await client.customers.list({
  page: 1,
  limit: 20,
  search: 'john'
})

// Create customer
const customer = await client.customers.create({
  full_name: 'Jane Smith',
  email: 'jane@example.com'
})
```

### **Python SDK**
```bash
pip install jewelia-api-client
```

**Usage:**
```python
from jewelia_api_client import JeweliaClient

client = JeweliaClient(
    api_key='your-api-key',
    base_url='https://api.jewelia-crm.com/v1'
)

# List customers
customers = client.customers.list(
    page=1,
    limit=20,
    search='john'
)

# Create customer
customer = client.customers.create({
    'full_name': 'Jane Smith',
    'email': 'jane@example.com'
})
```

---

## 💡 **Examples & Tutorials**

### **Complete Integration Example**

#### **1. Set up API Key**
```bash
# Create API key in Jewelia CRM dashboard
# Copy the generated key
export JEWELIA_API_KEY="your-api-key"
```

#### **2. Create Customer**
```bash
curl -X POST https://api.jewelia-crm.com/v1/customers \
  -H "Authorization: Bearer $JEWELIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  }'
```

#### **3. Create Inventory Item**
```bash
curl -X POST https://api.jewelia-crm.com/v1/inventory \
  -H "Authorization: Bearer $JEWELIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "RING-001",
    "name": "Diamond Ring",
    "category": "rings",
    "price": 2500.00,
    "quantity": 5
  }'
```

#### **4. Create Order**
```bash
curl -X POST https://api.jewelia-crm.com/v1/orders \
  -H "Authorization: Bearer $JEWELIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer-uuid",
    "items": [
      {
        "inventory_id": "inventory-uuid",
        "quantity": 1,
        "unit_price": 2500.00
      }
    ]
  }'
```

### **Webhook Integration Example**

#### **1. Set up Webhook Endpoint**
```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = 'your-webhook-secret'

@app.route('/webhook', methods=['POST'])
def webhook():
    # Verify signature
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()
    
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, f'sha256={expected_signature}'):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook
    data = request.json
    event_type = data['event']
    
    if event_type == 'order.created':
        # Handle order creation
        process_order_created(data['data'])
    elif event_type == 'customer.updated':
        # Handle customer update
        process_customer_updated(data['data'])
    
    return jsonify({'success': True})

def process_order_created(order_data):
    print(f"New order created: {order_data['order_id']}")
    # Your business logic here

def process_customer_updated(customer_data):
    print(f"Customer updated: {customer_data['customer_id']}")
    # Your business logic here

if __name__ == '__main__':
    app.run(debug=True)
```

#### **2. Configure Webhook in Jewelia CRM**
```bash
curl -X POST https://api.jewelia-crm.com/v1/webhooks \
  -H "Authorization: Bearer $JEWELIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "events": ["order.created", "customer.updated"],
    "secret": "your-webhook-secret"
  }'
```

---

## 📝 **Changelog**

### **Version 1.0.0 (2024-01-15)**
- Initial API release
- Core CRUD operations for customers, inventory, and orders
- Basic authentication and rate limiting
- Webhook system foundation

### **Version 1.1.0 (2024-01-20)**
- Integration marketplace
- Custom integration builder
- Enhanced webhook testing
- API analytics and monitoring

### **Version 1.2.0 (2024-02-01)**
- Jewelry industry specific integrations
- Advanced import/export capabilities
- Real-time data synchronization
- Enhanced error handling

---

## 🆘 **Support & Resources**

### **Documentation**
- **API Reference**: [https://docs.jewelia-crm.com/api](https://docs.jewelia-crm.com/api)
- **Integration Guide**: [https://docs.jewelia-crm.com/integrations](https://docs.jewelia-crm.com/integrations)
- **Webhook Guide**: [https://docs.jewelia-crm.com/webhooks](https://docs.jewelia-crm.com/webhooks)

### **Support**
- **Email**: api-support@jewelia-crm.com
- **Developer Forum**: [https://community.jewelia-crm.com](https://community.jewelia-crm.com)
- **Status Page**: [https://status.jewelia-crm.com](https://status.jewelia-crm.com)

### **SDK Repositories**
- **JavaScript/TypeScript**: [https://github.com/jewelia-crm/js-sdk](https://github.com/jewelia-crm/js-sdk)
- **Python**: [https://github.com/jewelia-crm/python-sdk](https://github.com/jewelia-crm/python-sdk)
- **PHP**: [https://github.com/jewelia-crm/php-sdk](https://github.com/jewelia-crm/php-sdk)

---

## 🔒 **Security & Compliance**

### **Data Protection**
- All API communications use TLS 1.3 encryption
- API keys are hashed using SHA-256
- Webhook signatures use HMAC-SHA256
- Rate limiting prevents abuse

### **Compliance**
- GDPR compliant data handling
- SOC 2 Type II certified
- ISO 27001 information security management
- Regular security audits and penetration testing

### **Best Practices**
- Rotate API keys regularly
- Use webhook signatures for verification
- Implement proper error handling
- Monitor API usage and set up alerts
- Use environment variables for sensitive data

---

*This documentation is maintained by the Jewelia CRM team. For the latest updates, visit our [GitHub repository](https://github.com/jewelia-crm/api-docs).*
