import { ApiError, DomainError } from '@/infra/http/errors';

/**
 * Logger estruturado para garantir rastreabilidade e observabilidade.
 * Evita o uso genérico de console.error e permite integração futura com Sentry/Datadog.
 */
export const logger = {
  error: (err: unknown) => {
    if (err instanceof ApiError) {
      console.error(`[API ERROR] ${err.code} (Status: ${err.status})`, {
        traceId: err.traceId,
        message: err.message,
        details: err.details,
      });
    } else if (err instanceof DomainError) {
      console.warn(`[DOMAIN ERROR] ${err.code}: ${err.message}`);
    } else if (err instanceof Error) {
      console.error(`[INTERNAL ERROR] ${err.name}: ${err.message}`, {
        stack: err.stack,
      });
    } else {
      console.error("[UNKNOWN FATAL ERROR]", err);
    }
  },

  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, context);
  },

  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context);
  }
};
