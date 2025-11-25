# 📚 Archive: Child Play (Beecrowd 1346)

## Problem Analysis

The problem asks us to arrange domino-like slabs such that the sum of the numbers on the top row equals the sum of the numbers on the bottom row. If impossible, we must discard one slab to maximize the remaining sum (with specific tie-breaking rules for discarding).

### 1\. Mathematical Modeling

Let each slab $i$ have an upper value $u_i$ and a lower value $l_i$. We want:
$$\sum u_i = \sum l_i$$

This equation implies:
$$\sum u_i - \sum l_i = 0 \implies \sum (u_i - l_i) = 0$$

However, we can flip any slab. If we flip slab $i$, $u_i$ and $l_i$ swap places. The contribution of slab $i$ to the difference is either $+(u_i - l_i)$ or $-(u_i - l_i)$.
Let $d_i = |u_i - l_i|$. We need to assign a sign $s_i \in \{+1, -1\}$ for each slab such that:
$$\sum_{i=1}^{N} s_i \cdot d_i = 0$$

This is a variation of the **Partition Problem** (or Subset Sum Problem), which is NP-Complete. However, with $N \le 400$ and specific constraints, we can solve it using **Depth First Search (DFS)** optimized with **Pruning (Branch and Bound)**.

### 2\. The Logic: Pruned Backtracking

To solve this efficiently (0.00s), we cannot try every combination ($2^{400}$ possibilities). We use three techniques:

1. **Sorting by Difference (Heuristic):** We sort cards based on their difference $d_i$. We process cards with smaller differences last. This allows the pruning logic to be more effective "higher up" in the recursion tree.

2. **Memoization (Dynamic Programming):** We store visited states `(index, current_sum)`. If we encounter the same sum at the same index again, we know it leads to a dead end.

3. **Branch and Bound (The "Funnel" Pruning):** This is the most critical optimization.

   Before entering a recursive branch, we check if the current `target_sum` is reachable. We precalculate `suffix_sums`, where `suffix_sum[i]` is the maximum possible sum obtainable by all cards from index $0$ to $i$.

   - Condition: If $|current\_target| > suffix\_sum[i]$, it is mathematically impossible to reach 0. We **prune** (cut off) this branch immediately.

### 3\. The "Discard" Strategy

If the sum is impossible using all cards, we try discarding cards one by one.

- **Optimization:** Instead of physically removing the card from the array (which is slow), we pass an `ignore_index` to the recursive solver.
- **Ordering:** We sort the discard candidates based on the problem rules:
  1. Maximize remaining sum $\rightarrow$ Minimize discarded sum.
  2. If sums are equal, discard the one with the smaller face value $u_i$.

---

## 💻 1. C++ Solution (The Speed Champion)

**Runtime:** 0.000s
**Notes:** Uses `std::vector` for memory locality and `std::sort`. The `memo` uses a `std::set` to handle the sparse state space of sums.

---

## 💻 2. JavaScript Solution (Node.js)

**Runtime:** \~0.235s (Fastest JS category)
**Notes:** Uses `Int32Array` for the suffix sums to reduce heap allocation. Replaces object-based memoization with a flat `Set` keyed by string. Uses a custom `ignoreIndex` to avoid the $O(N)$ cost of `array.splice`.

---

## 💻 3. Python Solution

Python is interpreted, so the recursion limit must be increased. I used `sys.stdin.read` for fast I/O. The logic is identical to C++, but the pruning is even more essential here to pass within time limits.
