type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: any
}

export const logger = {
  info: (message: string, metadata?: any) => {
    log('info', message, metadata)
  },

  warn: (message: string, metadata?: any) => {
    log('warn', message, metadata)
  },

  error: (message: string, metadata?: any) => {
    log('error', message, metadata)
  },

  debug: (message: string, metadata?: any) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, metadata)
    }
  },
}

async function log(level: LogLevel, message: string, metadata?: any) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    metadata,
  }

  // In production, this would send logs to a logging service
  // For now, we'll just console.log
  switch (level) {
    case 'error':
      console.error(entry)
      break
    case 'warn':
      console.warn(entry)
      break
    case 'debug':
      console.debug(entry)
      break
    default:
      console.log(entry)
  }

  // Store log in database for persistence
  // const { createClient } = await import('@supabase/supabase-js')
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // )

  // await supabase
  //   .from('logs')
  //   .insert({
  //     level,
  //     message,
  //     metadata,
  //     created_at: entry.timestamp,
  //   })
} 