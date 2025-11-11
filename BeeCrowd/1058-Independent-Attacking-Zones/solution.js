"use strict";

const fs = require("fs");
// const input = fs.readFileSync('/dev/stdin', 'utf8');
const input = fs.readFileSync("./tests/01.in", "utf8");
const lines = input.split(/\r?\n/);

lines.reverse(); // So we can .pop()

// Pre-calculated values (Catalan-like sequence)
// triArr[N] = answer for N triangles (N*3 points) with 0 or 1 Reds.
const triArr = [
  1, // 0 triangles (n=0)
  1, // 1 triangle (n=3)
  3, // 2 triangles (n=6)
  12, // 3 triangles (n=9)
  55, // 4 triangles (n=12)
  273,
  1428,
  7752,
  43263,
  246675,
  1430715,
  8414640,
  50067108,
  300830572, // 13 triangles (n=39)
];

// Create a Map to store our computed results (Memoization cache).
const memo = new Map();

// Counts "effective" reds: platoons at an index i % 3 !== 0.
// This is used for the "magic" optimization (see solve() function).
function countRedsEffective(points) {
  return points.reduce((acc, red, i) => {
    if (red && i % 3 !== 0) acc++;
    return acc;
  }, 0);
}

// Simple helper function to count all Red platoons (true values) in an array.
function countReds(points) {
  return points.reduce((acc, red) => {
    if (red) acc++;
    return acc;
  }, 0);
}

/**
 * The main, memoized recursive function (based on user's original logic).
 *
 * This function *mutates* the 'points' array it receives by rotating it.
 * This is by design. The caller MUST always pass a `points.slice()`
 * to prevent side effects, as we do in the main loop.
 *
 * @param {boolean[]} points - The array (or sub-array) of platoons.
 * @param {number} numPoints - The length of the points array (points.length).
 * @param {number} reds - The pre-counted number of reds in the points array.
 * @returns {number} - The number of valid triangulations.
 */
function solve(points, numPoints, reds) {
  // Base case: 0 points (an empty sub-problem) has 1 solution (do nothing).
  if (numPoints === 0) {
    return 1;
  }

  // --- MEMOIZATION CHECK ---
  // Use the array's string representation as the key *before* mutation.
  const key = points.toString();
  if (memo.has(key)) {
    return memo.get(key);
  }

  const numTriag = numPoints / 3;

  // Base Case 1: 0 or 1 Red platoon.
  // The problem is trivial, solution is the pre-calculated value.
  if (reds <= 1) {
    memo.set(key, triArr[numTriag]); // Store result
    return triArr[numTriag];
  }

  // --- Logic: Rotate array to put the first Red at index 0 ---
  // This linearizes the circle and simplifies the Red constraint.
  // This MUTATES the 'points' array.
  points.push(...points.splice(0, points.indexOf(true)));

  // Base Case 2: "Magic" mod 3 optimization.
  // If all Reds are at indices i % 3 == 0 (relative to the first Red),
  // then p1 (i % 3 == 1) and p2 (i % 3 == 2) will *always* be Black.
  // The problem becomes identical to the 0-Red case.
  if (countRedsEffective(points) === 0) {
    memo.set(key, triArr[numTriag]); // Store result
    return triArr[numTriag];
  }
  // --- End of special base cases ---

  // Base Case 3: Pruning.
  // If we have more Reds than we can make triangles, it's impossible.
  if (reds > numTriag) {
    memo.set(key, 0); // Store result
    return 0;
  }

  let numTriagCount = 0;

  // --- Recursive Step ---
  // We fixed p0 (index 0) which is guaranteed to be RED here.
  // We now find all (p1, p2) pairs to form the first triangle.

  // Loop for p1. We increment by 3 due to the (p1 - 1) % 3 == 0 constraint.
  for (let p1 = 1; p1 < numPoints; p1 += 3) {
    // p0 is Red, so p1 MUST be Black.
    if (points[p1]) {
      continue;
    }

    // --- Sub-problem 1 (points 1 to p1-1) ---
    const pointsA1 = points.slice(1, p1);
    const n1 = p1 - 1;
    const reds1 = countReds(pointsA1);
    // Pruning: If sub-problem 1 is impossible, skip this p1.
    if (reds1 > n1 / 3) continue;

    // Recursive call *must* pass new slices
    const area1 = solve(pointsA1, n1, reds1);
    // Pruning: If sub-problem 1 has 0 solutions, skip this p1.
    if (area1 === 0) continue;

    // Loop for p2. We increment by 3 due to the (p2 - p1 - 1) % 3 == 0 constraint.
    for (let p2 = p1 + 1; p2 < numPoints; p2 += 3) {
      // p0 is Red, so p2 MUST be Black.
      if (points[p2]) {
        continue;
      }

      // --- Sub-problem 2 (points p1+1 to p2-1) ---
      const pointsA2 = points.slice(p1 + 1, p2);
      const n2 = p2 - p1 - 1;
      const reds2 = countReds(pointsA2);
      // Pruning: If sub-problem 2 is impossible, skip this p2.
      if (reds2 > n2 / 3) continue;

      // --- Sub-problem 3 (points p2+1 to N-1) ---
      const pointsA3 = points.slice(p2 + 1, numPoints);
      const n3 = numPoints - p2 - 1;
      const reds3 = countReds(pointsA3);
      // Pruning: If sub-problem 3 is impossible, skip this p2.
      if (reds3 > n3 / 3) continue;

      // Recurse on sub-problems 2 and 3
      const area2 = solve(pointsA2, n2, reds2);
      // Pruning: If sub-problem 2 has 0 solutions, skip this p2.
      if (area2 === 0) continue;

      const area3 = solve(pointsA3, n3, reds3);
      // (No need to check area3 for 0, as we just add it)

      // Total ways = product of sub-problems
      numTriagCount += area1 * area2 * area3;
    }
  }

  memo.set(key, numTriagCount); // Store final computed result
  return numTriagCount;
}

// --- Main Loop ---
const numCases = +lines.pop();
let outputLines = [];

for (let i = 1; i <= numCases; i++) {
  const numPointsStr = lines.pop();
  if (!numPointsStr) continue; // Handle empty/extra lines

  const numPoints = +numPointsStr;
  const line = lines.pop();
  if (!line) continue; // Handle empty/extra lines

  // Convert string 'R'/'B' to boolean array
  const points = line.split("").map((char) => char === "R");

  s; // Clear the memo map for *each* new test case
  memo.clear();

  // We pass a .slice() to the top-level call,
  // as the 'solve' function mutates its 'points' argument.
  const solution = solve(points.slice(), numPoints, countReds(points));
  outputLines.push(`Case ${i}: ${solution}`);
}

process.stdout.write(outputLines.join("\n") + "\n");
