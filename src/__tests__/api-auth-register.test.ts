/**
 * @jest-environment node
 */

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
    },
  };
  return { prisma: mockPrisma };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("$hashed_password")),
}));

jest.mock("@/lib/email", () => ({
  sendWelcomeEmail: jest.fn(() => Promise.resolve()),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db";

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  subscriptionPlan: {
    findUnique: jest.Mock;
  };
  subscription: {
    create: jest.Mock;
  };
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validBody = JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  it("returns 400 for missing email", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ password: "Password123!" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-id" });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: validBody,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already");
  });

  it("creates user and returns 200 on success", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "new-user-id",
      email: "test@example.com",
      name: "Test User",
    });
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
      id: "free-plan-id",
      tier: "free",
      maxVehicles: 2,
    });
    mockPrisma.subscription.create.mockResolvedValue({ id: "sub-id" });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: validBody,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe("test@example.com");
  });
});
