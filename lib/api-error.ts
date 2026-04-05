import type { NodeError } from "@/lib/types";

interface ErrorResponseBody {
  error?: unknown;
  statusCode?: unknown;
}

export async function parseApiErrorResponse(opts: {
  response: Response;
}): Promise<NodeError> {
  const { response } = opts;
  const fallbackStatusCode = response.status || 500;

  let body: ErrorResponseBody | null = null;
  try {
    body = (await response.clone().json()) as ErrorResponseBody;
  } catch {
    body = null;
  }

  const statusFromBody =
    typeof body?.statusCode === "number" ? body.statusCode : undefined;
  const statusCode = response.status || statusFromBody || 500;

  const messageFromBody =
    typeof body?.error === "string" && body.error.trim().length > 0
      ? body.error
      : undefined;

  if (messageFromBody) {
    return { message: messageFromBody, statusCode };
  }

  const text = await response.text();
  if (text.trim().length > 0) {
    return { message: text, statusCode };
  }

  return {
    message: `Request failed with status ${fallbackStatusCode}`,
    statusCode,
  };
}

export function parseUnknownError(opts: { error: unknown }): NodeError {
  const candidate = opts.error as {
    message?: unknown;
    statusCode?: unknown;
    cause?: { statusCode?: unknown };
  };

  let statusCode = 500;
  if (typeof candidate.statusCode === "number") {
    statusCode = candidate.statusCode;
  } else if (typeof candidate.cause?.statusCode === "number") {
    statusCode = candidate.cause.statusCode;
  }

  const message =
    typeof candidate.message === "string" && candidate.message.trim().length > 0
      ? candidate.message
      : "Unexpected error";

  return { message, statusCode };
}

export function apiErrorToResponse(opts: {
  error: unknown;
  fallbackMessage: string;
}): Response {
  const parsed = parseUnknownError({ error: opts.error });
  const message =
    parsed.message === "Unexpected error"
      ? opts.fallbackMessage
      : parsed.message;

  return Response.json(
    { error: message, statusCode: parsed.statusCode },
    { status: parsed.statusCode }
  );
}
