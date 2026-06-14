/**
 * @jest-environment node
 */

export {};

const OLD_ENV = process.env;
const mockIncr = jest.fn();
const mockExpire = jest.fn();

jest.mock("@vercel/kv", () => ({
  createClient: jest.fn(() => ({
    incr: mockIncr,
    expire: mockExpire,
  })),
}));

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
  mockIncr.mockReset();
  mockExpire.mockReset();
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("rateLimit with KV", () => {
  it("uses KV when env vars are set", async () => {
    process.env.KV_URL = "https://kv.example.com";
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "token123";
    mockIncr.mockResolvedValue(1);

    const { rateLimit } = await import("@/lib/rate-limit");
    const result = await rateLimit("test-key", 10, 60000);

    expect(mockIncr).toHaveBeenCalled();
    expect(result.allowed).toBe(true);
  });

  it("returns not allowed when KV count exceeds max", async () => {
    process.env.KV_URL = "https://kv.example.com";
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "token123";
    mockIncr.mockResolvedValue(11);

    const { rateLimit } = await import("@/lib/rate-limit");
    const result = await rateLimit("test-key", 10, 60000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("falls back to in-memory when KV is not configured", async () => {
    delete process.env.KV_URL;

    const { rateLimit } = await import("@/lib/rate-limit");
    const result = await rateLimit("mem-key", 5, 60000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("allows request when KV throws", async () => {
    process.env.KV_URL = "https://kv.example.com";
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "token123";
    mockIncr.mockRejectedValue(new Error("KV down"));

    const { rateLimit } = await import("@/lib/rate-limit");
    const result = await rateLimit("test-key", 10, 60000);

    expect(result.allowed).toBe(true);
  });

  it("calls expire on first KV increment", async () => {
    process.env.KV_URL = "https://kv.example.com";
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "token123";
    mockIncr.mockResolvedValue(1);

    const { rateLimit } = await import("@/lib/rate-limit");
    await rateLimit("test-key", 10, 60000);

    expect(mockExpire).toHaveBeenCalled();
  });

  it("does not call expire on subsequent KV increments", async () => {
    process.env.KV_URL = "https://kv.example.com";
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "token123";
    mockIncr.mockResolvedValue(2);

    const { rateLimit } = await import("@/lib/rate-limit");
    await rateLimit("test-key", 10, 60000);

    expect(mockExpire).not.toHaveBeenCalled();
  });
});
