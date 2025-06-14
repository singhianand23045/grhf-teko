
/**
 * Generates a cryptographically secure shuffled array of numbers (1..n).
 * @param n How many numbers to generate (e.g. 36)
 */
export function generateSecureShuffle(n: number, max: number): number[] {
  const arr = Array.from({ length: max }, (_, i) => i + 1);
  // Fisher-Yates shuffle using window.crypto
  for (let i = max - 1; i > 0 && i >= (max - n); i--) {
    // get random value between 0 and i
    const randArr = new Uint32Array(1);
    window.crypto.getRandomValues(randArr);
    const j = randArr[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
