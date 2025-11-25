"use strict";
const input = require("fs").readFileSync(0, "utf8");
const lines = input.split("\n");

/**
 * Problem: 1346 - Child Play
 * Answer: Accepted
 * Language: JavaScript 12.18 (nodejs 12.18.3) [+2s]
 * Runtime: 0.235s
 * File size: 4.82 KB
 * Memory: -
 * Submission: 11/24/25, 11:40:00 PM
 * rank: 1st
 */

class Card {
  constructor(pair) {
    this.v_small = pair[0];
    this.v_large = pair[1];
    this.v_diff = pair[1] - pair[0];
    this.v_sum = pair[1] + pair[0];
    this.sumPrec = 0;
    this.triedSums = {};
  }
}

function testSumsRecurs(cards, currIndex, sumDesired) {
  /**
   * This function returns true if the sumDesired is obtainable or false otherwise.
   * Meanwhile the function iterates throw each value, in descending order, and saves the
   * information if the value is possible as an addition or possible as a subtraction.
   * As a dynamic algorithm (and this is crucial), for each step, the function saves in
   * the step "triedSums" obj the state of the sumDesired, i.e. if it is possible or not,
   * because, in this case, the algorithm has already been run for it, infos are saved,
   * and it's no more necessary to do it again (returning only the state).
   */
  var currItem = cards[currIndex];

  // If element is the LAST ONE in the row: (end of recursion)
  if (currIndex === -1) {
    if (0 === sumDesired) {
      // sumDesired is possible:
      return true;
    }

    // sumDesired is NOT possible:
    return false;
  }

  var { v_diff, sumPrec, triedSums } = currItem;

  // Dynamic programming: check if this sum has already been tried:
  if (triedSums[sumDesired] !== undefined) {
    return triedSums[sumDesired];
  }

  const signal = sumDesired > 0 ? 1 : -1;

  // Try to get CLOSE to sumDesired:
  var sumDesired1 = sumDesired - signal * v_diff;
  if (-sumPrec <= sumDesired1 && sumDesired1 <= +sumPrec) {
    var out1 = testSumsRecurs(cards, currIndex - 1, sumDesired1);
    if (out1) {
      triedSums[sumDesired] = true;
      return true;
    }
  }

  // Try to go OPPOSITE to sumDesired:
  var sumDesired2 = sumDesired + signal * v_diff;
  if (-sumPrec <= sumDesired2 && sumDesired2 <= +sumPrec) {
    var out2 = testSumsRecurs(cards, currIndex - 1, sumDesired2);
    if (out2) {
      triedSums[sumDesired] = true;
      return true;
    }
  }

  triedSums[sumDesired] = false;
  return false;
}

function solveOne(cards) {
  // Calculate cumulative sums:
  cards[0].sumPrec = 0;
  cards.forEach((c) => (c.triedSums = {}));
  cards.slice(0, -1).forEach((c, i) => {
    cards[i + 1].sumPrec = c.sumPrec + c.v_diff;
  });

  const sumDesired = 0;
  const sum = cards.reduce((acc, e) => acc + e.v_sum, 0) + sumDesired;
  if (sum % 2 === 1) {
    return [false, sum];
  }

  const result = testSumsRecurs(cards, cards.length - 1, sumDesired);
  return [result, sum];
}

function solveIt(cards) {
  // Single card case:
  if (cards.length === 1) {
    if (cards[0].v_diff === 0) {
      return `${card[0].v_small} discard none\n`;
    } else {
      return `${0} discard ${cards[0].v_small} ${cards[0].v_large}\n`;
    }
  }

  var [result, sum] = solveOne(cards);

  // No need to discard cards:
  if (result) {
    return `${sum / 2} discard none\n`;
  }

  // Try solutions discarding one card:
  var altSolutions = [];
  cards.forEach((c, i) => {
    let cards_i = cards.slice();
    cards_i.splice(i, 1);
    let [result_i, sum_i] = solveOne(cards_i);
    // console.log(`${c_i.v_small} ${c_i.v_large} ${result_i}`);

    if (result_i) {
      altSolutions.push(c);
    }
  });

  if (altSolutions.length) {
    var card = altSolutions.reduce(altCard);
    // console.log(altSolutions.map(c => `${c.v_small} ${c.v_large}\n`))
    return `${(sum - card.v_sum) / 2} discard ${card.v_small} ${
      card.v_large
    }\n`;
  }

  // If no solution is possible:
  return "impossible\n";
}

function altCard(acc, e) {
  if (e.v_sum < acc.v_sum) {
    return e;
  }
  if (acc.v_sum === e.v_sum && e.v_small < acc.v_small) {
    return e;
  }
  return acc;
}

lines.reverse();
var numInputs = parseInt(lines.pop());
var outputStr = "";

while (numInputs !== 0) {
  // Read inputs ->
  // transform into object "InputBank" ->
  // sort these inputs (ascending) based on their values, but they
  // have their index stored, so we can recover the initial order.
  const cards = lines
    .splice(-numInputs)
    .map(
      (l, i) =>
        new Card(
          l
            .split(" ")
            .map((x) => parseInt(x))
            .sort((e1, e2) => e1 - e2),
          i
        )
    )
    .sort((e1, e2) => e1.v_diff - e2.v_diff);

  outputStr += solveIt(cards);

  numInputs = parseInt(lines.pop());
}

process.stdout.write(outputStr);
