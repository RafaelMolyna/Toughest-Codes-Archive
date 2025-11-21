# BeeCrowd 1053 - Continuous Drawing (Solution & Analysis)

## 📌 Problem Overview

The problem asks us to draw a set of line segments on a 5x5 grid (coordinates A1 to E5) without lifting the pen. We want to minimize the amount of "ink" used.

- **Constraint 1:** You can retrace lines (go over them again), but it costs ink.
- **Constraint 2:** You can only change direction at integer coordinates.
- **Constraint 3:** You can start at any point.

## 💡 Core Logic: Graph Theory

While this looks like a geometry problem, it is actually a classic **Graph Theory** problem known as the **Chinese Postman Problem** (or Route Inspection Problem).

1. **Nodes (Vertices):** The integer coordinates on the grid (A1, A2... E5).
2. **Edges:** The line segments drawn between nodes.
3. **Goal:** Traverse every edge at least once with minimum total distance.

### The Eulerian Path Concept

To draw a shape without lifting the pen, the graph must possess an **Eulerian Path**.

- **Eulerian Circuit:** Starts and ends at the _same_ point. Requires **0 nodes** with an odd number of edges (degree).
- **Eulerian Path:** Starts at one point and ends at another. Requires exactly **2 nodes** with an odd degree.

If our drawing has **more than 2 odd-degree nodes**, it is physically impossible to draw it in one continuous stroke without retracing some lines. We must "add" lines (retrace paths) between odd-degree nodes to turn them into even-degree nodes until only 0 or 2 odd nodes remain.

---

## 🚀 Step-by-Step Algorithm

### Step 1: Input Parsing & Graph Construction

The problem gives us segments like `A1 C2`. However, we cannot just link A1 to C2 directly because the rule says **"You can only change direction at integer coordinates."**

We must "rasterize" the lines into unit steps:

