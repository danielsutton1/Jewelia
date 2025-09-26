-- Accounts Receivable Table
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    invoice_number text NOT NULL,
    amount numeric NOT NULL,
    due_date date,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    notes text
);

-- Accounts Payable Table
CREATE TABLE IF NOT EXISTS accounts_payable (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
    bill_number text NOT NULL,
    amount numeric NOT NULL,
    due_date date,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    notes text
); 