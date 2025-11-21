var file = "stdin3.txt";
var input = require("fs").readFileSync(
  "C:/Users/Rafael Molina/Desktop/VScode - URI/p1053 des cont graf/" + file,
  "utf8"
);
var lines = input.split("\n");

/**
 * Escreva a sua solução aqui
 * Code your solution here
 * Escriba su solución aquí
 */

lines.reverse();

let charObj = { A: 0, B: 1, C: 2, D: 3, E: 4 };
function a1ToPoint(str, obj = charObj) {
  let [x, y] = str.split("");
  return [obj[x], +y - 1];
}

let charArr = ["A", "B", "C", "D", "E"];
function pointToA1(x, y, arr = charArr) {
  return arr[x] + ++y;
}

class Point {
  constructor(name, dist) {
    this.linkArr = [new LinkObj(name, dist)];
    this.deg = 1;
    this.distance = Number.POSITIVE_INFINITY;
    this.visited = false;
  }
  addLink(name, dist) {
    this.linkArr.push(new LinkObj(name, dist));
    this.deg += 1;
  }
}

class LinkObj {
  constructor(name, dist) {
    this.name = name;
    this.dist = dist;
    // this.visited = false;
  }
}

class Queue {
  constructor(size) {
    this.queue = Array(size).fill(0);
    this.head = 0;
    this.tail = 0;
    this.numElem = 0;
    this.size = size;
  }
  add(elem) {
    if (this.numElem < this.size) {
      this.queue[this.head] = elem;
      this.head = (this.head + 1) % this.size;
      this.numElem++;
      return this.numElem;
    } else {
      return null;
    }
  }
  take() {
    if (this.numElem > 0) {
      let elem = this.queue[this.tail];
      this.tail = (this.tail + 1) % this.size;
      this.numElem--;
      return elem;
    } else {
      return undefined;
    }
  }
}

//link one direction: =>
function linkPoint(adjList, P1str, P2str, dist) {
  //checks if P1 already exists: if so, just add the link, otherwise, create the point first.
  if (adjList[P1str]) {
    //add the link:
    adjList[P1str].addLink(P2str, dist);
  } else {
    //create the point adding the link:
    adjList[P1str] = new Point(P2str, dist);
    adjList.arr.push(P1str);
    adjList.numP++;
  }
}

//link both directions: <=>
function linkSegmentOnAdjList(adjList, P1str, P2str, dist, repeatSeg = false) {
  if (
    !adjList[P1str] ||
    !adjList[P2str] ||
    !adjList[P1str].linkArr.some((link) => link.name === P2str) ||
    repeatSeg
  ) {
    linkPoint(adjList, P1str, P2str, dist);
    linkPoint(adjList, P2str, P1str, dist);
    adjList.length += dist;
  }
}

function buildAdjacencyList(arrSegments, numSegments) {
  let adjList = { arr: [], numP: 0, length: 0 };
  // Add every edge:
  for (let i = 0; i < numSegments; i++) {
    let [p1str, p2str] = arrSegments[i];
    let [x1, y1] = a1ToPoint(p1str); //point 1
    let [x2, y2] = a1ToPoint(p2str); //point 2
    let dx = x2 - x1;
    let dy = y2 - y1;
    let abs_dx = Math.abs(dx);
    let abs_dy = Math.abs(dy);
    // Adding the points and the intermediate points (when they exist both in integer values)
    // 1 )case 45° line: (points in sequence)
    if (abs_dx === abs_dy || abs_dx === 0 || abs_dy === 0) {
      let [direction_x, direction_y] = [Math.sign(dx), Math.sign(dy)];
      let dist = abs_dx === abs_dy ? Math.sqrt(2) : 1;
      while (x1 !== x2 || y1 !== y2) {
        // ---> prevents one point from being linked to himself
        let p1str = pointToA1(x1, y1);
        let p2str = pointToA1((x1 += direction_x), (y1 += direction_y));
        linkSegmentOnAdjList(adjList, p1str, p2str, dist);
      }
      // 2) case dx = 2 , dy = 4, or vice-versa: (one point in the middle)
    } else if (
      (abs_dx === 2 && abs_dy === 4) ||
      (abs_dy === 2 && abs_dx === 4)
    ) {
      let middlePoint = pointToA1((x1 + x2) / 2, (y1 + y2) / 2);
      linkSegmentOnAdjList(adjList, p1str, middlePoint, Math.sqrt(5));
      linkSegmentOnAdjList(adjList, p2str, middlePoint, Math.sqrt(5));
      // 3) other lines: (no middle point)
    } else {
      linkSegmentOnAdjList(
        adjList,
        p1str,
        p2str,
        Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
      );
    }
  }
  return adjList;
}

