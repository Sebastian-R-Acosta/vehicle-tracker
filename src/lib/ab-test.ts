const STORAGE_KEY = "vt_ab_assignments";

type Variant = "control" | "variant_a" | "variant_b";

interface ABTest {
  name: string;
  variants: Variant[];
  weights: number[];
}

const activeTests: ABTest[] = [
  {
    name: "pricing_layout",
    variants: ["control", "variant_a"],
    weights: [0.5, 0.5],
  },
  {
    name: "upgrade_modal_copy",
    variants: ["control", "variant_a", "variant_b"],
    weights: [0.34, 0.33, 0.33],
  },
];

function getAssignment(testName: string): Variant {
  if (typeof window === "undefined") return "control";

  const stored = sessionStorage.getItem(STORAGE_KEY);
  const assignments: Record<string, Variant> = stored ? JSON.parse(stored) : {};

  if (assignments[testName]) return assignments[testName];

  const test = activeTests.find((t) => t.name === testName);
  if (!test) return "control";

  const rand = Math.random();
  let cumulative = 0;
  let variant: Variant = "control";

  for (let i = 0; i < test.variants.length; i++) {
    cumulative += test.weights[i];
    if (rand < cumulative) {
      variant = test.variants[i];
      break;
    }
  }

  assignments[testName] = variant;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));

  return variant;
}

export function useABTest(testName: string): Variant {
  if (typeof window === "undefined") return "control";
  return getAssignment(testName);
}

export function getABTestValue(testName: string): Variant {
  return getAssignment(testName);
}
