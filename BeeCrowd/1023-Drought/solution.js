/**
 * Problem: 1023 - Drought
 * Platform: BeeCrowd
 * Language: JavaScript (Node.js 12+)
 * Logic: Buffer I/O + Int32Array (Bucket Sort)
 */

const fs = require("fs");

function solve() {
  // 1. FAST I/O
  // We read stdin as a raw binary buffer (no encoding).
  // This avoids converting the massive input into a UTF-8 string.
  const buffer = fs.readFileSync(0);
  let bufferIdx = 0;

  // Helper to read integer from buffer byte-by-byte
  function readInt() {
    let res = 0;
    if (bufferIdx >= buffer.length) return null;

    let charCode = buffer[bufferIdx];

    // Skip whitespace/newlines
    while (charCode < 48 || charCode > 57) {
      bufferIdx++;
      if (bufferIdx >= buffer.length) return null;
      charCode = buffer[bufferIdx];
    }

    // Accumulate digits
    while (charCode >= 48 && charCode <= 57) {
      res = res * 10 + (charCode - 48);
      bufferIdx++;
      if (bufferIdx >= buffer.length) break;
      charCode = buffer[bufferIdx];
    }
    return res;
  }

  let cityNumber = 1;

  // 2. DATA STRUCTURE
  // Int32Array is a TypedArray. It is much faster than a generic JS Array
  // and uses less memory. Size 201 covers consumption 0 to 200.
  const counts = new Int32Array(201);

  let output = "";

  while (true) {
    const N = readInt();
    if (N === null || N === 0) break;

    // Reset bucket counts
    counts.fill(0);

    let totalResid = 0;
    let totalCons = 0;

    for (let i = 0; i < N; i++) {
      const X = readInt();
      const Y = readInt();

      totalResid += X;
      totalCons += Y;

      // Bitwise OR 0 (| 0) is a fast way to do Math.floor() in JS
      const avg = (Y / X) | 0;
      counts[avg] += X;
    }

    if (cityNumber > 1) output += "\n\n";

    output += `Cidade# ${cityNumber}:`;
    cityNumber++;

    // 3. SORTING
    // The sorting is implicit. We iterate the array indices (0..200).
    for (let i = 0; i <= 200; i++) {
      if (counts[i] > 0) {
        output += ` ${counts[i]}-${i}`;
      }
    }

    // 4. MATH
    // Calculate truncated average using integer math
    const avgInt = (totalCons * 100) / totalResid;
    const whole = Math.floor(avgInt / 100);
    let frac = Math.floor(avgInt % 100);

    // Pad fraction with leading zero if necessary (e.g., 5 -> 05)
    if (frac < 10) frac = "0" + frac;

    output += `\nConsumo medio: ${whole}.${frac} m3.`;
  }

  process.stdout.write(output + "\n");
}

solve();
