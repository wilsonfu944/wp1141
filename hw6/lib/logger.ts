type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function logger(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
  };
  if (data) {
    logEntry.data = data;
  }

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export const log = {
  info: (message: string, data?: unknown) => logger('info', message, data),
  warn: (message: string, data?: unknown) => logger('warn', message, data),
  error: (message: string, data?: unknown) => logger('error', message, data),
  debug: (message: string, data?: unknown) => logger('debug', message, data),
};

