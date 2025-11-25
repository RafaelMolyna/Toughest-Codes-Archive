# 📚 Documentation: BeeCrowd 1231 - Words

## Problem Analysis

The problem asks if we can form the exact same sequence of "0"s and "1"s by concatenating words from two different sets, Set A and Set B.

This is a classic **Non-Deterministic Problem**. At any point, if we are using a word from Set A, and that word ends, we immediately start another word from Set A. We don't know _which_ word comes next, so we must explore all possibilities.

### 1\. Data Structure: The Trie (Prefix Tree)

Since we are dealing with sets of words and matching them character by character, the **Trie** is the ideal structure.

- We build **Trie A** for the first set.
- We build **Trie B** for the second set.
- Each node in the Trie represents a "state" or a prefix of a word.

### 2\. Algorithm: Simultaneous State-Space Search (DFS)

We need to traverse both Tries at the same time. We define our "State" as a pair of nodes:
$$State = (Node_A, Node_B)$$
Where $Node_A$ is our current position in Trie A, and $Node_B$ is our current position in Trie B.

**The Rules of Movement (Transitions):**

1. **Match Character:** If both $Node_A$ and $Node_B$ have a child for '0', we move both pointers to those children. Same for '1'.
2. **Word Boundary (The "Reset"):** This is the key logic.
   - If $Node_A$ marks the end of a word (`isEnd == true`), it means we have completed a block from Set A. We can logically "jump" $Node_A$ back to the `Root_A` to start a new word, while $Node_B$ stays exactly where it is (waiting to finish its current word).
   - We apply the same logic if $Node_B$ is at the end of a word.

### 3\. Cycle Detection (Memoization)

A naive recursive solution will fail because we might enter an infinite loop (e.g., Set A has "0", Set B has "00").

- We use a `visited` set to store every pair $(ID_A, ID_B)$ we have already processed.
- If we encounter a state we have seen before, we stop that branch immediately.

### 4\. Complexity

- **Time Complexity:** $O(N \times M)$, where $N$ is the number of nodes in Trie A and $M$ is the number of nodes in Trie B. In the worst case, we visit every possible pair of nodes once. Given the constraints ($20 \text{ words} \times 40 \text{ chars}$), $N, M \approx 800$. This is extremely fast ($800^2 = 640,000$ ops).
- **Space Complexity:** $O(N \times M)$ to store the `visited` matrix/set.

---

## 🐍 Solution: Python 3

Python requires specific handling for recursion limits and efficient hashing.

**Key Python Singularities Used:**

1. **`sys.setrecursionlimit`:** Python's default recursion depth is 1000. Our state space could theoretically go deeper, so we increase it.
2. **Tuples for Hashing:** Unlike JS where we manually created a bitwise hash key, or C++ where we used a 2D array, Python allows us to simply add the tuple `(node1, node2)` to a `set()`. Python's tuple hashing is highly optimized.
3. **`__slots__`:** Used in the Node class to reduce memory footprint. By default, Python classes use a `__dict__` which is heavy. `__slots__` tells Python to allocate a fixed amount of memory.

### Final Note for Archive

1. **JavaScript:** Uses bitwise hashing for keys (very "low-level" JS optimization technique).
2. **C++:** Uses static arrays and memory pooling (classic CP performance technique).
3. **Python:** Uses `__slots__` and tuple hashing (Pythonic object-oriented optimization).
