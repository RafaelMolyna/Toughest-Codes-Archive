"use strict";

const fs = require("fs");
// const input = fs.readFileSync('/dev/stdin', 'utf8');
const input = fs.readFileSync("./tests/01.in", "utf8");
const lines = input.split(/\r?\n/);

lines.reverse(); // So we can .pop()

// Pre-calculated values (Catalan-like sequence)
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

// Create a Map to store our computed results.
const memo = new Map();

// Your original countRedsEffective
function countRedsEffective(points) {
  return points.reduce((acc, red, i) => {
    if (red && i % 3 !== 0) acc++;
    return acc;
  }, 0);
}

// Your original countReds
function countReds(points) {
  return points.reduce((acc, red) => {
    if (red) acc++;
    return acc;
  }, 0);
}

/**
 * This is YOUR original countTriang function,
 * wrapped with memoization.
 * It is NOT pure, it mutates the 'points' array it receives.
 * This is fine, because we will *always* pass it a .slice()
 */
function solve(points, numPoints, reds) {
  // Base case: 0 points
  if (numPoints === 0) {
    return 1;
  }

  // --- MEMOIZATION CHECK ---
  // The key is the array *before* mutation.
  const key = points.toString();
  if (memo.has(key)) {
    return memo.get(key);
  }

  const numTriag = numPoints / 3;

  // Base Case 1: 0 or 1 Red.
  if (reds <= 1) {
    memo.set(key, triArr[numTriag]); // Store result
    return triArr[numTriag];
  }

  // --- Your original logic (with mutation) ---
  points.push(...points.splice(0, points.indexOf(true)));

  if (countRedsEffective(points) === 0) {
    memo.set(key, triArr[numTriag]); // Store result
    return triArr[numTriag];
  }
  // --- End of your special base cases ---

  // Base Case 3: Pruning.
  if (reds > numTriag) {
    memo.set(key, 0); // Store result
    return 0;
  }

  let numTriagCount = 0;

  // --- Recursive Step (Your exact logic) ---
  // We fixed p0 (index 0) which is guaranteed to be RED here.
  for (let p1 = 1; p1 < numPoints; p1 += 3) {
    if (points[p1]) {
      continue;
    }

    const pointsA1 = points.slice(1, p1);
    const n1 = p1 - 1;
    const reds1 = countReds(pointsA1);
    if (reds1 > n1 / 3) continue;

    // Recursive call *must* pass new slices
    const area1 = solve(pointsA1, n1, reds1);
    if (area1 === 0) continue;

    for (let p2 = p1 + 1; p2 < numPoints; p2 += 3) {
      if (points[p2]) {
        continue;
      }

      const pointsA2 = points.slice(p1 + 1, p2);
      const n2 = p2 - p1 - 1;
      const reds2 = countReds(pointsA2);
      if (reds2 > n2 / 3) continue;

      const pointsA3 = points.slice(p2 + 1, numPoints);
      const n3 = numPoints - p2 - 1;
      const reds3 = countReds(pointsA3);
      if (reds3 > n3 / 3) continue;

      const area2 = solve(pointsA2, n2, reds2);
      if (area2 === 0) continue;

      const area3 = solve(pointsA3, n3, reds3);

      numTriagCount += area1 * area2 * area3;
    }
  }

  memo.set(key, numTriagCount); // Store final result
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

  const points = line.split("").map((char) => char === "R");

  // Clear the memo map for *each* new test case
  memo.clear();

  // We pass a .slice() to the top-level call,
  // just like your original main loop.
  const solution = solve(points.slice(), numPoints, countReds(points));
  outputLines.push(`Case ${i}: ${solution}`);
}

process.stdout.write(outputLines.join("\n") + "\n");
