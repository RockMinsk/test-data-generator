/**
 * Selects a key from a ratio map based on weighted probability.
 *
 * @param ratios - An object where keys are category names and values are
 *                 probability weights (should sum to ~1.0).
 * @returns The selected category key.
 *
 * @example
 * selectByRatio({ with_payment: 0.7, without_payment: 0.15, with_multiple_payments: 0.15 })
 * // → 'with_payment' (70% of the time)
 */
export function selectByRatio<T extends string>(ratios: Partial<Record<T, number>>): T {
  const rand = Math.random();
  let cumulative = 0;

  for (const [key, probability] of Object.entries(ratios) as [T, number][]) {
    cumulative += probability;
    if (rand < cumulative) {
      return key;
    }
  }

  // Fallback: return last key (handles floating-point rounding edge cases)
  const keys = Object.keys(ratios) as T[];
  return keys[keys.length - 1];
}
