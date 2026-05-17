export type ApiSuccess<TData> = {
  status: 'success';
  data: TData;
  error: null;
};

export type ApiFailure = {
  status: 'error';
  data: null;
  error: {
    code: string;
    message: string;
    correlationId?: string;
  };
};

export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure;

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode: number,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export class AdminApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getIdToken: () => Promise<string>,
  ) {}

  async request<TData>(path: string, options: RequestOptions = {}): Promise<TData> {
    const token = await this.getIdToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const envelope = await response.json() as ApiEnvelope<TData>;

    if (envelope.status === 'error') {
      throw new ApiClientError(
        envelope.error.message,
        envelope.error.code,
        response.status,
        envelope.error.correlationId,
      );
    }

    return envelope.data;
  }
}
