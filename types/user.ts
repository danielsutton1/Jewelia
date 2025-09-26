export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'manager';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
} 