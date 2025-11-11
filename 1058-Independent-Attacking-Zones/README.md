# Beecrowd 1058: Independent Attacking Zones

## Technical Analysis

This is a classic combinatorial problem that is solvable using **Dynamic Programming**. The core task is to find the number of **non-crossing partitions (triangulations)** of $P$ points on a circle, subject to two primary constraints: (1) The circular nature of the input, and (2) a color-based constraint on the partitions.

The solution is a **Top-Down, Recursive DP (Memoization)** that defines a state by its sub-array and uses a pre-calculated "Catalan-like" sequence for its base cases.

---

### Step 1: The Base Case (The No-Red Problem)

First, we analyze the problem without the Red constraint. The task of finding the number of non-crossing triangulations of $N$ points on a circle is a famous problem, the solution to which is the **Catalan sequence**.

Our problem involves $N = P/3$ triangles. We can pre-calculate an array (`triArr`) where `triArr[N]` stores the solution for $N$ triangles with 0 Red platoons.

This becomes our most important base case:

- If a sub-problem has 0 or 1 Red platoons, the Red constraint is trivially satisfied.
- The solution is simply the pre-calculated value from our `triArr[num_triangles]`.

### Step 2: Breaking the Circle (Linearization)

The circular symmetry (e.g., `RBBBRB` == `BRBBRB`) is a major complication for a recursive solution. To solve this, we must **linearize the array**. We do this by fixing one point, `p0`, at `index 0`. This breaks the symmetry and provides a single, deterministic array to solve.

### Step 3: Handling the Red Constraint (The `p0` Fix)

We can combine the linearization from Step 2 with the Red constraint for a powerful optimization. Instead of fixing `p0` to an arbitrary point, we **rotate the entire array** so that the **first Red platoon is always at `index 0` (`p0`)**.

This has a critical implication:

1. We now _know_ `p0` is **Red**.
2. The "at most one Red per triangle" rule is simplified. For _any_ triangle `(p0, p1, p2)`, both `p1` and `p2` **must be Black**.

This transforms the complex constraint check into a simple boolean check: `if (points[p1]) continue;` and `if (points[p2]) continue;`.

### Step 4: Divide and Conquer (The Recursive Structure)

With `p0` (Red) fixed, we define our recursive solution. We iterate to find all valid `(p1, p2)` pairs (where `p1` and `p2` are Black) to form the first triangle.

This `(p0, p1, p2)` partition divides the full problem into three **independent, smaller sub-problems**:

1. **Group 1:** The points between `p0` and `p1` (i.e., `points.slice(1, p1)`)
2. **Group 2:** The points between `p1` and `p2` (i.e., `points.slice(p1 + 1, p2)`)
3. **Group 3:** The points between `p2` and `p0` (i.e., `points.slice(p2 + 1, numPoints)`)

The total number of ways for this _one_ `(p1, p2)` choice is the product of its sub-problems:
`ways = solve(Group 1) * solve(Group 2) * solve(Group 3)`

The final answer is the **sum** of `ways` over all valid `(p1, p2)` pairs.

### Step 5: The `mod 3` Constraint (Search Space Pruning)

Iterating over all $O(N^2)$ pairs of `(p1, p2)` is too slow. We must prune this search.

A key insight is that for `solve(Group 1)` to be a valid sub-problem, its length _must_ be a multiple of 3.

- `Length(Group 1) = p1 - 1`. We require `(p1 - 1) % 3 == 0`. This implies `p1 % 3 == 1`.
- `Length(Group 2) = p2 - p1 - 1`. We require `(p2 - p1 - 1) % 3 == 0`. This implies `(p2 - p1) % 3 == 1`.

This dramatically prunes our search space by a factor of 9. Our loops become:

1. `for (p1 = 1; p1 < numPoints; p1 += 3)`
2. `for (p2 = p1 + 1; p2 < numPoints; p2 += 3)`

### Step 6: Additional Pruning (Color-Based)

We can prune even further using the Red constraint:

1. **"Effective Red" Optimization:** After rotating the first Red to `p0` (Step 3), we check if all _other_ Red platoons are _also_ at indices `i % 3 == 0`.

   - If `true`, then `p1` (at `i % 3 == 1`) and `p2` (at `i % 3 == 2` or `p1+...`) will _always_ be Black.
   - The Red constraint is automatically satisfied. The problem is now identical to the 0-Red base case.
   - We can `return triArr[numPoints / 3]` immediately.

2. **Red Count Pruning:** Before recursively calling `solve()` on a sub-problem (e.g., `Group 1`), we check if it's solvable. If `num_reds(Group 1) > length(Group 1) / 3`, the sub-problem is mathematically impossible. We `continue` to the next loop iteration, pruning this entire branch.

### Step 7: The Final Step (Memoization)

The recursive solution `solve(G1) * solve(G2) * ...` has **overlapping sub-problems**. It will re-calculate the solution for the same sub-array (e.g., `["B","B","R"]`) thousands of times, leading to TLE (Time Limit Exceeded).

The solution is **Memoization**. We use a `map` (C++) or `dict` (Python) or `Map` (JS) to cache results.

- **Key:** The sub-array state (e.g., the string `"B,B,R"` or a `tuple`).
- **Value:** The computed result (an `int` or `long long`).

**Implementation:**

1. At the start of the `solve` function, check the cache: `if (memo.has(key)) return memo.get(key);`
2. Before returning _any_ result (from a base case or a computed `numTriagCount`), store it in the cache: `memo.set(key, result);`

This ensures we only solve each unique sub-problem **once**, which is the final step to an accepted, high-performance solution.

---

## 📚 Relevant Concepts & Study Guide

1. **Dynamic Programming (DP):** The core concept of solving a problem by breaking it into smaller, _overlapping_ sub-problems.

   - **Resource:** [Topcoder - Dynamic Programming](https://www.topcoder.com/thrive/articles/dynamic-programming-from-novice-to-advanced)
   - **Video:** [Errichto - "What is Dynamic Programming?"](https://www.youtube.com/watch?v=sSno9rV8Rhg)

2. **Memoization:** The "top-down" DP technique of using a recursive function with a cache.

   - **Resource:** [CP-Algorithms - Memoization](https://cp-algorithms.com/dynamic_programming/memoization.html)

3. **DP on Intervals:** The specific DP pattern of solving a state `(i, j)` by splitting it with a `k`. Our `(p0, p1, p2)` split is a 3-way version of this.

   - **Resource:** [USACO.guide - DP on Intervals](https://usaco.guide/gold/dp-intervals?lang=cpp)
   - **Reference Problem:** "Matrix Chain Multiplication" (the classic example of this pattern).

4. **Catalan Numbers:** The mathematical sequence that solves "non-crossing partition" problems. Recognizing this helps identify the base case.
   - **Video:** [WilliamFiset - "Catalan Numbers"](https://www.youtube.com/watch?v=Du_gomxIHvA)
   - **Resource:** [CP-Algorithms - Catalan Numbers](https://cp-algorithms.com/combinatorics/catalan-numbers.html)
