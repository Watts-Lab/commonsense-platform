/**
 * Simple hash function to convert a string into a numeric seed
 * @param {string} str - The string to hash
 * @returns {number} - A numeric hash value
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator (PRNG)
 * Uses a simple Linear Congruential Generator (LCG)
 * @param {number} seed - The seed value
 * @returns {Function} - A function that returns pseudo-random numbers between 0 and 1
 */
function seededRandom(seed) {
  let state = seed;
  return function () {
    // LCG parameters (same as used by glibc)
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Shuffles an array deterministically based on a seed
 * Uses Fisher-Yates shuffle algorithm with a seeded PRNG
 * @param {Array} array - The array to shuffle
 * @param {string} seed - The seed string (e.g., sessionId)
 * @returns {Array} - A new shuffled array (original is not modified)
 */
function seededShuffle(array, seed) {
  if (!array || array.length === 0) return array;
  if (!seed) return array; // If no seed, return original order

  // Create a copy to avoid mutating the original
  const shuffled = [...array];

  // Create a seeded random number generator
  const random = seededRandom(hashCode(seed));

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

module.exports = {
  seededShuffle,
};