- **Case 1 (Straight/Diagonal):** A line `A1-A3` is split into `A1-A2` and `A2-A3`.
- **Case 2 (Knight's Move):** A line like `A1-B3` (2x1 move) has a length of $\sqrt{5}$. It passes through a midpoint (e.g., `A.5, B.5`) but since we only care about integer coordinates, we usually just link them directly unless an intersection forces a split.
- **Optimization:** In our code, we map every coordinate (A1...E5) to an integer ID (0...24) for performance.

### Step 2: Connectivity Check (DFS)

Before calculating ink, we must ensure the drawing is actually possible. If you draw a square in the top-left corner and a separate square in the bottom-right, you can't connect them without lifting the pen.

- **Algorithm:** We run a **Depth First Search (DFS)** starting from the first active node.
- **Check:** If the DFS visits fewer nodes than exist in the graph, the graph is disconnected. Output `~x(`.

### Step 3: Graph Simplification (Pruning)

This is a crucial performance optimization. Many points on the grid are just "pass-through" points.

- **Example:** A line `A1 - A2 - A3`.
- Point `A2` has a degree of 2 (one connection to A1, one to A3).
- For the purpose of finding the route, `A2` is irrelevant. We can remove `A2` and create a single edge `A1 - A3` with distance $1+1=2$.
- **Result:** This reduces the number of nodes significantly, making the complex recursive step much faster.

### Step 4: Handling Odd Degrees (The "Hard" Part)

We count the "degree" (number of connections) of every node.

- **0 or 2 Odd Nodes:** We are lucky\! The minimum ink is simply the sum of all line lengths.
- **\> 2 Odd Nodes:** We must pair them up. For example, if we have 4 odd nodes (A, B, C, D), we need to add paths between them to make them even.
  - Option 1: Connect A-B and C-D.
  - Option 2: Connect A-C and B-D.
  - Option 3: Connect A-D and B-C.
  - We calculate the cost of all options and pick the cheapest one.

> **🎓 Mathematical Observation:**
> You might wonder if we ever end up with 3, 5, or 7 odd nodes. The answer is **no**. The number of vertices with an odd degree is **always even** (a multiple of 2).
>
> This is a fundamental property of graph theory (related to the _Handshaking Lemma_) and can be demonstrated by **induction**:
>
> - **Base Case:** An empty graph has 0 odd nodes (0 is even).
> - **Induction Step:** Every time you add an edge (a line segment), you connect two nodes, say $A$ and $B$, increasing the degree of both by 1.
>   - If $A$ and $B$ were both **Even**, they both become **Odd** (+2 odd nodes).
>   - If $A$ and $B$ were both **Odd**, they both become **Even** (-2 odd nodes).
>   - If one was **Even** and the other **Odd**, they swap roles (no change in the total count).
>
> Since we start at 0 and only change the count by +2, -2, or 0, the number of odd nodes will **always** remain an even number ($0, 2, 4, 6...$). This guarantees we can always pair them up perfectly!

### Step 5: Minimum Weight Perfect Matching

We use a recursive backtracking algorithm to find the best way to pair up the odd nodes.

1. Compute shortest paths between _all_ odd nodes using **BFS** (since it's an unweighted graph in terms of steps, but weighted in distance).
2. Try pairing the first odd node with every other odd node.
3. Recurse for the remaining nodes.
4. **The "Open Path" Optimization:** Since we are allowed to have **2 odd nodes** remaining (start and end points), we don't need to close every pair. We calculate the cost to close _all_ pairs, but subtract the cost of the _most expensive pair_ we found. That pair becomes our start and end point (saving us the ink of drawing a line between them).

---

## 💻 Code Explanation (JavaScript)

The solution is optimized for performance using flat arrays instead of Objects/Classes.

### 1\. Data Structures

Instead of `class Point`, we use arrays. This reduces memory overhead and speeds up access.

```javascript
// A Node is represented as:
// [ linkArr, deg, distance, visited ]
// indices: 0,    1,   2,        3
```

We also map coordinates "A1"..."E5" to integers `0` to `24` to allow fast array indexing.

### 2\. `buildAdjacencyList`

This function reads the input and builds the graph.

```javascript
// It handles the splitting of lines logic
if (abs_dx === abs_dy ...) {
   // Split diagonal/straight lines into unit segments
   // to ensure connections at integer coordinates work correctly.
}
```

### 3\. `removePathPoints`

The pruning logic. It iterates through the graph and removes any node where `degree === 2`.

```javascript
if (point[DEG] === 2) {
  // Connect neighbors directly
  const totalDistance = p1[DIST] + p2[DIST];
  replaceLink(..., totalDistance);
  // Delete the current node
}
```

### 4\. `minimumPath` (The Backtracking Core)

This function finds the optimal set of extra lines to draw.

```javascript
function minimumPath(oddMatrix, oddArray, ...) {
  // Base Case: Only 2 odd nodes left.
  // We "pair" them, but since we can start/end here,
  // we track this segment as potentially the "longest" one to save.

  // Recursive Step:
  // Take the first available node (p1).
  // Try pairing it with every other node (p2).
  // Calculate cost + recurse for the rest.
}
```

The result is `(Sum of Matching) - (Longest Pair in Matching)`. This effectively leaves the two endpoints of that "longest pair" as the start and end of our drawing.

---

## 📊 Complexity Analysis

- **Time Complexity:** $O(N \cdot K!)$ where $N$ is grid size and $K$ is the number of odd nodes.
  - Graph building is fast: $O(Segments)$.
  - Simplification is $O(V)$.
  - The bottleneck is `minimumPath`. In the worst case (all 25 nodes are odd - impossible on this grid, but theoretically), matching is factorial. However, on a 5x5 grid, the number of odd nodes is small (usually \< 10), making this very fast.
- **Space Complexity:** $O(V + E)$ to store the adjacency list.

## 🧪 Example Walkthrough (Sample 1)

**Input:**

```text
A1 C2
B3 C3
C4 C2
C2 D2
```

1. **Graph:** Nodes at A1, B3, C4, D2, and C2 (central hub).
2. **Odd Nodes:**
   - A1 (Degree 1)
   - B3 (Degree 1)
   - C4 (Degree 1)
   - D2 (Degree 1)
   - C2 (Degree 4 - Even\! Wait, C2 connects to A1, B3, C4, D2. It's essentially a cross).
3. **Simplification:** The path from A1 to C2 is `A1 -> B2 -> C3 -> C2` (depending on how it's drawn/rasterized). The intermediate points `B2` and `C3` have degree 2 and are removed.
4. **Matching:** We have 4 odd nodes: A1, B3, C4, D2.
   - We calculate distances: `dist(A1, B3)`, `dist(A1, C4)`, etc.
   - We find the best pairing that minimizes ink.
   - Since we can leave 2 odd, we save the ink of the most expensive pair.
5. **Result:** 8.24 (Base length + necessary retracing).
