import { describe, expect, it } from "vitest";
import {
  apiErrorToResponse,
  parseApiErrorResponse,
  parseUnknownError,
} from "@/lib/api-error";

describe("parseApiErrorResponse", () => {
  it("uses response status and json error message", async () => {
    const response = Response.json(
      { error: "Prompt blocked", statusCode: 499 },
      { status: 422 }
    );

    const parsed = await parseApiErrorResponse({ response });

    expect(parsed).toEqual({
      message: "Prompt blocked",
      statusCode: 422,
    });
  });

  it("uses the response status when no json body is present", async () => {
    const response = new Response("Internal failure", { status: 503 });

    const parsed = await parseApiErrorResponse({ response });

    expect(parsed).toEqual({
      message: "Internal failure",
      statusCode: 503,
    });
  });
});

describe("parseUnknownError", () => {
  it("prefers error statusCode", () => {
    const parsed = parseUnknownError({
      error: { message: "Failed", statusCode: 409 },
    });

    expect(parsed).toEqual({
      message: "Failed",
      statusCode: 409,
    });
  });

  it("falls back to 500 and default message", () => {
    const parsed = parseUnknownError({ error: {} });

    expect(parsed).toEqual({
      message: "Unexpected error",
      statusCode: 500,
    });
  });
});

describe("apiErrorToResponse", () => {
  it("applies fallback message for unknown errors", async () => {
    const response = apiErrorToResponse({
      error: {},
      fallbackMessage: "Image generation failed",
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Image generation failed",
      statusCode: 500,
    });
  });
});
