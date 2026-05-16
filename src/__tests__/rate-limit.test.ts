import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("allows first request", () => {
    const result = rateLimit("test-key", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("allows requests within limit", () => {
    rateLimit("test-key-2", 3, 60000);
    const result = rateLimit("test-key-2", 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("blocks requests exceeding limit", () => {
    rateLimit("test-key-3", 2, 60000);
    rateLimit("test-key-3", 2, 60000);
    const result = rateLimit("test-key-3", 2, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    rateLimit("test-key-4", 1, 10);
    const blocked = rateLimit("test-key-4", 1, 10);
    expect(blocked.allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const allowed = rateLimit("test-key-4", 1, 10);
        expect(allowed.allowed).toBe(true);
        resolve();
      }, 15);
    });
  });
});
