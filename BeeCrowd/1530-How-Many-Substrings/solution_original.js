"use strict";
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split("\n");

/** Description
 * p1530 - How many substrings
 * Runtime: 2.802s
 * Ukkonen's Algorithm:
 * https://www.youtube.com/watch?v=ALEV0Hc5dDk
 * https://www.youtube.com/watch?v=OT5CigmVfh0
 * https://www.geeksforgeeks.org/ukkonens-suffix-tree-construction-part-1/
 */

const alfDic = {};
const alfArr = "abcdefghijklmnopqrstuvwxyz".split("");
alfArr.forEach((l, i) => (alfDic[l] = i));

class SuffixBranch {
  constructor(start = null, end = null, sfxLink = null, children = null) {
    this.start = start;
    this.end = end;
    this.sfxLink = sfxLink;
    this.children = children;
  }

  /**
   * Split the branch in the actP (NOT in Tail and L!=l).
   * @returns {*} the pair [node created, node splitted].
   */
  createNodeInEdge() {
    // * this -> current edge
    const ap = SuffixBranch.actP;
    const newNode = new SuffixBranch(
      ap.i_str,
      ap.str.length,
      SuffixBranch.root
    );
    const remNode = new SuffixBranch(
      ap.i_edge,
      this.end,
      this.sfxLink,
      this.children
    ); // ! this.sfxLink ????
    this.children = new Array(26).fill();
    this.children[ap.L] = newNode;
    this.children[ap.l] = remNode;
    this.end = ap.i_edge - 1;
    return [newNode, remNode];
  }

  /**
   * Split the branch in the actP (IN Tail and not ch[L]).
   * @returns {*} the new node created
   */
  createNodeInTail() {
    // * this -> current edge
    const ap = SuffixBranch.actP;
    const newNode = new SuffixBranch(
      ap.i_str,
      ap.str.length,
      SuffixBranch.root
    );
    this.children[ap.L] = newNode;
    return newNode;
  }

  static initialize(str) {
    this.root = new SuffixBranch(-1, -1, null, new Array(26).fill());
    this.actP = new ActPoint(str, this.root);
    return this.actP;
  }
}

class ActPoint {
  constructor(str, root) {
    // Active Point Variables:
    this.i_str = 0; // string comparison position
    this.L = str[0]; // the curr str character
    this.i_edge = 0; // edge comparison position
    this.node = root; // node at edge's bottom tail (structure is: r ---n ---n ...)
    // Complementary Variables:
    this.str = str;
    this.numSubStr = 0; // Counting variable
    this.depth = 0; // Depth on the Tree
  }

  /**
   * The string in the edge to be compared.
   */
  get l() {
    return this.str[this.i_edge];
  }

  // Tests:
  inRoot() {
    return this.node.sfxLink === null;
  }
  inTail() {
    return this.i_edge > this.node.end;
  }

  // Steps in and out:
  stepInEdge() {
    this.i_edge++;
    this.depth++;
  }
  stepInNode() {
    this.node = this.node.children[this.L];
    this.i_edge = this.node.start + 1;
    this.depth++;
  }

  /**
   * Creates chain of sfxLinks in tail position.
   * @param {*} n1: The previous created node
   */
  connectSfxLink_tail(n1) {
    while (!this.inRoot() && n1) {
      this.runSfxLink(); // Set actP to next sfxNode
      n1 = this.checkAndConnect(n1);
    }
  }

  /**
   * Tests if have next node and create one if note
   * @param {*} n1 the previous node
   * @returns next sfxNode or null if already exists
   */
  checkAndConnect(n1) {
    if (this.node.children[this.L]) {
      n1.sfxLink = this.node.children[this.L]; // order matters!
      this.stepInNode();
      return null;
    }
    n1.sfxLink = this.node.createNodeInTail();
    return n1.sfxLink;
  }

  /**
   * Updates active node to the next suffix link (must NOT be on root)
   */
  runSfxLink() {
    //* Reviewed Ok;
    this.depth--;
    let sfx = this.node.sfxLink;
    let distOnEdge = sfx.end - sfx.start + 1; // curr edge length // ! the "+1" ensures (len -= 1) when in ROOT.
    let distToWalk = this.i_edge - this.node.start; // the length on edge (from startPos to currPos)
    let i_str = this.node.start;

    while (distToWalk > distOnEdge) {
      // ! ">" ensures it will AT MOST stop in TAIL's position (even for root)
      i_str += distOnEdge; // next str position
      sfx = sfx.children[this.str[i_str]]; // next node
      distToWalk -= distOnEdge; // update length of currPos on the edge
      distOnEdge = sfx.end - sfx.start + 1; // update edge length
    }

    // Definitely Update ActPoint:
    this.node = sfx;
    this.i_edge = sfx.start + distToWalk;
  }

  /**
   * Increment the Str Positions and number of Substrings
   */
  nextChar() {
    this.i_str++;
    this.L = this.str[this.i_str];
    this.numSubStr += this.i_str - this.depth; //* Reviewed Ok;
  }
}

/**
 * Inserts one char L in the tree, and updates the AP.
 * @param {Object} ap  The active point.
 */
function insertNext(ap) {
  if (!ap.inTail()) {
    //* 1) ON EDGE (not tail)

    if (ap.L === ap.l) {
      //* 1.A) WALK: step on edge.
      ap.stepInEdge();
      return;
    }

    //* 1.B) CREATE BRANCH: split the branch. SUFFIX CHAIN ->

    let [n1, r1] = ap.node.createNodeInEdge(); // Create new splitBranch (as n1) and remaining branch (as r1)
    ap.runSfxLink(); // Set actP to next sfxNode (update ActP)

    while (!ap.inTail()) {
      // inTail covers inRoot
      const [n2, r2] = ap.node.createNodeInEdge(); // Create next splitBranch (as n2) and remaining branch (as r2)
      n1.sfxLink = n2; // Link n1.sfx to n2
      r1.sfxLink = r2;
      n1 = n2; // Update ref
      r1 = r2;
      ap.runSfxLink(); // Set actP to next sfxNode (update ActP)
    }

    r1.sfxLink = ap.node.children[ap.str[r1.start]]; // sets last remaining sfx
    n1 = ap.checkAndConnect(n1);

    if (n1) {
      ap.connectSfxLink_tail(n1);
    }

    return;
  } else {
    //* 2) ON TAIL (can be the root)

    if (ap.node.children[ap.L]) {
      //* 2.A) WALK: jump to next edge
      ap.stepInNode();
      return;
    }
    //* 2.B) CREATE BRANCH: add child to node. SUFFIX CHAIN ->

    let n1 = ap.node.createNodeInTail(); // Create new splitBranch (as n1)
    ap.connectSfxLink_tail(n1);

    return;
  }
}

// Main function ========================================================
function main() {
  var output = "";

  lines.forEach((line) => {
    const chunksStr = line.split("?").slice(0, -1);
    const chunkSizes = chunksStr.map((s) => s.length);
    const str = chunksStr
      .join("")
      .split("")
      .map((l) => alfDic[l]);

    // Active Point:
    const ap = SuffixBranch.initialize(str);

    chunkSizes.forEach((size) => {
      for (let i = 0; i < size; i++) {
        // Inserts the letter L in the tree:
        insertNext(ap);
        ap.nextChar();
      }

      output += `${ap.numSubStr}\n`;
    });
  });

  process.stdout.write(output);
}

main();
