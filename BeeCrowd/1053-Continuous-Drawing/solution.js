"use strict";
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split(/[\n\r]+/).reverse();

const CHAR_TO_ROW = { A: 0, B: 1, C: 2, D: 3, E: 4 };
const ROW_TO_CHAR = ["A", "B", "C", "D", "E"];

// Point array indices
const LINK_ARR = 0;
const DEG = 1;
const DISTANCE = 2;
const VISITED = 3;

// Link array indices
const NAME = 0;
const DIST = 1;

function a1ToPoint(str) {
  const [char, num] = str.split("");
  return [CHAR_TO_ROW[char], +num - 1];
}

function pointToA1(r, c) {
  return ROW_TO_CHAR[r] + (c + 1);
}

function linkPoint(adjList, p1str, p2str, dist) {
  if (adjList[p1str]) {
    adjList[p1str][LINK_ARR].push([p2str, dist]); // link: [name, dist]
    adjList[p1str][DEG]++;
  } else {
    // point: [linkArr, deg, distance, visited]
    adjList[p1str] = [[[p2str, dist]], 1, Infinity, false];
    adjList.arr.push(p1str);
    adjList.numP++;
  }
}

function linkSegmentOnAdjList(adjList, p1str, p2str, dist) {
  linkPoint(adjList, p1str, p2str, dist);
  linkPoint(adjList, p2str, p1str, dist);
  adjList.length += dist;
}

function buildAdjacencyList(arrSegments, numSegments) {
  const adjList = { arr: [], numP: 0, length: 0 };
  for (let i = 0; i < numSegments; i++) {
    const [p1str, p2str] = arrSegments[i];
    let [x1, y1] = a1ToPoint(p1str);
    let [x2, y2] = a1ToPoint(p2str);
    const [origP1str, origP2str] = [p1str, p2str];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const abs_dx = Math.abs(dx);
    const abs_dy = Math.abs(dy);

    if (abs_dx === abs_dy || abs_dx === 0 || abs_dy === 0) {
      const [direction_x, direction_y] = [Math.sign(dx), Math.sign(dy)];
      const dist = abs_dx === abs_dy ? Math.sqrt(2) : 1;
      while (x1 !== x2 || y1 !== y2) {
        const p1 = pointToA1(x1, y1);
        x1 += direction_x;
        y1 += direction_y;
        const p2 = pointToA1(x1, y1);
        linkSegmentOnAdjList(adjList, p1, p2, dist);
      }
    } else if (
      (abs_dx === 2 && abs_dy === 4) ||
      (abs_dy === 2 && abs_dx === 4)
    ) {
      const middlePoint = pointToA1((x1 + x2) / 2, (y1 + y2) / 2);
      const dist = Math.sqrt(5);
      linkSegmentOnAdjList(adjList, origP1str, middlePoint, dist);
      linkSegmentOnAdjList(adjList, origP2str, middlePoint, dist);
    } else {
      linkSegmentOnAdjList(
        adjList,
        origP1str,
        origP2str,
        Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
      );
    }
  }
  return adjList;
}

function removePathPoints(adjacencyList) {
  for (let i = 0; i < adjacencyList.numP; ) {
    const A1notation = adjacencyList.arr[i];
    const point = adjacencyList[A1notation];
    if (point[DEG] === 2) {
      const p1 = point[LINK_ARR][0];
      const p2 = point[LINK_ARR][1];

      if (p1[NAME] !== p2[NAME]) {
        const totalDistance = p1[DIST] + p2[DIST];
        replaceLink(
          adjacencyList,
          p1[NAME],
          A1notation,
          p2[NAME],
          totalDistance
        );
        replaceLink(
          adjacencyList,
          p2[NAME],
          A1notation,
          p1[NAME],
          totalDistance
        );
      } else {
        findLoopLinkAndDelete(adjacencyList, p1[NAME], A1notation);
      }

      delete adjacencyList[A1notation];
      adjacencyList.numP--;
      adjacencyList.arr.splice(i, 1);
    } else {
      i++;
    }
  }
}

function replaceLink(adjList, name, nameFind, newName, newDist) {
  const link = findLink(adjList, name, nameFind);
  if (link) {
    link[NAME] = newName;
    link[DIST] = newDist;
  }
}

function findLink(adjList, pStr, pStrToFind) {
  const p = adjList[pStr];
  if (!p) return null;
  for (let j = 0; j < p[DEG]; j++) {
    const link_j = p[LINK_ARR][j];
    if (link_j[NAME] === pStrToFind) {
      return link_j;
    }
  }
  return null;
}

function findLoopLinkAndDelete(adjList, pStr, pStrToDel) {
  const p = adjList[pStr];
  const linkArr = p[LINK_ARR];
  for (let j = 0; j < p[DEG]; ) {
    if (linkArr[j][NAME] === pStrToDel) {
      linkArr.splice(j, 1);
      p[DEG]--;
    } else {
      j++;
    }
  }
}