function removePathPoints() {
  for (let i = 0; i < adjacencyList.numP /*no incrm*/; ) {
    let A1notation = adjacencyList.arr[i];
    let point = adjacencyList[A1notation];
    if (point.deg === 2) {
      let p1 = point.linkArr[0];
      let p2 = point.linkArr[1];

      if (p1.name !== p2.name) {
        let totalDistance = p1.dist + p2.dist;
        // remove paths
        replaceLink(p1.name, A1notation, p2.name, totalDistance);
        replaceLink(p2.name, A1notation, p1.name, totalDistance);
      } else {
        // remove loop paths:
        findLoopLinkAndDelete(p1.name, A1notation);
      }
      // remove remaining data:
      delete adjacencyList[A1notation];
      adjacencyList.numP--;
      adjacencyList.arr.splice(i, 1);
    } else {
      i++;
    }
  }
}

function replaceLink(name, nameFind, newName, newDist) {
  let link = findLink(name, nameFind);
  link.name = newName;
  link.dist = newDist;
}

function findLink(pStr, pStrToFind) {
  p = adjacencyList[pStr];
  for (let j = 0; j < p.deg; j++) {
    let link_j = p.linkArr[j];
    if (link_j.name === pStrToFind) {
      return link_j;
    }
  }
}

function findLoopLinkAndDelete(pStr, pStrToDel) {
  let p = adjacencyList[pStr];
  for (let j = 0; j < p.deg /*no incr*/; ) {
    if (p.linkArr[j].name === pStrToDel) {
      p.linkArr.splice(j, 1);
      p.deg--;
    } else {
      j++;
    }
  }
}

function shortestPath(pStrStart) {
  // Starting queue:
  let queue = new Queue(25);
  // Start point:
  queue.add(pStrStart);
  adjacencyList[pStrStart].distance = 0;
  // for every point in queue, look for its linking other points, and decide which one will go into queue:
  while (true) {
    // take the element from queue:
    let pStr = queue.take();
    // Loop ends when queue is empty (no more points for check)
    if (!pStr) break;
    // Iterate throw every link of the point:
    let p = adjacencyList[pStr];

    for (let i = 0; i < p.deg; i++) {
      let link_i = p.linkArr[i];
      let nextP_Str = link_i.name;
      let jumpDist = link_i.dist;
      let nextP = adjacencyList[nextP_Str];
      // If the point was not visite yet, add it on queue direct: this is the shortest path to this point:
      if (nextP.distance > p.distance + jumpDist) {
        // obs: poits with deg=1 are terminal, so don't need to be checked
        if (nextP.deg > 1) {
          queue.add(nextP_Str);
        }
        nextP.distance = p.distance + jumpDist;
      }
    }
  }
}

function dfsConnected(adjacencyList, pStr) {
  // link t;
  let p = adjacencyList[pStr];
  // G->cc[v] = id;
  p.visited = true;
  let nPoints = 0;
  // for (t = G->adj[v]; t != NULL; t = t->next)
  for (let i = 0; i < p.deg; i++) {
    let pStr_next = p.linkArr[i].name;
    let p_next = adjacencyList[pStr_next];
    if (!p_next.visited) {
      nPoints += dfsConnected(adjacencyList, pStr_next);
    }
  }
  // if (G->cc[t->v] == -1) dfsRcc (G, t->v, id);
  return nPoints + 1;
}

