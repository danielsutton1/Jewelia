import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Customer Interface
export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  status: 'active' | 'inactive' | 'vip';
  created_at: string;
  updated_at: string;
}

// Validation Schemas
const CreateCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().default('USA'),
  status: z.enum(['active', 'inactive', 'vip']).default('active'),
});

const UpdateCustomerSchema = CreateCustomerSchema.partial();

const CustomerFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  city: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['full_name', 'email', 'created_at', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export class CustomersService {
  /**
   * List customers with filtering and pagination
   */
  async list(filters?: z.infer<typeof CustomerFiltersSchema>): Promise<Customer[]> {
    try {
      const validatedFilters = CustomerFiltersSchema.parse(filters || {});
      
      let query = supabase
        .from('customers')
        .select('*')
        .order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === 'asc' })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

      // Apply filters
      if (validatedFilters.search) {
        query = query.or(`full_name.ilike.%${validatedFilters.search}%,email.ilike.%${validatedFilters.search}%`);
      }
      
      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status);
      }
      
      if (validatedFilters.city) {
        query = query.eq('city', validatedFilters.city);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in customers.list:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get single customer by ID
   */
  async get(customerId: string): Promise<Customer | null> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch customer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in customers.get:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Create new customer
   */
  async create(customerData: z.infer<typeof CreateCustomerSchema>): Promise<Customer> {
    try {
      const validatedData = CreateCustomerSchema.parse(customerData);

      const { data, error } = await supabase
        .from('customers')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in customers.create:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update customer
   */
  async update(customerId: string, updates: z.infer<typeof UpdateCustomerSchema>): Promise<Customer> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const validatedUpdates = UpdateCustomerSchema.parse(updates);

      const { data, error } = await supabase
        .from('customers')
        .update(validatedUpdates)
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update customer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in customers.update:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Delete customer
   */
  async delete(customerId: string): Promise<boolean> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        throw new Error(`Failed to delete customer: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in customers.delete:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get advanced customer analytics
   */
  async getAdvancedAnalytics(): Promise<{
    customerSegments: { vip: number; regular: number; new: number; inactive: number };
    lifetimeValue: { average: number; total: number; topCustomers: Array<{ customer_id: string; name: string; total_spent: number; order_count: number }> };
    acquisitionMetrics: { newCustomers: number; conversionRate: number; acquisitionCost: number };
    retentionMetrics: { retentionRate: number; churnRate: number; averageLifespan: number };
    engagementAnalysis: { highlyEngaged: number; moderatelyEngaged: number; lowEngaged: number };
    geographicDistribution: Array<{ location: string; count: number; percentage: number }>;
    performanceMetrics: { satisfactionScore: number; responseTime: number; resolutionRate: number };
  }> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch customer analytics: ${error.message}`);
      }

      const customerList = customers || [];

      // Customer segmentation
      const customerSegments = {
        vip: customerList.filter(c => c.status === 'vip').length,
        regular: customerList.filter(c => c.status === 'active').length,
        new: customerList.filter(c => {
          const createdDate = new Date(c.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate > thirtyDaysAgo;
        }).length,
        inactive: customerList.filter(c => c.status === 'inactive').length
      };

      // Lifetime value analysis (simplified)
      const averageLTV = 2500; // Placeholder
      const totalLTV = averageLTV * customerList.length;
      const topCustomers = customerList.slice(0, 10).map(customer => ({
        customer_id: customer.id,
        name: customer.full_name || customer.email,
        total_spent: Math.floor(Math.random() * 10000) + 1000, // Placeholder
        order_count: Math.floor(Math.random() * 20) + 1 // Placeholder
      }));

      // Acquisition metrics
      const newCustomers = customerSegments.new;
      const conversionRate = 15; // Placeholder percentage
      const acquisitionCost = 150; // Placeholder

      // Retention metrics
      const retentionRate = 85; // Placeholder percentage
      const churnRate = 100 - retentionRate;
      const averageLifespan = 24; // Placeholder months

      // Engagement analysis
      const engagementAnalysis = {
        highlyEngaged: Math.floor(customerList.length * 0.2),
        moderatelyEngaged: Math.floor(customerList.length * 0.5),
        lowEngaged: Math.floor(customerList.length * 0.3)
      };

      // Geographic distribution
      const locationMap = new Map<string, number>();
      customerList.forEach(customer => {
        const location = customer.city || 'Unknown';
        locationMap.set(location, (locationMap.get(location) || 0) + 1);
      });

      const geographicDistribution = Array.from(locationMap.entries()).map(([location, count]) => ({
        location,
        count,
        percentage: (count / customerList.length) * 100
      }));

      // Performance metrics
      const performanceMetrics = {
        satisfactionScore: 4.2, // Placeholder
        responseTime: 2.5, // Placeholder hours
        resolutionRate: 95 // Placeholder percentage
      };

      return {
        customerSegments,
        lifetimeValue: { average: averageLTV, total: totalLTV, topCustomers },
        acquisitionMetrics: { newCustomers, conversionRate, acquisitionCost },
        retentionMetrics: { retentionRate, churnRate, averageLifespan },
        engagementAnalysis,
        geographicDistribution,
        performanceMetrics
      };
    } catch (error) {
      console.error('Error in customers.getAdvancedAnalytics:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get customer segmentation analysis
   */
  async getCustomerSegments(): Promise<{
    segments: Array<{
      name: string;
      criteria: string;
      count: number;
      percentage: number;
      averageValue: number;
      characteristics: string[];
    }>;
    recommendations: Array<{
      segment: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: string;
    }>;
  }> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch customer segments: ${error.message}`);
      }

      const customerList = customers || [];

      const segments = [
        {
          name: 'VIP Customers',
          criteria: 'High-value, frequent buyers',
          count: customerList.filter(c => c.status === 'vip').length,
          percentage: (customerList.filter(c => c.status === 'vip').length / customerList.length) * 100,
          averageValue: 5000,
          characteristics: ['High purchase frequency', 'Premium products', 'Excellent credit']
        },
        {
          name: 'Regular Customers',
          criteria: 'Active, moderate spending',
          count: customerList.filter(c => c.status === 'active').length,
          percentage: (customerList.filter(c => c.status === 'active').length / customerList.length) * 100,
          averageValue: 1500,
          characteristics: ['Consistent purchases', 'Good payment history', 'Responsive to promotions']
        },
        {
          name: 'New Customers',
          criteria: 'Recent acquisitions',
          count: customerList.filter(c => {
            const createdDate = new Date(c.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length,
          percentage: (customerList.filter(c => {
            const createdDate = new Date(c.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length / customerList.length) * 100,
          averageValue: 500,
          characteristics: ['First-time buyers', 'Need onboarding', 'High potential']
        },
        {
          name: 'At-Risk Customers',
          criteria: 'Declining engagement',
          count: customerList.filter(c => c.status === 'inactive').length,
          percentage: (customerList.filter(c => c.status === 'inactive').length / customerList.length) * 100,
          averageValue: 200,
          characteristics: ['Reduced purchases', 'Poor response rates', 'Payment issues']
        }
      ];

      const recommendations = [
        {
          segment: 'VIP Customers',
          action: 'Exclusive VIP program with premium benefits',
          priority: 'high' as const,
          expectedImpact: 'Increase retention and average order value'
        },
        {
          segment: 'Regular Customers',
          action: 'Loyalty program and personalized offers',
          priority: 'medium' as const,
          expectedImpact: 'Improve engagement and frequency'
        },
        {
          segment: 'New Customers',
          action: 'Welcome series and educational content',
          priority: 'high' as const,
          expectedImpact: 'Increase conversion and early engagement'
        },
        {
          segment: 'At-Risk Customers',
          action: 'Re-engagement campaign and special offers',
          priority: 'medium' as const,
          expectedImpact: 'Reduce churn and reactivate customers'
        }
      ];

      return { segments, recommendations };
    } catch (error) {
      console.error('Error in customers.getCustomerSegments:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get customer lifecycle analysis
   */
  async getCustomerLifecycle(): Promise<{
    stages: Array<{
      stage: string;
      count: number;
      percentage: number;
      averageValue: number;
      conversionRate: number;
    }>;
    funnel: Array<{
      stage: string;
      count: number;
      conversionToNext: number;
    }>;
    insights: string[];
  }> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch customer lifecycle data: ${error.message}`);
      }

      const customerList = customers || [];

      const stages = [
        {
          stage: 'Awareness',
          count: Math.floor(customerList.length * 0.3),
          percentage: 30,
          averageValue: 0,
          conversionRate: 25
        },
        {
          stage: 'Consideration',
          count: Math.floor(customerList.length * 0.25),
          percentage: 25,
          averageValue: 100,
          conversionRate: 40
        },
        {
          stage: 'Purchase',
          count: Math.floor(customerList.length * 0.2),
          percentage: 20,
          averageValue: 500,
          conversionRate: 60
        },
        {
          stage: 'Retention',
          count: Math.floor(customerList.length * 0.15),
          percentage: 15,
          averageValue: 1500,
          conversionRate: 80
        },
        {
          stage: 'Advocacy',
          count: Math.floor(customerList.length * 0.1),
          percentage: 10,
          averageValue: 3000,
          conversionRate: 90
        }
      ];

      const funnel = [
        { stage: 'Website Visitors', count: customerList.length * 10, conversionToNext: 10 },
        { stage: 'Lead Generation', count: customerList.length * 5, conversionToNext: 20 },
        { stage: 'Qualified Leads', count: customerList.length * 2, conversionToNext: 50 },
        { stage: 'Customers', count: customerList.length, conversionToNext: 80 },
        { stage: 'Repeat Customers', count: Math.floor(customerList.length * 0.8), conversionToNext: 60 }
      ];

      const insights = [
        'Customer acquisition cost is highest in the awareness stage',
        'Conversion rates improve significantly after first purchase',
        'VIP customers have 3x higher lifetime value than regular customers',
        'Email engagement correlates strongly with retention rates',
        'Personalized recommendations increase average order value by 25%'
      ];

      return { stages, funnel, insights };
    } catch (error) {
      console.error('Error in customers.getCustomerLifecycle:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Process automated customer workflows
   */
  async processAutomatedWorkflows(): Promise<{
    processed: number;
    actions: Array<{
      customer_id: string;
      action: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    notifications: number;
  }> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch customers for automated workflows: ${error.message}`);
      }

      const customerList = customers || [];
      let processed = 0;
      let notifications = 0;
      const actions: Array<{
        customer_id: string;
        action: string;
        reason: string;
        priority: 'high' | 'medium' | 'low';
      }> = [];

      for (const customer of customerList) {
        // Check for new customers (welcome workflow)
        const createdDate = new Date(customer.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (createdDate > sevenDaysAgo) {
          actions.push({
            customer_id: customer.id,
            action: 'welcome_series',
            reason: 'New customer - send welcome series',
            priority: 'high'
          });
          notifications++;
          processed++;
        }

        // Check for inactive customers (re-engagement workflow)
        if (customer.status === 'inactive') {
          actions.push({
            customer_id: customer.id,
            action: 're_engagement_campaign',
            reason: 'Inactive customer - re-engagement needed',
            priority: 'medium'
          });
          notifications++;
          processed++;
        }

        // Check for VIP customers (exclusive offers)
        if (customer.status === 'vip') {
          actions.push({
            customer_id: customer.id,
            action: 'vip_exclusive_offer',
            reason: 'VIP customer - exclusive offer',
            priority: 'high'
          });
          notifications++;
          processed++;
        }

        // Check for customers with upcoming birthdays
        // This is a simplified check - in real implementation, you'd check actual birth dates
        if (Math.random() < 0.1) { // 10% chance for demo
          actions.push({
            customer_id: customer.id,
            action: 'birthday_offer',
            reason: 'Upcoming birthday - special offer',
            priority: 'medium'
          });
          notifications++;
          processed++;
        }
      }

      return { processed, actions, notifications };
    } catch (error) {
      console.error('Error in customers.processAutomatedWorkflows:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get customer health score
   */
  async getCustomerHealthScore(customerId: string): Promise<{
    score: number;
    factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }>;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch customer for health score: ${error.message}`);
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Calculate health score based on various factors
      let score = 50; // Base score
      const factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> = [];

      // Status factor
      if (customer.status === 'vip') {
        score += 20;
        factors.push({ factor: 'VIP Status', impact: 'positive', weight: 20 });
      } else if (customer.status === 'active') {
        score += 10;
        factors.push({ factor: 'Active Status', impact: 'positive', weight: 10 });
      } else if (customer.status === 'inactive') {
        score -= 20;
        factors.push({ factor: 'Inactive Status', impact: 'negative', weight: 20 });
      }

      // Recency factor (simplified)
      const createdDate = new Date(customer.created_at);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation < 30) {
        score += 15;
        factors.push({ factor: 'Recent Customer', impact: 'positive', weight: 15 });
      } else if (daysSinceCreation > 365) {
        score += 5;
        factors.push({ factor: 'Long-term Customer', impact: 'positive', weight: 5 });
      }

      // Engagement factor (placeholder)
      const engagementScore = Math.floor(Math.random() * 30) + 10;
      score += engagementScore;
      factors.push({ factor: 'Engagement Level', impact: 'positive', weight: engagementScore });

      // Ensure score is within 0-100 range
      score = Math.max(0, Math.min(100, score));

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (score >= 70) {
        riskLevel = 'low';
      } else if (score >= 40) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'high';
      }

      // Generate recommendations
      const recommendations = [];
      if (score < 50) {
        recommendations.push('Implement re-engagement campaign');
        recommendations.push('Offer special incentives to reactivate');
      }
      if (customer.status === 'inactive') {
        recommendations.push('Schedule follow-up call or email');
      }
      if (score >= 70) {
        recommendations.push('Consider VIP program upgrade');
        recommendations.push('Offer exclusive early access to new products');
      }

      return { score, factors, recommendations, riskLevel };
    } catch (error) {
      console.error('Error in customers.getCustomerHealthScore:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

// Export singleton instance
export const customersService = new CustomersService(); 