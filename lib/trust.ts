import { createHash, randomUUID } from "node:crypto";

export type CanonicalValue = null | boolean | number | string | CanonicalValue[] | { [key: string]: CanonicalValue };

function sortValue(value: CanonicalValue): CanonicalValue {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sortValue(child)])
    );
  }
  return value;
}

export function canonicalJson(value: CanonicalValue): string {
  return JSON.stringify(sortValue(value));
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createEcmrReference(now = new Date()): string {
  const year = now.getUTCFullYear();
  return `FXCMR-${year}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export function createVerificationId(): string {
  return randomUUID().replaceAll("-", "");
}
