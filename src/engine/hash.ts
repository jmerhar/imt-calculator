import type { CalcInput } from "@/engine/types";

// A short, deterministic identifier for a calculation — same inputs always yield the same ID,
// so it can be quoted for reference (shown as "Calculation ID" and reproducible from the URL).
// Not cryptographic: a 53-bit FNV-1a folded to base32, which is ample for a human-facing tag.

function normalise(input: CalcInput): string {
  const buyers = input.buyers
    .map((b) =>
      [b.share, b.type, b.taxHaven, b.residency, b.exception, b.jovem].join(":"),
    )
    .join("|");
  const m = input.mortgage
    ? `${input.mortgage.amount}:${input.mortgage.term}:${input.mortgage.months ?? ""}`
    : "-";
  return [
    input.year,
    input.location,
    input.intendedUse,
    input.price,
    input.vpt ?? "-",
    m,
    buyers,
  ].join(";");
}

function fnv1a(str: string): number {
  // 64-bit-ish FNV-1a kept within JS safe-integer range via BigInt, then reduced.
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = (1n << 64n) - 1n;
  for (let i = 0; i < str.length; i++) {
    hash = (hash ^ BigInt(str.charCodeAt(i))) & mask;
    hash = (hash * prime) & mask;
  }
  return Number(hash & 0x1fffffffffffffn); // 53 bits
}

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"; // Crockford-ish base32, no i/l/o/u

export function calcId(input: CalcInput): string {
  let n = fnv1a(normalise(input));
  let out = "";
  for (let i = 0; i < 10; i++) {
    out = ALPHABET[n % 32] + out;
    n = Math.floor(n / 32);
  }
  return `IMT-${out.toUpperCase()}`;
}
