// Mock data for logistics components
// This file contains the mock data that was previously exported from page components

export interface LogisticsItem {
  id: string;
  name: string;
  customer: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  notes?: string;
  progress: number;
  timeRemaining: string;
}

export const mockPackingData: LogisticsItem[] = [
  {
    id: 'ORD-1001',
    name: 'Custom Engagement Ring',
    customer: 'Sophia Chen',
    dueDate: 'Jul 25',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Premium packaging for platinum engagement ring with diamond accents.',
    progress: 75,
    timeRemaining: '2 hours',
  },
  {
    id: 'ORD-1002',
    name: 'Diamond Necklace Set',
    customer: 'Michael Rodriguez',
    dueDate: 'Jul 26',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Standard packaging for 18k gold necklace with matching earrings.',
    progress: 0,
    timeRemaining: '1 day',
  },
  {
    id: 'ORD-1003',
    name: 'Sapphire Ring',
    customer: 'Emily Watson',
    dueDate: 'Jul 24',
    status: 'completed',
    priority: 'low',
    assignee: 'Sarah Johnson',
    notes: 'Completed packaging for blue sapphire ring.',
    progress: 100,
    timeRemaining: 'Completed',
  },
  {
    id: 'ORD-1004',
    name: 'Pearl Earrings',
    customer: 'James Wilson',
    dueDate: 'Jul 27',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Elegant packaging for freshwater pearl earrings.',
    progress: 0,
    timeRemaining: '3 days',
  },
  {
    id: 'ORD-1005',
    name: 'Gold Bracelet',
    customer: 'Lisa Anderson',
    dueDate: 'Jul 25',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Luxury packaging for 14k gold bracelet.',
    progress: 50,
    timeRemaining: '4 hours',
  }
];

export const mockShippingData: LogisticsItem[] = [
  {
    id: 'ORD-1001',
    name: 'Custom Engagement Ring',
    customer: 'Sophia Chen',
    dueDate: 'Jul 26',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Express shipping for platinum engagement ring with insurance.',
    progress: 75,
    timeRemaining: '2 hours',
  },
  {
    id: 'ORD-1002',
    name: 'Diamond Necklace Set',
    customer: 'Michael Rodriguez',
    dueDate: 'Jul 27',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Standard shipping for 18k gold necklace set.',
    progress: 0,
    timeRemaining: '1 day',
  },
  {
    id: 'ORD-1003',
    name: 'Sapphire Ring',
    customer: 'Emily Watson',
    dueDate: 'Jul 25',
    status: 'completed',
    priority: 'low',
    assignee: 'Sarah Johnson',
    notes: 'Successfully shipped sapphire ring.',
    progress: 100,
    timeRemaining: 'Completed',
  },
  {
    id: 'ORD-1004',
    name: 'Pearl Earrings',
    customer: 'James Wilson',
    dueDate: 'Jul 28',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Scheduled pickup for pearl earrings.',
    progress: 0,
    timeRemaining: '4 days',
  },
  {
    id: 'ORD-1005',
    name: 'Gold Bracelet',
    customer: 'Lisa Anderson',
    dueDate: 'Jul 26',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Priority shipping for gold bracelet.',
    progress: 60,
    timeRemaining: '6 hours',
  }
];

export const mockDeliveryData: LogisticsItem[] = [
  {
    id: 'ORD-1001',
    name: 'Custom Engagement Ring',
    customer: 'Sophia Chen',
    dueDate: 'Jul 27',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Scheduled delivery for platinum engagement ring with signature required.',
    progress: 75,
    timeRemaining: '2 hours',
  },
  {
    id: 'ORD-1002',
    name: 'Diamond Necklace Set',
    customer: 'Michael Rodriguez',
    dueDate: 'Jul 28',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Standard delivery for 18k gold necklace set.',
    progress: 0,
    timeRemaining: '1 day',
  },
  {
    id: 'ORD-1003',
    name: 'Sapphire Ring',
    customer: 'Emily Watson',
    dueDate: 'Jul 26',
    status: 'completed',
    priority: 'low',
    assignee: 'Sarah Johnson',
    notes: 'Successfully delivered sapphire ring.',
    progress: 100,
    timeRemaining: 'Completed',
  },
  {
    id: 'ORD-1004',
    name: 'Pearl Earrings',
    customer: 'James Wilson',
    dueDate: 'Jul 29',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Scheduled delivery for pearl earrings.',
    progress: 0,
    timeRemaining: '5 days',
  },
  {
    id: 'ORD-1005',
    name: 'Gold Bracelet',
    customer: 'Lisa Anderson',
    dueDate: 'Jul 27',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Priority delivery for gold bracelet.',
    progress: 80,
    timeRemaining: '4 hours',
  }
];
