/**
 * Classe oficial para erros de infraestrutura ou retornos do Backend.
 * Captura metadados vitais para suporte e observabilidade.
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  traceId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
    traceId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.traceId = params.traceId;

    // Garante que o instanceof funcione corretamente
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Classe oficial para erros de regras de negócio (Domínio).
 * Usada quando uma operação é tecnicamente válida mas viola uma regra de negócio.
 */
export class DomainError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;

    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Utilitário para parsear a resposta de erro vinda do servidor e converter em ApiError.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  let errorPayload: { code: string; message: string; details?: any; traceId?: string };

  try {
    const json = await response.json();
    
    // Suporta o padrão { error: { code, message, ... } }
    if (json && json.error && typeof json.error === 'object') {
      errorPayload = {
        code: json.error.code || 'UNKNOWN_CODE',
        message: json.error.message || response.statusText,
        details: json.error.details,
        traceId: json.error.traceId
      };
    } else {
      // Fallback para outros formatos
      errorPayload = {
        code: json.code || 'UNKNOWN_CODE',
        message: json.message || json.error || response.statusText,
        details: json.details || json,
      };
    }
  } catch (err) {
    errorPayload = {
      code: 'PARSE_ERROR',
      message: 'Não foi possível ler os detalhes do erro do servidor',
    };
  }

  return new ApiError({
    code: errorPayload.code,
    message: errorPayload.message,
    status: response.status,
    details: errorPayload.details,
    traceId: errorPayload.traceId,
  });
}
