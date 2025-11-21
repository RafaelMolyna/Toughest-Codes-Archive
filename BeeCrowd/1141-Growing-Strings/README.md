# BeeCrowd 1141 - Growing Strings

**Difficulty:** Hard (String Processing / Dynamic Programming)  
**Algorithm:** Aho-Corasick Automaton + Optimization (DFA Flattening)

## 📖 Problem Overview

The problem asks us to find the size of the largest sequence of strings $s_1, s_2, ..., s_k$ such that every string $s_i$ is a substring of the next string $s_{i+1}$.

In Graph Theory terms, if we treat every string as a node and draw a directed edge $A \to B$ if $A$ is a substring of $B$, we are looking for the **Longest Path in a Directed Acyclic Graph (DAG)**.

Since $N$ (number of strings) is up to $10^4$ and total characters up to $10^6$, a naive comparison $O(N^2)$ is too slow. We need a linear time approach using the **Aho-Corasick Automaton**.

---

## 🧠 Evolution of the Solution

### 1\. The Original Logic (Standard Aho-Corasick)

The initial solution used the textbook definition of Aho-Corasick.

1. **Build Trie:** Insert all words into a Prefix Tree (Trie).
2. **Calculate Failure Links:** Iterate through the Trie (BFS). If a character match fails, follow a "Failure Link" to the longest possible suffix that exists elsewhere in the Trie.
3. **DP Calculation:** The length of the chain ending at node $u$ is:
   $$DP[u] = \max(DP[parent], DP[failLink]) + 1 (\text{if } u \text{ is a word})$$

**The Bottleneck:**
The logic to find a failure link was iterative (a heuristic search):

```cpp
// Original "Walker" Logic
int findFailureLink(int node, char char_to_find) {
    int curr = failLink[node];
    while (true) {
        // 1. If 'curr' has the child, we found it!
        if (Nodes[curr][char_to_find]) return Nodes[curr][char_to_find];

        // 2. If we reached root and still nothing, return root
        if (curr == 0) return 0;

        // 3. Otherwise, walk up one more step
        curr = failLink[curr];
    }
}
```

**Why this is suboptimal:** In the worst case (e.g., many similar repetitive patterns like `aaaaa`), this `while` loop might traverse up the entire depth of the tree repeatedly. This adds a multiplicative factor to the complexity.

---

### 2\. The Optimized Logic (DFA Flattening)

The improved solution transforms the Trie into a **Deterministic Finite Automaton (DFA)**.
Instead of "searching" for a failure link when a character is missing, we **pre-calculate** exactly where the transition should land.

**The "Teleport" Logic:**
During the BFS construction, if a node $u$ does **not** have a child for character 'c', we point that edge directly to where the failure link would have gone.

```cpp
// Improved "Teleport" Logic inside BFS
if (trieNodes[u][i]) {
    // Child exists: Normal processing
} else {
    // Child missing: COPY the pointer from the failure link
    // This makes the transition O(1) instantly.
    trieNodes[u][i] = trieNodes[failLink[u]][i];
}
```

**Key Difference:**

- **Original:** "I don't have this edge. Let me walk up the failure chain to find someone who does." (Iterative).
- **Optimized:** "I don't have this edge, but I know my failure node points to Address X for this character. I will just point to Address X too." (Constant Time).

---

## 🚀 Performance Improvements in Detail

### 1\. DFA Graph Flattening (Time Optimization)

By filling in the `null` edges of the Trie with pointers to failure states, we remove the need for the `while` loop entirely.

- **Before:** Complexity could degenerate to $O(\text{Length} \times \text{Depth})$.
- **After:** Complexity is strictly linear $O(\text{Total Length} \times \Sigma)$, where $\Sigma$ is the alphabet size (26).

### 2\. Lazy Memory Clearing (Memory/Time Optimization)

In competitive programming, test cases vary in size.

- **Original:** `resetArrayZero` iterated through `MAX_NODES` (1,000,000) at the start of _every_ test case, even if the case only had 5 words.
- **Improved:** We introduce `clearNode(int u)`.
  - We keep a `nodesCount`.
  - We only `memset`/clear the memory for a specific node **the moment it is created** inside `insertWord`.
  - This reduces initialization cost from $O(MAX\_NODES)$ to $O(Actual\_Used\_Nodes)$.

### 3\. Fast I/O (C++ Specific)

The optimized C++ solution replaces `cin` or standard `scanf` with a custom `fread` buffer parser.

- Standard I/O reads byte-by-byte with system call overhead.
- `fread` reads 1MB chunks into memory at once, reducing system calls drastically.

---

## 💻 Language Variants & Singularities

### C++ (The Reference)

- **Strategy:** Static Arrays (`int trie[MAX][26]`).
- **Why:** Dynamic allocation (`new Node`) is too slow due to heap fragmentation. Static arrays offer perfect cache locality.

### JavaScript (The "Flat Memory" Hack)

JavaScript objects are heavy. A Trie with $10^6$ nodes using objects (`{ children: {} }`) will crash V8's Garbage Collector.

- **Strategy:** We simulate C++ memory using **TypedArrays**.
- **Implementation:**

  ```javascript
  const children = new Int32Array(MAX_NODES * 26);
  // Access child 'c' of node 'u':
  const child = children[u * 26 + c];
  ```

- This bypasses the Garbage Collector entirely, making JS run almost as fast as C++.

### Python (The Limit)

Python struggles with this problem due to strict memory limits (200MB).

- **Issue:** A Python `list` of integers uses 28+ bytes per integer (pointer + object overhead), whereas C++ uses 4 bytes. A matrix of size $26 \times 10^6$ requires \~200MB+ in Python, causing **MLE** (Memory Limit Exceeded).
- **Attempted Fix:** Using `array.array` reduces memory, but the interpretation overhead causes **TLE** (Time Limit Exceeded).
- **Conclusion:** For massive graph/string problems ($N > 10^6$), Python is often not viable in tight CP limits.

---

## 📊 Complexity Analysis

Given:

- $L$: Sum of lengths of all strings ($10^6$).
- $\Sigma$: Alphabet size (26).

| Approach      | Time Complexity            | Space Complexity     | Notes                                 |
| :------------ | :------------------------- | :------------------- | :------------------------------------ |
| **Original**  | $O(L \times \text{Depth})$ | $O(L \times \Sigma)$ | Slower on repetitive patterns.        |
| **Optimized** | $O(L \times \Sigma)$       | $O(L \times \Sigma)$ | Strict linear time. Best performance. |

---

**Repository Maintainer Notes:**
This archive contains the optimized C++ solution and the memory-hacked JavaScript solution. Both implement the DFA Flattening strategy.
