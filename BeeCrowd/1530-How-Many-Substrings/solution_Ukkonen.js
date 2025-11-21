/**
 * Problem: Beecrowd 1530 - How Many Substrings?
 * Language: JavaScript (Node.js)
 * Ukkonen Algorithm
 * Optimization: TypedArrays, Struct-of-Arrays, 1-based Indexing, Fast I/O,
 * runtime: 0.735s
 */

const fs = require("fs");

function solve() {
  const buffer = fs.readFileSync(0);
  let bufIdx = 0;
  const bufLen = buffer.length;

  // Max string length is 2*10^5. Suffix Tree has at most 2*N nodes.
  const MAXN = 200005;
  const MAX_NODES = MAXN * 2;

  // Tree Arrays (Struct-of-Arrays)
  // using 1-based indexing for nodes. 0 means null.
  const t_start = new Int32Array(MAX_NODES);
  const t_len = new Int32Array(MAX_NODES); // Length of the edge to this node
  const t_link = new Int32Array(MAX_NODES);
  const t_depth = new Int32Array(MAX_NODES); // String depth of the node

  // Children edges: flat array. node i, char c -> t_next[i * 26 + c]
  const t_next = new Int32Array(MAX_NODES * 26);

  // Helper to map char code to 0-25
  // 'a' is 97.

  // Input processing loop
  while (bufIdx < bufLen) {
    // Skip whitespace/newlines to find start of line
    while (bufIdx < bufLen && buffer[bufIdx] <= 32) bufIdx++;
    if (bufIdx >= bufLen) break;

    // Start of a test case
    let nodesCount = 1; // Root is 1
    // Reset Root (1)
    t_len[1] = 0; // infinity for leaves, but root has len 0? No, root edge len is 0.
    t_link[1] = 0;
    t_depth[1] = 0;
    // We need to clear children for Root.
    // Since we reuse the big array, we only clear what we use.
    // But for the root, we must clear its range.
    const rootOffset = 26; // 1 * 26
    for (let i = 0; i < 26; i++) t_next[rootOffset + i] = 0;

    // Active Point
    let activeNode = 1;
    let activeLen = 0;
    let activeEdgeChar = -1; // Index in the CURRENT string
    let rem = 0; // Remainder

    // String management
    // We don't store the full string object, but we need random access.
    // We can use a localized Int32Array for the current line's string codes.
    // Since we process char by char, we can just fill this array.
    const str = new Int32Array(MAXN);
    let strLen = 0;

    let totalSubstrings = 0n; // Use BigInt to be safe, though number fits in double (2e5 * 2e5 / 2 ~ 2e10)

    let output = "";

    while (bufIdx < bufLen) {
      const charCode = buffer[bufIdx];

      // Check for end of line
      if (charCode <= 32) {
        bufIdx++;
        break;
      }
      bufIdx++;

      if (charCode === 63) {
        // '?'
        output += totalSubstrings.toString() + "\n";
        continue;
      }

      // It's a letter 'a'-'z'
      const charVal = charCode - 97;
      str[strLen] = charVal;
      strLen++;
      rem++;

      let lastNewNode = 0;

      while (rem > 0) {
        if (activeLen === 0) {
          activeEdgeChar = strLen - 1; // current index
        }

        const edgeChar = str[activeEdgeChar];
        // Check if activeNode has child starting with edgeChar
        // t_next index: activeNode * 26 + edgeChar
        const childIndex = activeNode * 26 + edgeChar;
        const child = t_next[childIndex];

        if (child === 0) {
          // Rule 2: Create Leaf
          nodesCount++;
          const leaf = nodesCount;

          t_start[leaf] = strLen - 1;
          t_len[leaf] = 2000000000; // Infinity
          t_link[leaf] = 1; // Leaves usually don't need links, but safety
          t_depth[leaf] = t_depth[activeNode] + t_len[leaf]; // Not really used for leaves

          // Clear children for the new node (important for reuse)
          const leafOffset = leaf * 26;
          // Unrolling clear loop slightly or just Loop
          // Optimization: Leaves don't have children initially.
          // But if we reuse memory, it might have garbage.
          // Given time limit, we MUST clear.
          for (let k = 0; k < 26; k++) t_next[leafOffset + k] = 0;

          t_next[childIndex] = leaf;

          if (lastNewNode !== 0) {
            t_link[lastNewNode] = activeNode;
            lastNewNode = 0;
          }
        } else {
          // Edge exists. Check if we need to walk down.
          // Calculate edge length.
          // child's edge length is strictly t_len[child].
          // However, for leaf nodes, t_len is infinity.
          // We need actual length on string if it were finite?
          // No, Ukkonen canonize handles it.

          let edgeLen = t_len[child];
          if (edgeLen > 1000000) {
            // If infinity
            edgeLen = strLen - t_start[child]; // Current conceptual length
          }

          if (activeLen >= edgeLen) {
            // Walk down
            activeEdgeChar += edgeLen;
            activeLen -= edgeLen;
            activeNode = child;
            continue; // Continue outer while loop (canonize)
          }

          // Position on edge
          // Char at (child.start + activeLen)
          const existingChar = str[t_start[child] + activeLen];

          if (existingChar === charVal) {
            // Rule 3: Extension (already exists)
            activeLen++;
            if (lastNewNode !== 0) {
              t_link[lastNewNode] = activeNode;
              lastNewNode = 0; // Standard Ukkonen says link to activeNode here
            }
            break; // Stop processing remainder
          }

          // Rule 2: Split Edge
          nodesCount++;
          const split = nodesCount;

          t_start[split] = t_start[child];
          t_len[split] = activeLen;
          t_depth[split] = t_depth[activeNode] + activeLen; // Update depth

          const splitOffset = split * 26;
          for (let k = 0; k < 26; k++) t_next[splitOffset + k] = 0;

          // Update parent to point to split
          t_next[childIndex] = split;

          // Create new leaf for the new char
          nodesCount++;
          const leaf = nodesCount;
          t_start[leaf] = strLen - 1;
          t_len[leaf] = 2000000000;
          // Clear leaf children
          const leafOffset = leaf * 26;
          for (let k = 0; k < 26; k++) t_next[leafOffset + k] = 0;

          // Child (original node) logic
          t_start[child] += activeLen;
          if (t_len[child] < 1000000) t_len[child] -= activeLen; // Only decrease if finite

          // Connect split to children
          t_next[splitOffset + charVal] = leaf;
          t_next[splitOffset + existingChar] = child;

          if (lastNewNode !== 0) {
            t_link[lastNewNode] = split;
          }
          lastNewNode = split;
        }

        // Decrement Remainder and Move Suffix Link
        rem--;
        if (activeNode === 1 && activeLen > 0) {
          activeLen--;
          activeEdgeChar = strLen - rem; // Start of next suffix
        } else if (activeNode !== 1) {
          activeNode = t_link[activeNode];
        }
      }

      // Calculate substrings count
      // Total Substrings += (Current String Length) - (Depth of Active Point)
      // Current String Length = strLen
      // Depth of Active Point = t_depth[activeNode] + activeLen
      const activeDepth = t_depth[activeNode] + activeLen;
      totalSubstrings += BigInt(strLen - activeDepth);
    }

    process.stdout.write(output);
  }
}

solve();
