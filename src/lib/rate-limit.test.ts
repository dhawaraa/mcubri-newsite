import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("Rate Limiting Security Helper", () => {
  it("allows requests within threshold and blocks when limit is exceeded", () => {
    const key = "test-ip-123";
    const options = { limit: 3, windowMs: 1000 };

    expect(checkRateLimit(key, options).success).toBe(true);
    expect(checkRateLimit(key, options).success).toBe(true);
    expect(checkRateLimit(key, options).success).toBe(true);

    const fourth = checkRateLimit(key, options);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("extracts client IP from x-forwarded-for header correctly", () => {
    const req = new Request("https://example.com/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });
});
