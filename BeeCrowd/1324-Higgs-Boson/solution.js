"use strict";

// Using file descriptor 0 is often safer for standard input in Node.js
// const input = require("fs").readFileSync(0, "utf8");
const input = require("fs").readFileSync("./dev/stdin2", "utf8");
// Fixed regex to handle multiple newlines/spaces safely like in the fix
const lines = input.trim().split(/[\r\n]+/);

function gcd(a, b) {
  // GCD needs positive numbers to behave predictably
  return b === 0 ? a : gcd(b, a % b);
}

function compareAndReturn(t1, t2) {
  if (!t1) {
    return t2 || [0, 0];
  }

  if (!t2) {
    return t1;
  }

  // ORIGINALLY: return t1[0] / t1[1] < t2[0] / t2[1] ? t1 : t2;
  // BIGINT FIX: Cross-multiplication
  // n1/d1 < n2/d2  <=>  n1*d2 < n2*d1
  const val1 = BigInt(t1[0]) * BigInt(t2[1]);
  const val2 = BigInt(t2[0]) * BigInt(t1[1]);

  return val1 < val2 ? t1 : t2;
}

function findCollision(a1, b1, c1, d1, a2, b2, c2, d2) {
  // ... (Your comments) ...

  if (a1 === a2) {
    if (b1 === b2) {
      return compareAndReturn(
        findCollisionOverlapping(a1, b1, c1, d1, c2, d2),
        findCollisionOverlapping(-a1, -b1, c1, d1 + 180, c2, d2)
      ).join(" ");
    }

    if (a1 === 0) {
      return "0 0";
    }

    const t = findCollisionNotParallel(-a1, -b1, c1, d1 + 180, a2, b2, c2, d2);
    return t ? t.join(" ") : "0 0";
  }

  if (a1 === -a2) {
    if (b1 === -b2) {
      return compareAndReturn(
        findCollisionOverlapping(a1, b1, c1, d1, c2, d2),
        findCollisionOverlapping(-a1, -b1, c1, d1 + 180, c2, d2)
      ).join(" ");
    }

    if (a1 === 0) {
      return "0 0";
    }

    const t = findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2);
    return t ? t.join(" ") : "0 0";
  }

  const t1 = findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2);
  const t2 = findCollisionNotParallel(-a1, -b1, c1, d1 + 180, a2, b2, c2, d2);

  return compareAndReturn(t1, t2).join(" ");
}

function findCollisionRadiusZero(a, b) {
  if (a * b > 0) {
    return null;
  }

  const [ta, tb] = a > 0 ? [-b, a] : [b, -a];

  const commonDivisor = gcd(ta, tb);

  // Return integer fraction, don't divide!
  return [ta / commonDivisor, tb / commonDivisor];
}

function findCollisionOverlapping(a1, b1, c1, d1, c2, d2) {
  if (b1 === 0) {
    return [0, 1];
  }

  const t1 = findCollisionRadiusZero(a1, b1);

  d1 %= 360;
  d2 %= 360;

  // Fix negative modulo results
  if (d1 < 0) d1 += 360;
  if (d2 < 0) d2 += 360;

  if (d2 === d1) {
    return [0, 1];
  }

  if (c1 === c2) {
    if (d1 === d2) {
      return [0, 1];
    }
    return null;
  }

  if (c1 > c2) {
    while (d1 > d2) {
      d2 += 360;
    }
  } else {
    while (d1 < d2) {
      d1 += 360;
    }
    [c1, c2, d1, d2] = [c2, c1, d2, d1];
  }

  let ta = d2 - d1;
  let tb = c1 - c2;

  const commonDivisor = gcd(ta, tb);
  ta /= commonDivisor;
  tb /= commonDivisor;

  return compareAndReturn(t1, [ta, tb]);
}

function findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2) {
  if (b1 === b2) {
    if ((d1 - d2) % 360 === 0 || b1 === 0) {
      return [0, 1];
    }
    return null;
  }

  // BIGINT FIX: Verify strictly using multiplication to avoid overflow
  // (a1 - a2) * (b1 - b2) > 0 check:
  const diffA = BigInt(a1 - a2);
  const diffB = BigInt(b1 - b2);

  if (diffA * diffB > 0n) {
    return null;
  }

  if (a2 > a1) {
    [a1, a2, b1, b2] = [a2, a1, b2, b1];
  }

  let ta = b2 - b1;
  let tb = a1 - a2;

  const commonDivisor = gcd(ta, tb);
  ta /= commonDivisor;
  tb /= commonDivisor;

  // BIGINT FIX: The verification math
  // ((c1 - c2) * ta + (d1 - d2) * tb) % (360 * tb) === 0
  const term1 = BigInt(c1 - c2) * BigInt(ta);
  const term2 = BigInt(d1 - d2) * BigInt(tb);
  const total = term1 + term2;
  const modBase = BigInt(360) * BigInt(tb);

  // Check collision conditions
  const rZero = BigInt(a1) * BigInt(ta) + BigInt(b1) * BigInt(tb) === 0n;
  const angleMatch = total % modBase === 0n;

  if (rZero || angleMatch) {
    return [ta, tb];
  }

  return null;
}

function solve() {
  let out = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Safety for splitting strings with multiple spaces
    const parameters = line.split(/\s+/).map((x) => parseInt(x));

    if (parameters.length < 8) continue;
    if (!parameters.some((x) => x !== 0)) {
      break;
    }

    const collision = findCollision(...parameters);

    out += collision + "\n";
  }

  out += "\n";
  return out;
}

process.stdout.write(solve());
