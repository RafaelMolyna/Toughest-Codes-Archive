"use strict";
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split("\n");

/**
 * Problem: 1023 - Drought
 * Answer: Accepted
 * Language: JavaScript 12.18 (nodejs 12.18.3) [+2s]
 * Runtime: 1.336s
 * File size: 1.14 KB
 * Memory: -
 * Submission: 11/11/25, 6:54:52 PM
 */

var i = 1;
var numCidade = 1;
const out = [];
var numCasas = parseInt(lines[0]);

while (numCasas > 0) {
  const city = {}; // {averageConsumptionHouse: numberOfResidents}
  var totalResid = 0,
    totalCons = 0;

  for (var j = 0; j < numCasas; j++) {
    const [r, c] = lines[i++].split(" ").map((x) => parseInt(x));
    const avConsHouse = Math.floor(c / r);

    totalResid += r;
    totalCons += c;

    city[avConsHouse] = (city[avConsHouse] || 0) + r;
  }

  const avConsCity = (Math.floor((totalCons / totalResid) * 100) / 100).toFixed(
    2
  );

  const listSorted = Object.keys(city)
    .sort((c1, c2) => c1 - c2)
    .map((c) => `${city[c]}-${c}`)
    .join(" ");

  out.push(
    `Cidade# ${numCidade++}:\n${listSorted}\nConsumo medio: ${avConsCity} m3.\n`
  );
  out.push("\n");

  numCasas = parseInt(lines[i++]);
}

out.pop();
process.stdout.write(out.join(""));
