"use strict";

// Read from Standard Input (File Descriptor 0)
// We use trim() to avoid trailing whitespace issues, and split by any newline.
const input = require("fs").readFileSync(0, "utf8");
// const input = require("fs").readFileSync("./dev/stdin2", "utf8");
const lines = input.trim().split(/[\r\n]+/);

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers.
 * Used to simplify fractions to their irreducible form.
 * Note: Uses Math.abs() to ensure we don't get negative divisors.
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Compares two time fractions t1 and t2.
 * Returns the smaller VALID time (non-negative and valid denominator).
 * * Logic:
 * To compare n1/d1 < n2/d2 without floating point precision loss,
 * we cross-multiply: n1 * d2 < n2 * d1.
 * We use BigInt here because these products can exceed Number.MAX_SAFE_INTEGER.
 */
function compareAndReturn(t1, t2) {
  // Filter out invalid times (null or denominator 0)
  if (!t1) return t2 || [0, 0];
  if (!t2) return t1;

  // Cross-multiplication with BigInt protection
  const val1 = BigInt(t1[0]) * BigInt(t2[1]);
  const val2 = BigInt(t2[0]) * BigInt(t1[1]);

  return val1 < val2 ? t1 : t2;
}

/**
 * Solves for a specific collision case defined by parameters.
 * Handles two scenarios internally:
 * 1. Parallel Radius Functions (a1 == a2)
 * 2. Intersecting Radius Functions (a1 != a2)
 */
function solveCase(a1, b1, c1, d1, a2, b2, c2, d2) {
  // === SCENARIO 1: PARALLEL RADIUS ===
  // Slopes (A) are equal. Radii are parallel lines r(t) = At + B.
  if (a1 === a2) {
    // If slopes are same but intercepts (B) differ, lines are parallel and distinct.
    // They never intersect (unless radius is 0, which is handled in overlapping logic).
    if (b1 !== b2) {
      return null;
    }
    // If slopes AND intercepts are same, the particles share the same Radius path forever.
    // Collision depends purely on angles aligning or radius hitting 0.
    return findCollisionOverlapping(a1, b1, c1, d1, c2, d2);
  }

  // === SCENARIO 2: INTERSECTING RADIUS ===
  // Slopes differ. The radii lines intersect at exactly ONE point in time.
  return findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2);
}

/**
 * Main Solver Function.
 * Polar coordinates allow two types of collision:
 * Case A: (r, θ) collides with (r, θ)
 * Case B: (r, θ) collides with (-r, θ + 180°) -> "Anti-parallel" pass-through
 */
function findCollision(a1, b1, c1, d1, a2, b2, c2, d2) {
  // Case A: Standard Collision
  // We check if particles meet at same radius and same angle.
  const t_same = solveCase(a1, b1, c1, d1, a2, b2, c2, d2);

  // Case B: Anti-Parallel Collision
  // Mathematically, r1 = -r2 is equivalent to saying Particle 1 is at -r1.
  // We simulate this by inverting Particle 1's radius parameters (-A, -B)
  // and shifting its angle by 180 degrees.
  const t_opp = solveCase(-a1, -b1, c1, d1 + 180, a2, b2, c2, d2);

  // Return the earliest valid collision time between the two cases.
  const best = compareAndReturn(t_same, t_opp);
  return best.join(" ");
}

/**
 * Handles logic when Radius functions are IDENTICAL (r1(t) == r2(t)).
 * Collision occurs if:
 * 1. Radius becomes 0 (Origin is a singularity where angles don't matter).
 * 2. Angles align (θ1 == θ2).
 */
