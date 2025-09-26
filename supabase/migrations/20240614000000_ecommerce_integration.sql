-- E-commerce Integrations Table
CREATE TABLE IF NOT EXISTS ecommerce_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    platform text NOT NULL CHECK (platform IN ('shopify', 'woocommerce')),
    store_url text NOT NULL,
    api_key text NOT NULL,
    connected_at timestamptz DEFAULT now(),
    last_sync_at timestamptz,
    status text DEFAULT 'connected',
    consumer_key text,
    consumer_secret text
);

-- E-commerce Sync Logs Table
CREATE TABLE IF NOT EXISTS ecommerce_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id uuid REFERENCES ecommerce_integrations(id) ON DELETE CASCADE,
    action text NOT NULL, -- e.g., 'upload', 'sync-inventory'
    status text NOT NULL, -- e.g., 'success', 'error'
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_ecommerce_integrations_user ON ecommerce_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_sync_logs_integration ON ecommerce_sync_logs(integration_id); 