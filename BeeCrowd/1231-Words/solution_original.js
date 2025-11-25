"use strict";
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split("\n");

/**
 * Problem: 1231 - Words
 * Answer: Accepted
 * Language: JavaScript 12.18 (nodejs 12.18.3) [+2s]
 * Runtime: 0.099s
 * File size: 1.92 KB
 * Memory: -
 * Submission: 11/11/25, 6:44:00 PM
 */

class Node {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new Node();
  }

  insert(word) {
    let node = this.root;
    for (const l of word) {
      l in node.children || (node.children[l] = new Node());
      node = node.children[l];
    }
    node.isEnd = true;
  }
}

function equalPathsDFS(root1, root2) {
  function recursivePaths(n1, n2, dep) {
    // Test for Depth limit
    if (dep === 40) {
      return false;
    }
    // Test for Reached both ends:
    if (n1.isEnd && n2.isEnd) {
      return true;
    }

    // test for equal paths:
    if ("0" in n1.children && "0" in n2.children) {
      if (recursivePaths(n1.children["0"], n2.children["0"], dep + 1)) {
        return true;
      }
    }
    if ("1" in n1.children && "1" in n2.children) {
      if (recursivePaths(n1.children["1"], n2.children["1"], dep + 1)) {
        return true;
      }
    }

    // If some node is the end:
    if (n1.isEnd) {
      if (recursivePaths(root1, n2, dep)) {
        return true;
      }
    }
    if (n2.isEnd) {
      if (recursivePaths(n1, root2, dep)) {
        return true;
      }
    }
    return false;
  }
  return recursivePaths(root1, root2, 0);
}

var i = 0;
var output = "";

while (i < lines.length - 1) {
  const [sizeGroup1, sizeGroup2] = lines[i++]
    .split(" ")
    .map((x) => parseInt(x));
  const [trie1, trie2] = [new Trie(), new Trie()];

  for (let w = 0; w < sizeGroup1; w++) {
    trie1.insert(lines[i++]);
  }

  for (let w = 0; w < sizeGroup2; w++) {
    trie2.insert(lines[i++]);
  }

  output += equalPathsDFS(trie1.root, trie2.root) ? "S\n" : "N\n";
}

process.stdout.write(output);
