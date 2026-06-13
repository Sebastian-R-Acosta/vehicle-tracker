export { generateAppleWalletPass } from "./apple";
export { generateGoogleWalletPass } from "./google";
export type { WalletPassInput } from "./apple";

export const WALLET_SUPPORTED_TYPES = [
  "registration",
  "insurance",
  "warranty",
  "inspection",
  "receipt",
] as const;

export type WalletDocType = (typeof WALLET_SUPPORTED_TYPES)[number];
