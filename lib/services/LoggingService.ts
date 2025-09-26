// 🔧 SIMPLE LOGGING SERVICE
// Basic logging functionality for the team management system

export const logger = {
  info: (message: string, metadata?: any) => {
    console.log(`[INFO] ${message}`, metadata || '')
  },
  
  error: (message: string, error?: any, metadata?: any) => {
    console.error(`[ERROR] ${message}`, error || '', metadata || '')
  },
  
  warn: (message: string, metadata?: any) => {
    console.warn(`[WARN] ${message}`, metadata || '')
  },
  
  debug: (message: string, metadata?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, metadata || '')
    }
  }
}

export enum LogCategory {
  API = 'api',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  TEAM_MANAGEMENT = 'team_management',
  GENERAL = 'general'
}
