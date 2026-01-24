import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isServer = typeof window === "undefined";

// Server-side logger with Pino
const serverLogger = isServer
  ? pino({
      level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
      transport: isProduction
        ? undefined
        : {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          },
      base: {
        env: process.env.NODE_ENV,
      },
      redact: [
        "password",
        "passwordHash",
        "token",
        "access_token",
        "refresh_token",
        "*.password",
        "*.passwordHash",
      ],
    })
  : null;

// Browser-safe logger interface
interface Logger {
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
  debug: (msg: string, data?: Record<string, unknown>) => void;
}

// Client-side logger (uses console)
const clientLogger: Logger = {
  info: (msg, data) => {
    if (!isProduction) {
      console.log(`[INFO] ${msg}`, data || "");
    }
  },
  warn: (msg, data) => {
    console.warn(`[WARN] ${msg}`, data || "");
  },
  error: (msg, data) => {
    console.error(`[ERROR] ${msg}`, data || "");
  },
  debug: (msg, data) => {
    if (!isProduction) {
      console.debug(`[DEBUG] ${msg}`, data || "");
    }
  },
};

// Unified logger that works on both server and client
export const logger: Logger = isServer
  ? {
      info: (msg, data) => serverLogger?.info(data || {}, msg),
      warn: (msg, data) => serverLogger?.warn(data || {}, msg),
      error: (msg, data) => serverLogger?.error(data || {}, msg),
      debug: (msg, data) => serverLogger?.debug(data || {}, msg),
    }
  : clientLogger;

// Request logging helper for API routes
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  organizationId?: string
) {
  logger.info("API Request", {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    userId,
    organizationId,
  });
}

// Error logging helper
export function logError(
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error("Error occurred", {
    message: errorMessage,
    stack: errorStack,
    ...context,
  });
}

// Audit log helper for important actions
export function logAudit(
  action: string,
  userId: string,
  organizationId: string,
  details?: Record<string, unknown>
) {
  logger.info("Audit", {
    action,
    userId,
    organizationId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}
