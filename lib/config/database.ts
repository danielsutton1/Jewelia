import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface DatabaseConfig {
  url: string;
  key: string;
  poolSize: number;
  retryAttempts: number;
  retryDelay: number;
}

function getEnv() {
  return process.env.NODE_ENV || 'development';
}

function getConfigs(): Record<string, DatabaseConfig> {
  return {
    development: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      poolSize: 5,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    production: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      poolSize: 20,
      retryAttempts: 5,
      retryDelay: 2000,
    },
  };
}

let supabase: SupabaseClient | null = null;

export function getDatabaseClient(): SupabaseClient {
  if (!supabase) {
    const env = getEnv();
    const configs = getConfigs();
    const config = configs[env];
    if (!config.url) throw new Error('Supabase URL is not set');
    if (!config.key) throw new Error('Supabase Key is not set');
    supabase = createClient(config.url, config.key, {});
  }
  return supabase;
}

export async function retryConnection(attempts?: number): Promise<SupabaseClient> {
  const env = getEnv();
  const configs = getConfigs();
  const config = configs[env];
  let lastError;
  const maxAttempts = attempts ?? config.retryAttempts;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const client = getDatabaseClient();
      const { error } = await client.rpc('health_check');
      if (!error) return client;
      lastError = error;
    } catch (err) {
      lastError = err;
    }
    await new Promise(res => setTimeout(res, config.retryDelay));
  }
  throw new Error('Database connection failed: ' + lastError);
}

export async function healthCheck() {
  try {
    const client = getDatabaseClient();
    const { error } = await client.rpc('health_check');
    return { status: error ? 'fail' : 'ok', error };
  } catch (err) {
    return { status: 'fail', error: err };
  }
} 