function findCollisionOverlapping(a, b, c1, d1, c2, d2) {
  // 1. Check for Radius Zero crossing
  // r = at + b = 0  ==>  t = -b/a
  let t_zero = null;

  if (a !== 0) {
    const num = -b;
    const den = a;
    // We strictly need time t >= 0
    // Check sign match: (num >= 0 and den > 0) OR (num <= 0 and den < 0)
    if ((num >= 0 && den > 0) || (num <= 0 && den < 0)) {
      const common = gcd(num, den);
      t_zero = [Math.abs(num) / common, Math.abs(den) / common];
    }
  } else if (b === 0) {
    // If A=0 and B=0, radius is ALWAYS 0. Collision is immediate at t=0.
    return [0, 1];
  }

  // 2. Check for Angle Alignment
  // Normalize start angles to positive [0, 360) range
  d1 = ((d1 % 360) + 360) % 360;
  d2 = ((d2 % 360) + 360) % 360;

  // If angular velocities (C) are identical
  if (c1 === c2) {
    // They must start aligned to ever collide (unless hitting origin)
    if (d1 === d2) return [0, 1];
    return compareAndReturn(t_zero, null);
  }

  // Optimization: Ensure C1 > C2 so relative speed is positive
  if (c1 < c2) {
    [c1, c2, d1, d2] = [c2, c1, d2, d1];
  }

  // We need to solve: θ1(t) = θ2(t) (mod 360)
  // (c1 - c2)t = d2 - d1 (mod 360)
  // t = (d2 - d1 + 360k) / (c1 - c2)
  // We want the smallest non-negative t.

  let diff = d2 - d1;
  while (diff < 0) diff += 360; // Ensure positive numerator
  diff %= 360; // Smallest positive offset

  const ta = diff;
  const tb = c1 - c2; // Guaranteed positive by swap above

  const common = gcd(ta, tb);
  const t_angle = [ta / common, tb / common];

  // Return the earlier of: hitting the origin OR aligning angles
  return compareAndReturn(t_zero, t_angle);
}

/**
 * Handles logic when Radius functions INTERSECT at exactly one point.
 * We calculate that specific time t, then check if angles match at that moment.
 */
function findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2) {
  // Solve r1(t) = r2(t)
  // a1*t + b1 = a2*t + b2  ==>  t(a1 - a2) = b2 - b1
  // t = (b2 - b1) / (a1 - a2)
  let num = b2 - b1;
  let den = a1 - a2;

  if (den === 0) return null; // Safety guard (should be caught by solveCase)

  // Validate t >= 0. Signs of num and den must match.
  if ((num < 0 && den > 0) || (num > 0 && den < 0)) return null;

  num = Math.abs(num);
  den = Math.abs(den);

  const common = gcd(num, den);
  const ta = num / common;
  const tb = den / common; // ta/tb is our candidate time t

  // CHECK 1: Do angles match at this time t?
  // θ1 = c1(ta/tb) + d1
  // θ2 = c2(ta/tb) + d2
  // Match condition: θ1 - θ2 is a multiple of 360
  // (c1 - c2)(ta/tb) + (d1 - d2) = 360k
  // Multiply by tb to clear denominator:
  // (c1 - c2)*ta + (d1 - d2)*tb = 360*tb*k
  // Therefore, LHS must be divisible by (360 * tb)

  // BigInt is CRITICAL here. c1, ta, d1, tb can be ~10^4.
  // Products can reach 10^8. While safe for JS Number (10^15),
  // intermediate steps or larger inputs in other problems might overflow.
  // It also ensures precise modulo operations on negative numbers.
  const term1 = BigInt(c1 - c2) * BigInt(ta);
  const term2 = BigInt(d1 - d2) * BigInt(tb);
  const lhs = term1 + term2;
  const modBase = BigInt(360) * BigInt(tb);

  if (lhs % modBase === 0n) {
    return [ta, tb];
  }

  // CHECK 2: Is the radius Zero at this time t?
  // If r=0, the particles collide at origin regardless of angles.
  // r1 = a1(ta/tb) + b1 = (a1*ta + b1*tb) / tb
  // We check if numerator is 0.
  if (BigInt(a1) * BigInt(ta) + BigInt(b1) * BigInt(tb) === 0n) {
    return [ta, tb];
  }

  return null;
}

function solve() {
  let out = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse using regex to handle multiple spaces safely
    const p = line.split(/\s+/).map(Number);

    // Basic input validation
    if (p.length < 8) continue;

    // Check for termination case (all zeros)
    if (p.every((x) => x === 0)) break;

    out += findCollision(...p) + "\n";
  }
  return out;
}

process.stdout.write(solve());
