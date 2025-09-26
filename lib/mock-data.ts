import { faker } from '@faker-js/faker'

// Generate mock data for different entities
export const mockCustomers = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state(),
  zip: faker.location.zipCode(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))

export const mockProducts = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price()),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  category: faker.helpers.arrayElement(['Rings', 'Necklaces', 'Earrings', 'Bracelets']),
  stock: faker.number.int({ min: 0, max: 100 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))

export const mockOrders = Array.from({ length: 30 }, () => ({
  id: faker.string.uuid(),
  customerId: faker.helpers.arrayElement(mockCustomers).id,
  status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'cancelled']),
  total: parseFloat(faker.commerce.price()),
  items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
    id: faker.string.uuid(),
    productId: faker.helpers.arrayElement(mockProducts).id,
    quantity: faker.number.int({ min: 1, max: 5 }),
    price: parseFloat(faker.commerce.price()),
  })),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))

export const mockProjects = Array.from({ length: 25 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  status: faker.helpers.arrayElement(['planning', 'in_progress', 'review', 'completed']),
  customerId: faker.helpers.arrayElement(mockCustomers).id,
  startDate: faker.date.past(),
  dueDate: faker.date.future(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))

export const mockInventory = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  category: faker.helpers.arrayElement(['Raw Materials', 'Components', 'Finished Goods']),
  quantity: faker.number.int({ min: 0, max: 1000 }),
  unit: faker.helpers.arrayElement(['grams', 'pieces', 'meters']),
  location: faker.helpers.arrayElement(['Warehouse A', 'Warehouse B', 'Storage Room']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))

// Mock API functions
export const mockApi = {
  customers: {
    list: () => Promise.resolve(mockCustomers),
    get: (id: string) => Promise.resolve(mockCustomers.find(c => c.id === id)),
    create: (data: any) => Promise.resolve({ ...data, id: faker.string.uuid() }),
    update: (id: string, data: any) => Promise.resolve({ ...data, id }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
  products: {
    list: () => Promise.resolve(mockProducts),
    get: (id: string) => Promise.resolve(mockProducts.find(p => p.id === id)),
    create: (data: any) => Promise.resolve({ ...data, id: faker.string.uuid() }),
    update: (id: string, data: any) => Promise.resolve({ ...data, id }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
  orders: {
    list: () => Promise.resolve(mockOrders),
    get: (id: string) => Promise.resolve(mockOrders.find(o => o.id === id)),
    create: (data: any) => Promise.resolve({ ...data, id: faker.string.uuid() }),
    update: (id: string, data: any) => Promise.resolve({ ...data, id }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
  projects: {
    list: () => Promise.resolve(mockProjects),
    get: (id: string) => Promise.resolve(mockProjects.find(p => p.id === id)),
    create: (data: any) => Promise.resolve({ ...data, id: faker.string.uuid() }),
    update: (id: string, data: any) => Promise.resolve({ ...data, id }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
  inventory: {
    list: () => Promise.resolve(mockInventory),
    get: (id: string) => Promise.resolve(mockInventory.find(i => i.id === id)),
    create: (data: any) => Promise.resolve({ ...data, id: faker.string.uuid() }),
    update: (id: string, data: any) => Promise.resolve({ ...data, id }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
} 
 
 