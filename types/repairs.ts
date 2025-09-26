export type RepairStatus = 'received' | 'in_progress' | 'completed' | 'delivered';

export interface RepairItem {
    id: string;
    repair_id: string;
    name: string;
    description?: string;
    material?: string;
    condition?: string;
    photos: string[];
    created_at: string;
    updated_at: string;
}

export interface RepairPhoto {
    id: string;
    repair_id: string;
    item_id?: string;
    url: string;
    type: 'before' | 'after' | 'during' | 'other';
    description?: string;
    taken_at: string;
    created_at: string;
}

export interface RepairEstimate {
    id: string;
    repair_id: string;
    estimated_cost: number;
    estimated_completion_date: string;
    parts_list?: {
        name: string;
        quantity: number;
        cost: number;
    }[];
    labor_hours?: number;
    labor_rate?: number;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

export interface RepairHistory {
    id: string;
    repair_id: string;
    user_id: string;
    action: string;
    details?: Record<string, any>;
    created_at: string;
}

export interface Repair {
    id: string;
    customer_id: string;
    status: RepairStatus;
    description: string;
    estimated_completion?: string | null;
    actual_completion?: string | null;
    cost?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    items?: RepairItem[];
    photos?: RepairPhoto[];
    estimates?: RepairEstimate[];
    history?: RepairHistory[];
} 