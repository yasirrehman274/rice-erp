const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function defaultMessage(status: number): string {
  if (status === 400) return "The submitted information is invalid.";
  if (status === 401) return "You are not authorized. Please sign in.";
  if (status === 403) return "You do not have permission to do this.";
  if (status === 404) return "Record not found.";
  if (status === 409) return "A record with this value already exists.";
  if (status >= 500) return "Server error. Please try again.";
  return "Request failed.";
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    throw new ApiError(
      aborted
        ? "The server took too long to respond. Please try again."
        : "Cannot reach the server. Make sure the backend is running.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? defaultMessage(response.status);
    throw new ApiError(message, response.status);
  }

  return data as T;
}
