"use strict";

// Use a large buffer to read input quickly
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split(/\s+/); // Split by any whitespace

/**
 * Problem: 1231 - Words
 * Language: JavaScript (Node.js)
 * Approach: Simultaneous DFS on Two Tries with Memoization
 */

// Global counter to assign unique IDs to every node for fast state caching
let nodeIdCounter = 0;

class Node {
  constructor() {
    // Optimization: Use Array(2) instead of Object for children.
    // Index 0 for '0', Index 1 for '1'.
    this.children = [null, null];
    this.isEnd = false;
    this.id = nodeIdCounter++; // Unique integer ID for this node
  }
}

class Trie {
  constructor() {
    this.root = new Node();
  }

  insert(word) {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      // Convert char '0'/'1' to integer 0/1
      const idx = word.charCodeAt(i) - 48;
      if (!node.children[idx]) {
        node.children[idx] = new Node();
      }
      node = node.children[idx];
    }
    node.isEnd = true;
  }
}

function solve() {
  let cursor = 0;

  // Process all test cases
  while (cursor < lines.length) {
    const N1 = parseInt(lines[cursor++]);
    const N2 = parseInt(lines[cursor++]);

    // Reset global ID counter for each test case to keep IDs small
    nodeIdCounter = 0;

    const trie1 = new Trie();
    const trie2 = new Trie();

    for (let i = 0; i < N1; i++) trie1.insert(lines[cursor++]);
    for (let i = 0; i < N2; i++) trie2.insert(lines[cursor++]);

    // Visited Set to store states we've already processed.
    // State key: a combination of node1.id and node2.id
    const visited = new Set();

    function dfs(n1, n2) {
      // 1. Successful Match Condition:
      // If both pointers are at the end of a word simultaneously, we found a match.
      // Note: We can return true immediately, OR we could continue to see if
      // longer matches exist. For this problem, finding *one* is enough.
      if (n1.isEnd && n2.isEnd) return true;

      // 2. Memoization / Cycle Detection:
      // Generate a unique key for the state (n1, n2).
      // Since we have max ~800 nodes (20 words * 40 chars), IDs fit in 11 bits.
      // (n1.id << 12) | n2.id creates a unique integer hash.
      const stateKey = (n1.id << 12) | n2.id;

      if (visited.has(stateKey)) return false;
      visited.add(stateKey);

      // 3. Transitions: Try to move both pointers forward with '0' and '1'

      // Try matching '0'
      if (n1.children[0] && n2.children[0]) {
        if (dfs(n1.children[0], n2.children[0])) return true;
      }

      // Try matching '1'
      if (n1.children[1] && n2.children[1]) {
        if (dfs(n1.children[1], n2.children[1])) return true;
      }

      // 4. Epsilon Transitions (Word Boundaries):
      // If we reached the end of a word in Set 1, we can "restart" traversal
      // at the root of Set 1, effectively concatenating a new word from Set 1.
      // We keep n2 at its current position.
      if (n1.isEnd) {
        if (dfs(trie1.root, n2)) return true;
      }

      // Same logic for Set 2
      if (n2.isEnd) {
        if (dfs(n1, trie2.root)) return true;
      }

      return false;
    }

    // Start DFS from the roots of both Tries
    if (dfs(trie1.root, trie2.root)) {
      process.stdout.write("S\n");
    } else {
      process.stdout.write("N\n");
    }
  }
}

solve();
