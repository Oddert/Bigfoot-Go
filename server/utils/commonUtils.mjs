/**
 * Picks a random item from a given array.
 * @param {any[]} arr The list to pick from
 * @returns {any}
 */
export const pickRand = arr => arr[Math.floor(Math.random() * arr.length)]
