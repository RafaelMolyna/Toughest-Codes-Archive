# Algorithm Breakdown: Beecrowd 1058 - Independent Attacking Zones

Hello\! If you're looking at this code, you've found a really neat solution to a tricky dynamic programming problem. This document breaks down the core logic of the final JavaScript solution, which uses a clever "brute-force memoization" strategy.

## 🔮 The Core Strategy: "Solve Once, Cache Everywhere"

The magic of this algorithm comes from a simple but powerful trade-off:

1. **Cache Miss:** The first time the code sees a new arrangement of platoons (e.g., `"100100"`), it does the hard recursive work to find the answer.
2. **Cache Save:** When it gets the answer, it doesn't just save it for `"100100"`. The `saveAllRotations` function _also_ calculates and saves the _exact same answer_ for all other rotations: `"001001"`, `"010010"`, `"100100"`, etc.
3. **Cache Hit:** The next time the code sees _any_ of those rotations, it gets an instant answer from the `memo` Map.

Given the problem's small constraint (`P < 40`), this "spend more time saving, save all time on lookups" strategy is extremely effective and fast.

---

## Step 1: The `triArr` (The "Catalan-like" Numbers)

This array is the key to solving all the "simple" base cases.

- **What it Represents:** `triArr[k]` stores the total number of ways to form `k` valid triangles from `3k` points, **assuming all points are Black**.

- **How it's Calculated:** This sequence is a _generalized Catalan number_. Standard Catalan numbers split a problem into _two_ sub-problems. This problem splits into **three** sub-problems (the areas `area1`, `area2`, and `area3`).

  The formula for this "3-Catalan" sequence, $f(k)$ for $k$ triangles, is:
  $$f(k) = \frac{1}{2k+1} \binom{3k}{k}$$

  Let's check this formula against the `triArr`:

  - **`triArr[0]` (k=0):** $\frac{1}{1} \binom{0}{0} = 1$
  - **`triArr[1]` (k=1):** $\frac{1}{3} \binom{3}{1} = \frac{1}{3} \cdot 3 = 1$
  - **`triArr[2]` (k=2):** $\frac{1}{5} \binom{6}{2} = \frac{1}{5} \cdot 15 = 3$
  - **`triArr[3]` (k=3):** $\frac{1}{7} \binom{9}{3} = \frac{1}{7} \cdot 84 = 12$
  - **`triArr[4]` (k=4):** $\frac{1}{9} \binom{12}{4} = \frac{1}{9} \cdot 495 = 55$

  It's a perfect match\! `triArr` is just a pre-calculated lookup table for the solution to any all-black (or equivalent) problem.

---

## Step 2: The `solve` Function (The Engine)

This is the main recursive function. It's designed to be called with a _copy_ of the points array, as it **mutates** the array it receives.

Here is its logical flow:

1. **Base Case 0 (Empty):**

   ```javascript
   if (numPoints === 0) return 1;
   ```

   An empty sub-problem has one solution: "do nothing." This `1` is the multiplicative identity that makes `area1 * area2 * area3` work.

2. **Memo Check (Original Key):**

   ```javascript
   const key = points.join("");
   if (memo.has(key)) ...
   ```

   This is the main JS bottleneck. It creates a string (e.g., `"100100"`) to use as a `Map` key. If this exact rotation has been seen before, it returns the saved value instantly.

3. **Base Case 1 (Pruning):**

   ```javascript
   if (redsCount > numTriag) ...
   ```

   If there are more reds than available triangles (e.g., 5 reds, 4 triangles), a solution is impossible. It **saves 0** for all rotations (via `saveAllRotations`) and returns `0`.

4. **Base Case 2 (0/1 Red):**

   ```javascript
   if (redsCount <= 1) ...
   ```

   This is a critical optimization. A problem with 0 or 1 red platoon is _equivalent_ to the all-black problem. The single red will just be rotated to position 0 and act as the "anchor" `p0`, which is what we'd do anyway. It **saves the `triArr` value** for all rotations and returns it.

5. **Canonical Rotation:**

   ```javascript
   points.push(...points.splice(0, points.indexOf(1)));
   ```

   At this point, we know `redsCount > 1`. This line finds the index of the _first_ red platoon and **mutates** the local `points` array to move it to the front.

   - Example: `[0, 0, 1, 0, 1, 0]` becomes `[1, 0, 1, 0, 0, 0]`.
   - Now, `p0` (at `points[0]`) is guaranteed to be **Red**.

6. **Base Case 3 (Magic Mod 3):**

   ```javascript
   if (isAllRedsInMod3(points)) ...
   ```

   This "magic" check looks at the _newly rotated_ array. If all reds (including the one at `p0`) are at positions `0, 3, 6, 9...`, it means no red can _ever_ be chosen as a `p1` or `p2` (since they step `+= 3` from index 1). This makes the problem _also_ equivalent to the all-black case. It **saves the `triArr` value** and returns it.

7. **Recursive Step (The Loops):**

   ```javascript
   for (let p1 = 1...) {
     for (let p2 = p1 + 1...) {
       // ...
       const area1 = solve(pointsA1, n1);
       if (area1 === 0) continue;

       const area2 = solve(pointsA2, n2);
       if (area2 === 0) continue;

       const area3 = solve(pointsA3, n3);

       numTriagCount += area1 * area2 * area3;
     }
   }
   ```

   This is the final, hard part. We know `p0` is **Red**.

   - It loops for `p1` (at `1, 4, 7...`). If `points[p1]` is also Red, it's an invalid triangle, so it `continue`s.
   - It recursively solves for `area1` (the points between `p0` and `p1`).
   - It loops for `p2` (at `p1+1, p1+4...`). If `points[p2]` is Red, it's invalid.
   - It recursively solves for `area2` (between `p1`, `p2`) and `area3` (between `p2`, end).
   - It adds the product of the sub-solutions to the total count.

8. **Final Cache Save:**

   ```javascript
   saveAllRotations(key, numPoints, numTriagCount);
   ```

   After the loops finish, it saves the final computed `numTriagCount` using the **original key** from Step 2, caching the result for all possible rotations.

---

## Step 3: The Main I/O Loop

The main loop just handles reading the input and orchestrating the process.

1. Reads the number of test cases.
2. For each case:
   - Reads `numPoints` and the `line`.
   - Converts the string `"RBRB"` into a number array `[1, 0, 1, 0]`.
   - **Crucially:** It calls `memo.clear()` to wipe the cache for the new test case.
   - It calls `solve(points.slice(), numPoints)`. That `.slice()` is **VITAL**. It passes a _copy_ of the points array, allowing the `solve` function to mutate it freely without corrupting the original.

---

Hope this helps anyone exploring the code\!

Cheers,
Gemini

### A Note on Implementation

The core logic for this solution was originally developed and accepted in JavaScript. The C++ and Python implementations in this directory are direct ports of that JS logic, assisted by AI.

They are functionally correct, but they may not be the most idiomatic or performant C++/Python. If you see a language-specific optimization or a way to improve them, your contributions are welcome!

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
