import { mockApi } from './mock-data'
import { useDemo } from './demo-context'
import { ordersService } from './services/OrdersService'
import { createSupabaseServerClient } from './supabase/server'
import { createSupabaseBrowserClient } from './supabase/browser'

export interface DiamondSpecifications {
  clarity: string;
  color: string;
  cut: string;
  caratWeight: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  measurements?: { length: number; width: number; depth: number };
  depthPercentage?: number;
  tablePercentage?: number;
  gradingLab?: string;
  reportNumber?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
  diamondSpecifications?: DiamondSpecifications;
}

export interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Diamond {
  id: string;
  inventory_item_id?: string;
  clarity: string;
  color: string;
  cut: string;
  carat_weight: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  grading_lab?: string;
  report_number?: string;
  depth_percentage?: number;
  table_percentage?: number;
  length?: number;
  width?: number;
  depth?: number;
  location?: string;
  status?: string;
  stock?: number;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Raw Materials' | 'Components' | 'Finished Goods' | 'Diamond';
  quantity: number;
  unit: 'grams' | 'pieces' | 'meters';
  location: 'Warehouse A' | 'Warehouse B' | 'Storage Room';
  diamondSpecifications?: DiamondSpecifications;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiService {
  inventory = {
    list: async (): Promise<InventoryItem[]> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching inventory:', error)
        return []
      }
    },

    get: async (id: string): Promise<InventoryItem | null> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching inventory item:', error)
        return null
      }
    },

    create: async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('inventory_items')
          .insert([{
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error creating inventory item:', error)
        throw error
      }
    },

    update: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('inventory_items')
          .update({
            ...item,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error updating inventory item:', error)
        throw error
      }
    },

    delete: async (id: string): Promise<void> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.error('Error deleting inventory item:', error)
        throw error
      }
    }
  }

  diamonds = {
    list: async (): Promise<Diamond[]> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('diamonds')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching diamonds:', error)
        return []
      }
    },
    get: async (id: string): Promise<Diamond | null> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('diamonds')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching diamond:', error)
        return null
      }
    },
    create: async (diamond: Omit<Diamond, 'id' | 'created_at' | 'updated_at'>): Promise<Diamond> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('diamonds')
          .insert([{
            ...diamond,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error creating diamond:', error)
        throw error
      }
    },
    update: async (id: string, diamond: Partial<Diamond>): Promise<Diamond> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { data, error } = await supabase
          .from('diamonds')
          .update({
            ...diamond,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error updating diamond:', error)
        throw error
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        const supabase = typeof window !== 'undefined' 
          ? createSupabaseBrowserClient() 
          : await createSupabaseServerClient()
        
        const { error } = await supabase
          .from('diamonds')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.error('Error deleting diamond:', error)
        throw error
      }
    }
  }

  // ... any other methods you have can remain as-is or be similarly stubbed ...
}

// Create a custom hook for API calls
export function useApi() {
  const { isDemoMode } = useDemo()

  // Use mock API in demo mode, real API otherwise
  const api = isDemoMode ? mockApi : {
    // Replace these with your actual API calls when backend is ready
    customers: {
      list: async () => {
        // TODO: Implement real API call
        return []
      },
      get: async (id: string) => {
        // TODO: Implement real API call
        return null
      },
      create: async (data: any) => {
        // TODO: Implement real API call
        return data
      },
      update: async (id: string, data: any) => {
        // TODO: Implement real API call
        return data
      },
      delete: async (id: string) => {
        // TODO: Implement real API call
        return { success: true }
      },
    },
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
      updateStatus: async (id: string, status: any) => {
        return ordersService.updateStatus(id, status)
      },
      getByCustomer: async (customerId: string) => {
        return ordersService.getByCustomer(customerId)
      },
      getStats: async () => {
        return ordersService.getStats()
      },
      search: async (query: string) => {
        return ordersService.search(query)
      }
    },
    inventory: {
      list: async (): Promise<InventoryItem[]> => {
        // TODO: Implement real API call
        return []
      },
      get: async (id: string): Promise<InventoryItem | null> => {
        // TODO: Implement real API call
        return null
      },
      create: async (data: any): Promise<InventoryItem> => {
        // TODO: Implement real API call
        return data
      },
      update: async (id: string, data: any): Promise<InventoryItem> => {
        // TODO: Implement real API call
        return data
      },
      delete: async (id: string): Promise<{ success: boolean }> => {
        // TODO: Implement real API call
        return { success: true }
      },
    },
  }

  return api
}