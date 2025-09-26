export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
} 