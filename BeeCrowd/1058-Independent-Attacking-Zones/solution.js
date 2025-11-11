"use strict";

const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf8");
// const input = fs.readFileSync("./tests/01.in", "utf8");
const lines = input.split("\n");

lines.reverse(); // So we can .pop() for fast I/O

// Pre-calculated Catalan-like sequence for N triangles
const triArr = [
  1, // 0 Triangles (0 Points)
  1, // 1 Triangle  (3 Points)
  3, // 2 Triangles (6 Points)
  12,
  55,
  273,
  1428,
  7752,
  43263,
  246675,
  1430715,
  8414640,
  50067108,
  300830572, // 13 Triangles (39 Points)
];

// Memoization cache.
// Key: string (e.g., "100100"), Value: number (result)
const memo = new Map();

// --- Optimized Helper Functions ---

/**
 * Checks if all Reds (1s) are at indices i % 3 === 0.
 * If so, the problem is equivalent to an all-Black (0s) array.
 */
function isAllRedsInMod3(points) {
  for (let i = 0; i < points.length; i++) {
    // points[i] is 1 (Red) or 0 (Black)
    if (points[i] && i % 3 !== 0) {
      return false;
    }
  }
  return true;
}

/**
 * This is the core of the new strategy:
 * On a cache *miss*, we solve the problem once, then
 * pre-cache the result for *all N rotations* of the
 * original key.
 *
 * This is a trade-off: the cache *save* is expensive
 * (N string creations and N map insertions), but
 * subsequent cache *hits* are guaranteed for any rotation.
 */
function saveAllRotations(key, numPoints, result) {
  memo.set(key, result);
  for (let i = 1; i < numPoints; i++) {
    // This string math is the main JS bottleneck,
    // but it's required for this algorithm.
    const rotatedKey = key.slice(i) + key.slice(0, i);
    memo.set(rotatedKey, result);
  }
}

/**
 * The main, memoized recursive function.
 *
 * NOTE: This function *mutates* the 'points' array it receives
 * by rotating it. The caller MUST pass a `points.slice()`
 * to prevent side effects.
 *
 * @param {number[]} points - The array of platoons (1 or 0).
 * @param {number} numPoints - The length of the points array.
 * @returns {number} - The number of valid triangulations.
 */
function solve(points, numPoints) {
  // Base case 0: Empty array
  if (numPoints === 0) {
    return 1;
  }

  // BOTTLENECK: In JS, we must use a string key for Map memoization
  // of an array. This .join() is the biggest performance cost.
  const key = points.join("");

  // --- MEMOIZATION CHECK (Original Key) ---
  if (memo.has(key)) {
    return memo.get(key);
  }

  // --- Pre-calculate stats ---
  const numTriag = numPoints / 3;
  // This reduce is O(N), but it's necessary.
  const redsCount = points.reduce((acc, e) => acc + e);

  // --- Base Case 1: Pruning ---
  if (redsCount > numTriag) {
    // More reds than available triangles. Impossible.
    saveAllRotations(key, numPoints, 0);
    return 0;
  }

  // --- Base Case 2: 0 or 1 Red ---
  // (This is a *critical* optimization)
  // If there are 0 or 1 reds, the problem is identical
  // to the all-black case (triArr).
  if (redsCount <= 1) {
    const result = triArr[numTriag];
    saveAllRotations(key, numPoints, result);
    return result;
  }

  // --- Canonical Rotation ---
  // We now know redsCount > 1, so points.indexOf(1) will NOT be -1.
  // We *mutate* the local 'points' array to its canonical
  // (red-first) form.
  points.push(...points.splice(0, points.indexOf(1)));

  // --- Base Case 3: "Magic" Mod 3 Check ---
  // This check MUST happen *after* the canonical rotation.
  if (isAllRedsInMod3(points)) {
    const result = triArr[numTriag];
    saveAllRotations(key, numPoints, result); // Use *original* key
    return result;
  }

  // --- Recursive Step ---
  // We've fixed p0 at index 0 (and it's Red).
  let numTriagCount = 0;
  for (let p1 = 1; p1 < numPoints; p1 += 3) {
    // p0 is Red, so p1 MUST be Black (0).
    if (points[p1]) {
      continue;
    }

    // --- Sub-problem 1 ---
    const pointsA1 = points.slice(1, p1);
    const n1 = p1 - 1;
    // We must call solve() recursively.
    // It will handle its own pruning and base cases.
    const area1 = solve(pointsA1, n1);
    if (area1 === 0) continue;

    for (let p2 = p1 + 1; p2 < numPoints; p2 += 3) {
      // p0 is Red, so p2 MUST be Black (0).
      if (points[p2]) {
        continue;
      }

      // --- Sub-problem 2 ---
      const pointsA2 = points.slice(p1 + 1, p2);
      const n2 = p2 - p1 - 1;

      // --- Sub-problem 3 ---
      const pointsA3 = points.slice(p2 + 1, numPoints);
      const n3 = numPoints - p2 - 1;

      // Recurse on sub-problems
      const area2 = solve(pointsA2, n2);
      if (area2 === 0) continue;

      const area3 = solve(pointsA3, n3);
      // No need to check area3 === 0, multiplication handles it

      numTriagCount += area1 * area2 * area3;
    }
  }

  // --- FINAL CACHE SAVE ---
  // Save the result for the *original key* and all its rotations.
  saveAllRotations(key, numPoints, numTriagCount);
  return numTriagCount;
}

// --- Main Loop ---
const numCases = +lines.pop();
let outputLines = [];

for (let i = 1; i <= numCases; i++) {
  const numPointsStr = lines.pop();
  if (!numPointsStr) continue;

  const numPoints = +numPointsStr;
  const line = lines.pop();
  if (!line) continue;

  const points = line.split("").map((char) => (char === "R" ? 1 : 0));

  memo.clear();

  // We MUST pass a .slice() because 'solve' mutates the array
  const solution = solve(points.slice(), numPoints);
  outputLines.push(`Case ${i}: ${solution}`);
}

process.stdout.write(outputLines.join("\n") + "\n");