function shortestPath(adjList, pStrStart) {
  const queue = [pStrStart];
  let head = 0;
  adjList[pStrStart][DISTANCE] = 0;

  while (head < queue.length) {
    const pStr = queue[head++];
    const p = adjList[pStr];
    const pDist = p[DISTANCE];
    const pLinks = p[LINK_ARR];
    const pDeg = p[DEG];

    for (let i = 0; i < pDeg; i++) {
      const link_i = pLinks[i];
      const nextP_Str = link_i[NAME];
      const jumpDist = link_i[DIST];
      const nextP = adjList[nextP_Str];
      const newDist = pDist + jumpDist;

      if (nextP[DISTANCE] > newDist) {
        nextP[DISTANCE] = newDist;
        if (nextP[DEG] > 1) {
          queue.push(nextP_Str);
        }
      }
    }
  }
}

function dfsConnected(adjacencyList, pStr) {
  const p = adjacencyList[pStr];
  p[VISITED] = true;
  let nPoints = 1;
  const pLinks = p[LINK_ARR];
  const pDeg = p[DEG];

  for (let i = 0; i < pDeg; i++) {
    const pStr_next = pLinks[i][NAME];
    const p_next = adjacencyList[pStr_next];
    if (!p_next[VISITED]) {
      nPoints += dfsConnected(adjacencyList, pStr_next);
    }
  }
  return nPoints;
}

function clearData(adjacencyList) {
  const arr = adjacencyList.arr;
  for (let i = 0; i < arr.length; i++) {
    adjacencyList[arr[i]][DISTANCE] = Infinity;
  }
}

function createMatrixOddPoints(adjacencyList, oddArray) {
  const oddMatrixConj = {};
  const numOddPoints = oddArray.length;

  for (let i = 0; i < numOddPoints; i++) {
    const pStrOn = oddArray[i];
    shortestPath(adjacencyList, pStrOn);
    oddMatrixConj[pStrOn] = {};
    for (let j = i + 1; j < numOddPoints; j++) {
      const pStrIn = oddArray[j];
      oddMatrixConj[pStrOn][pStrIn] = adjacencyList[pStrIn][DISTANCE];
    }
    clearData(adjacencyList);
  }
  return oddMatrixConj;
}

function minimumPath(
  oddMatrixConj,
  oddArray,
  numOddPoints,
  sum = 0,
  longest = 0,
  min = undefined
) {
  if (numOddPoints === 2) {
    const p1 = oddArray[0];
    const p2 = oddArray[1];
    const seg = oddMatrixConj[p1][p2];
    sum += seg;

    if (seg > longest) {
      longest = seg;
    }
    if (min === undefined || sum - longest < min) {
      min = sum - longest;
    }
    return min;
  }

  const newArray1 = oddArray.slice();
  const p1 = newArray1.shift();

  for (let i = 0; i < numOddPoints - 1; i++) {
    const newArray2 = newArray1.slice();
    const p2 = newArray2.splice(i, 1)[0];

    const seg = oddMatrixConj[p1][p2];
    min = minimumPath(
      oddMatrixConj,
      newArray2,
      numOddPoints - 2,
      sum + seg,
      Math.max(longest, seg),
      min
    );
  }
  return min;
}

function solve() {
  const n = +lines.pop();
  let output = "";

  for (let i = 1; i <= n; i++) {
    const numSegments = +lines.pop();
    if (numSegments === 0) {
      output += `Case ${i}: 0.00\n`;
      continue;
    }

    const arrSegments = [];
    for (let j = 0; j < numSegments; j++) {
      const line = lines.pop();
      if (line) {
        const cleanLine = line.replace(/ /g, "");
        arrSegments.push([cleanLine.slice(0, 2), cleanLine.slice(2)]);
      }
    }

    const adjacencyList = buildAdjacencyList(arrSegments, numSegments);

    if (
      dfsConnected(adjacencyList, adjacencyList.arr[0]) !== adjacencyList.numP
    ) {
      output += `Case ${i}: ~x(\n`;
      continue;
    }

    clearData(adjacencyList);
    removePathPoints(adjacencyList);

    const oddArray = [];
    const adjArr = adjacencyList.arr;
    for (let k = 0; k < adjArr.length; k++) {
      const pStr = adjArr[k];
      if (adjacencyList[pStr][DEG] % 2 === 1) {
        oddArray.push(pStr);
      }
    }
    const numOdd = oddArray.length;

    if (numOdd === 0 || numOdd === 2) {
      output += `Case ${i}: ${adjacencyList.length.toFixed(2)}\n`;
    } else {
      const oddMatrixConj = createMatrixOddPoints(adjacencyList, oddArray);
      const graphLength = adjacencyList.length;
      const minSum = minimumPath(oddMatrixConj, oddArray, numOdd);
      const result = minSum + graphLength;
      output += `Case ${i}: ${result.toFixed(2)}\n`;
    }
  }
  return output;
}

process.stdout.write(solve());