function cleadData() {
  adjacencyList.arr.forEach((pStr) => {
    let p = adjacencyList[pStr];
    p.distance = Number.POSITIVE_INFINITY;
  });
}

function createMatrizOddPoints() {
  var oddMatrixConj = {};
  var oddArray = [];
  let numOddPoints = 0;
  adjacencyList.arr.forEach((pStr) => {
    let point = adjacencyList[pStr];
    if (point.deg % 2 === 1) {
      oddArray.push(pStr);
      numOddPoints++;
    }
  });

  oddArray.slice(0, numOddPoints - 1).forEach((p) => (oddMatrixConj[p] = {}));

  for (let i = 1; i < numOddPoints; i++) {
    let pStrOn = oddArray[i - 1];
    shortestPath(pStrOn);
    oddMatrixConj[pStrOn] = {};
    oddArray.slice(i).forEach((pStrIn) => {
      oddMatrixConj[pStrOn][pStrIn] = adjacencyList[pStrIn].distance;
    });
    cleadData();
  }
  oddMatrixConj.numOdd = numOddPoints;
  oddMatrixConj.arr = oddArray;
  // console.log(oddMatrixConj);
  return oddMatrixConj;
}

function minimumPath(
  oddArray,
  numOddPoints,
  sum = 0,
  longest = 0,
  min = undefined
) {
  if (numOddPoints === 2) {
    let p1 = oddArray[0];
    let p2 = oddArray[1];
    let seg = oddMatrixConj[p1][p2];
    sum += seg;

    if (seg > longest) {
      longest = seg;
    }
    if (sum - longest < min || !min) {
      min = sum - longest;
    }
    return min;
  }

  // copy the original array
  let newArray1 = oddArray.slice();
  // take the first element:
  let p1 = newArray1.shift();

  for (let i = 0; i < numOddPoints - 1; i++) {
    // copy the array for don't interfere on other iterations:
    let newArray2 = newArray1.slice();
    // selects one other point:
    let p2 = newArray2.splice(i, 1)[0];

    let seg = oddMatrixConj[p1][p2];
    min = minimumPath(
      newArray2,
      numOddPoints - 2,
      sum + seg,
      Math.max(longest, seg),
      min
    );
  }
  return min;
}

let n = +lines.pop();

output = "";
for (let i = 1; i <= n; i++) {
  if (output) output += "\n";

  let arrSegments = [];
  let numSegments = +lines.pop();
  for (let j = 0; j < numSegments; j++) {
    let str = lines.pop().split("").reverse();
    let str1 = "";
    let i = 0;
    while (i < 2) {
      let char = str.pop();
      if (char && char !== " ") {
        str1 += char;
        i++;
      }
    }
    i = 0;
    let str2 = "";
    while (i < 2) {
      let char = str.pop();
      if (char && char !== " ") {
        str2 += char;
        i++;
      }
    }
    arrSegments[j] = [str1, str2];
  }

  // verify if graph is empty:
  if (numSegments === 0) {
    output += `Case ${i}: 0.00`;
    continue;
  }

  // constructing adjacency list of graph:
  var adjacencyList = buildAdjacencyList(arrSegments, numSegments);

  // verify if graph is conected:
  if (
    dfsConnected(adjacencyList, adjacencyList.arr[0]) !== adjacencyList.numP
  ) {
    output += `Case ${i}: ~x(`;
    continue;
  }

  cleadData();
  removePathPoints();

  // verify if graph is eulerian:
  if (adjacencyList.arr.every((point) => adjacencyList[point].deg % 2 === 0)) {
    output += `Case ${i}: ${adjacencyList.length.toFixed(2)}`;
    // every other graph:
  } else {
    var oddMatrixConj = createMatrizOddPoints();
    let oddArray = oddMatrixConj.arr;
    let numOdd = oddMatrixConj.numOdd;
    var graphLength = adjacencyList.length;
    var minSum = minimumPath(oddArray, numOdd);
    let result = minSum + graphLength;

    output += `Case ${i}: ${result.toFixed(2)}`;
  }
}

console.log(output);
