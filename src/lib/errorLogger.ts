/**
 * Centralized Error Logger for the application
 * Provides consistent error logging with context and optional reporting
 */

type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface LoggedError {
  message: string;
  level: ErrorLevel;
  timestamp: string;
  context?: ErrorContext;
  stack?: string;
}

// Store recent errors for debugging
const errorHistory: LoggedError[] = [];
const MAX_ERROR_HISTORY = 100;

/**
 * Format error for consistent logging
 */
function formatError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: JSON.stringify(error) };
}

/**
 * Log an error with context
 */
export function logError(
  error: unknown,
  context?: ErrorContext,
  level: ErrorLevel = 'error'
): void {
  const { message, stack } = formatError(error);
  
  const logEntry: LoggedError = {
    message,
    level,
    timestamp: new Date().toISOString(),
    context,
    stack,
  };

  // Add to history
  errorHistory.unshift(logEntry);
  if (errorHistory.length > MAX_ERROR_HISTORY) {
    errorHistory.pop();
  }

  // Console output with styling
  const prefix = context?.component ? `[${context.component}]` : '[App]';
  const actionPrefix = context?.action ? `(${context.action})` : '';
  
  switch (level) {
    case 'debug':
      console.debug(`🔍 ${prefix}${actionPrefix}`, message, context?.metadata || '');
      break;
    case 'info':
      console.info(`ℹ️ ${prefix}${actionPrefix}`, message, context?.metadata || '');
      break;
    case 'warn':
      console.warn(`⚠️ ${prefix}${actionPrefix}`, message, context?.metadata || '');
      break;
    case 'error':
      console.error(`❌ ${prefix}${actionPrefix}`, message, stack || '', context?.metadata || '');
      break;
    case 'critical':
      console.error(`🚨 CRITICAL ${prefix}${actionPrefix}`, message, stack || '', context?.metadata || '');
      break;
  }
}

/**
 * Log a database error with automatic context extraction
 */
export function logDatabaseError(
  error: unknown,
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert',
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    component: 'Database',
    action: `${operation.toUpperCase()} ${table}`,
    metadata: additionalContext,
  });
}

/**
 * Log an API/Edge Function error
 */
export function logApiError(
  error: unknown,
  endpoint: string,
  method: string = 'POST',
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    component: 'API',
    action: `${method} ${endpoint}`,
    metadata: additionalContext,
  });
}

/**
 * Log a component error
 */
export function logComponentError(
  error: unknown,
  componentName: string,
  action?: string,
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    component: componentName,
    action,
    metadata: additionalContext,
  });
}

/**
 * Log a payment error
 */
export function logPaymentError(
  error: unknown,
  paymentMethod: string,
  action: string,
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    component: 'Payment',
    action: `${paymentMethod}: ${action}`,
    metadata: additionalContext,
  }, 'critical');
}

/**
 * Log an authentication error
 */
export function logAuthError(
  error: unknown,
  action: string,
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    component: 'Auth',
    action,
    metadata: additionalContext,
  });
}

/**
 * Get recent error history for debugging
 */
export function getErrorHistory(): LoggedError[] {
  return [...errorHistory];
}

/**
 * Clear error history
 */
export function clearErrorHistory(): void {
  errorHistory.length = 0;
}

/**
 * Create a scoped logger for a specific component
 */
export function createLogger(componentName: string) {
  return {
    debug: (message: string, metadata?: Record<string, unknown>) =>
      logError(message, { component: componentName, metadata }, 'debug'),
    info: (message: string, metadata?: Record<string, unknown>) =>
      logError(message, { component: componentName, metadata }, 'info'),
    warn: (message: string, metadata?: Record<string, unknown>) =>
      logError(message, { component: componentName, metadata }, 'warn'),
    error: (error: unknown, action?: string, metadata?: Record<string, unknown>) =>
      logError(error, { component: componentName, action, metadata }, 'error'),
    critical: (error: unknown, action?: string, metadata?: Record<string, unknown>) =>
      logError(error, { component: componentName, action, metadata }, 'critical'),
  };
}

export default {
  logError,
  logDatabaseError,
  logApiError,
  logComponentError,
  logPaymentError,
  logAuthError,
  getErrorHistory,
  clearErrorHistory,
  createLogger,
};
