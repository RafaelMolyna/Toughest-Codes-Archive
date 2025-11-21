# BeeCrowd 1034 - Ice Statues Festival

## 1\. Problem Description

**Topic:** Dynamic Programming, Number Theory, Greedy Algorithms.

The city needs to build ice sculptures of a specific total length $M$. You are provided with a set of available ice block lengths $\{a_1, a_2, \dots, a_N\}$. A block of length 1 is always available.

**The Goal:** Find the **minimum number of blocks** required to stack together to reach the exact height $M$.

**Input Constraints:**

- $T$ Test cases.
- $N$ (Types of blocks): $1 \le N \le 25$.
- $M$ (Target length): $1 \le M \le 1,000,000$.
- Block sizes: $1 \le a_i \le 100$.

---

## 2\. Algorithm Analysis

This is a classic variation of the **Change-Making Problem** (or Unbounded Knapsack Problem).

### The Naive Approach (Pure Dynamic Programming)

The standard solution is to build a `dp` table where `dp[i]` represents the minimum blocks needed to reach length `i`.
The transition is:
$$dp[i] = \min(dp[i - \text{coin}]) + 1$$
for all available coins.

**The Problem:**
While $N$ is small, $M$ can be up to $1,000,000$.

- Complexity: $O(M \times N)$.
- Operations: $\approx 25,000,000$ per test case.
- In slower languages or strict time limits, this causes a **Time Limit Exceeded (TLE)**.

### The Optimized Approach (Hybrid Greedy + DP)

We can drastically improve performance by observing a property of the problem: **Combinatorial Stability.**

When the target $M$ is very large, the optimal solution is almost guaranteed to be:

> **"A massive stack of the largest block available, plus a small optimal combination at the end to fix the remainder."**

We don't need to calculate the DP state for $i = 500,000$. We know that `dp[500,000]` is simply `dp[500,000 - LargestBlock] + 1`.

#### Theoretical Basis: The Frobenius Instance

This logic relies on concepts from the **Frobenius Coin Problem**.
Given a set of coprime integers, there is a largest number that _cannot_ be formed (the Frobenius Number). However, our problem asks about the _count_ of items, not just reachability.

There exists a "Stability Threshold" or **Dominance Limit**. Beyond this limit, the "interference" between different block sizes smooths out. The local minima in the DP table become periodic.

- **The Limit:** A safe heuristic upper bound for this stability is the product of the two largest coprime blocks.
  $$Limit \approx C_{max} \times C_{second\_max}$$
  _(Since max block size is 100, this limit is roughly $10,000$)._

### The Strategy

1. **Sort** the blocks in descending order ($C_0, C_1, \dots$).
2. **Calculate Safe Buffer:** Set a limit $L = C_0 \times C_1$.
3. **Greedy Reduction:**
   - If $M > L$, we cut $M$ down.
   - We calculate how many times $C_0$ fits into the excess: $k = (M - L) / C_0$.
   - We add $k$ to our answer and update $M = M - (k \times C_0)$.
4. **Dynamic Programming:**
   - Now, $M$ is guaranteed to be small ($\le L + C_0 \approx 10,100$).
   - We run the standard $O(M \cdot N)$ DP on this tiny remainder.

**Result:** The complexity drops from dependent on $M$ ($10^6$) to dependent on the Limit ($10^4$). The solution becomes effectively **Constant Time** relative to the input size $M$.

### Why did we skip Python?

While a Python solution exists, the overhead of the Python interpreter (even with optimizations) makes it difficult to compete with C++ or Node.js on problems requiring millions of array access operations within strict time limits. The C++ solution is the recommended reference for this specific problem type.
