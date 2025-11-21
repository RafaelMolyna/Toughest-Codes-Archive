"use strict";
const fs = require("fs");

// -------------------------------------------------------------------------
// CONSTANTS & MEMORY ALLOCATION
// -------------------------------------------------------------------------
// Max characters sum is 10^6. Trie nodes <= 10^6 + 1.
const MAX_NODES = 1000005;
const ALPHABET = 26;

// Global TypedArrays to simulate C-like memory
// children: flatted array. node U's child C is at index (U * 26 + C)
const children = new Int32Array(MAX_NODES * ALPHABET);
const failLink = new Int32Array(MAX_NODES);
const dp = new Int32Array(MAX_NODES);
const isWord = new Uint8Array(MAX_NODES);

// Manual Queue for BFS
const q = new Int32Array(MAX_NODES);

let nodesCount = 1; // Start with 1 (Root is 0)

// -------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------

// Efficiently clear a node's data for reuse
// We assume 'node' index is being allocated for the first time in this test case
function clearNode(node) {
  const start = node * ALPHABET;
  // We must clear the children slots because they might contain
  // "DFA shortcuts" from the previous test case.
  // Hand-unrolling or fill is safer here.
  children.fill(0, start, start + ALPHABET);

  failLink[node] = 0;
  dp[node] = 0;
  isWord[node] = 0;
}

// -------------------------------------------------------------------------
// MAIN LOGIC
// -------------------------------------------------------------------------

// Read all stdin into a buffer
const buffer = fs.readFileSync(0);
let bufferIdx = 0;
const bufLen = buffer.length;

// Helper to skip whitespace and return if EOF
function skipWhitespace() {
  while (bufferIdx < bufLen && buffer[bufferIdx] <= 32) {
    bufferIdx++;
  }
  return bufferIdx < bufLen;
}

// Read integer
function readInt() {
  if (!skipWhitespace()) return null;

  let res = 0;
  let charCode = buffer[bufferIdx];
  while (bufferIdx < bufLen && charCode >= 48 && charCode <= 57) {
    res = res * 10 + (charCode - 48);
    bufferIdx++;
    if (bufferIdx < bufLen) charCode = buffer[bufferIdx];
  }
  return res;
}

// Consume a word from buffer and insert directly into Trie
// Returns nothing, side-effect only
function readAndInsertWord() {
  if (!skipWhitespace()) return;

  let curr = 0; // Root
  let charCode = buffer[bufferIdx];

  // Read 'a'-'z' (97-122)
  while (bufferIdx < bufLen && charCode > 32) {
    const idx = charCode - 97; // 'a' -> 0

    // Calculate flat index for children[curr][idx]
    const flatIdx = curr * ALPHABET + idx;

    if (children[flatIdx] === 0) {
      // Allocate new node
      clearNode(nodesCount);
      children[flatIdx] = nodesCount;
      nodesCount++;
    }

    curr = children[flatIdx];

    bufferIdx++;
    if (bufferIdx < bufLen) charCode = buffer[bufferIdx];
  }

  isWord[curr] = 1;
}

function solve() {
  let head = 0;
  let tail = 0;
  let maxChain = 0;

  // 1. Initialize Root's children (Depth 1)
  // Root is 0. failLink[0] is 0. dp[0] is 0.

  // Iterate root's children manually
  // Root's children start at index 0 in the flat array
  for (let i = 0; i < ALPHABET; i++) {
    const child = children[i]; // children[0 * 26 + i]
    if (child !== 0) {
      failLink[child] = 0;
      if (isWord[child] === 1) {
        dp[child] = 1;
        if (maxChain < 1) maxChain = 1;
      } else {
        dp[child] = 0;
      }
      q[tail++] = child;
    }
  }

  // 2. BFS
  while (head < tail) {
    const u = q[head++];
    const uFail = failLink[u];
    const uDp = dp[u];

    const uBase = u * ALPHABET;
    const failBase = uFail * ALPHABET;

    for (let i = 0; i < ALPHABET; i++) {
      const v = children[uBase + i];
      const failTarget = children[failBase + i]; // Equivalent to trie[fail[u]][i]

      if (v !== 0) {
        // Child exists (Real Edge)
        failLink[v] = failTarget;

        // DP Logic
        let val = uDp;
        const suffixVal = dp[failTarget];
        if (suffixVal > val) val = suffixVal;

        if (isWord[v] === 1) val++;

        dp[v] = val;
        if (val > maxChain) maxChain = val;

        q[tail++] = v;
      } else {
        // Child doesn't exist: DFA shortcut (Flattening)
        // Point directly to the failure's child
        children[uBase + i] = failTarget;
      }
    }
  }
  return maxChain;
}

// -------------------------------------------------------------------------
// EXECUTION
// -------------------------------------------------------------------------

while (true) {
  const n = readInt();
  if (n === null || n === 0) break;

  // Reset global cursor
  nodesCount = 1;
  clearNode(0); // Clear root

  // Read N words
  for (let i = 0; i < n; i++) {
    readAndInsertWord();
  }

  console.log(solve());
}
