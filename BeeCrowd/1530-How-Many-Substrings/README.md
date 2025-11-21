# 📖 Beecrowd 1530 - How Many Substrings?

## 🧠 Problem Analysis

The problem asks us to maintain a string that grows character by character. After every insertion (or upon request), we must calculate the number of **distinct substrings** currently present in the string.

- **Input Constraint:** String length ($N$) up to $200,000$.
- **Time Limit:** Very strict (2.0 seconds).
- **The Challenge:** A string of length $N$ can have up to $\frac{N(N+1)}{2}$ substrings.
  - Generating them all is $O(N^2)$.
  - Storing them in a Set/Hash Map is memory-heavy and slow.
  - We need a linear time approach: **$O(N)$**.

This solution utilizes **Ukkonen's Algorithm** to build a **Suffix Tree**. While Suffix Automata (SAM) are often preferred for this specific counting problem, the Suffix Tree is a fundamental structure that provides a visual and structural representation of all suffixes.

---

## 🏗 Data Structure: The "Flattened" Suffix Tree

To achieve high performance in JavaScript, we cannot use standard `class` objects for Tree Nodes. Creating 400,000 objects triggers the Garbage Collector frequently, causing Time Limit Exceeded (TLE).

Instead, we implement a **Struct-of-Arrays** pattern using `Int32Array`. We treat "nodes" simply as integer indices $(1, 2, 3...)$ that point to specific slots in our parallel arrays.

### Memory Layout

We allocate static arrays of size `MAX_NODES` (approx $2 \cdot N$).

1. **`t_start[node]` & `t_len[node]`**:

   - Instead of storing the actual string on edges, Suffix Trees store **indices**.
   - An edge leading to `node` represents the substring in the original text starting at `t_start` with length `t_len`.
   - _Optimization:_ For leaf nodes, `t_len` is effectively $\infty$ (infinity), meaning "until the end of the current string".

2. **`t_next[node * 26 + char]`**:

   - This represents the children edges.
   - Instead of a 2D array `[node][char]`, we flatten it into a huge 1D array.
   - Accessing child `c` of node `u` is done via: `t_next[u * 26 + c]`.

3. **`t_link[node]` (Suffix Link)**:
   - This is the "magic" pointer used to traverse the tree efficiently. It points to the node that represents the longest proper suffix of the current node.

---

## ⚙️ Ukkonen's Algorithm: Step-by-Step Logic

Ukkonen’s algorithm constructs the tree **online**, meaning we process the string from left to right, one character at a time.

### 1. The "Active Point"

Instead of starting from the root for every new suffix (which would take $O(N^2)$), we maintain a cursor called the **Active Point**. It tells us exactly where we are currently looking in the tree.

The Active Point consists of three variables:

- **`activeNode`**: The internal node index we are currently sitting on (or standing below).
- **`activeEdgeChar`**: The first character of the edge we are standing on (if we are not exactly at a node).
- **`activeLen`**: How far down that edge we have walked.

### 2. The "Remainder" (`rem`)

The variable `rem` tells us **how many suffixes we currently need to insert**.

- When we read a new character, `rem` increases by 1 (the new suffix itself).
- If the current character extends an existing path in the tree, we just stop (wait for next turn). `rem` stays high.
- If we need to create a new leaf, we decrement `rem` and move to the next suffix using the **Suffix Link**.

### 3. The Traversal Logic

Processing a character involves a loop that runs as long as `rem > 0`. Inside this loop, we check the Active Point:

#### A. "Canonize" (Walking Down)

If `activeLen` becomes longer than the edge we are standing on, we must jump to the next node.

- _Action:_ Update `activeNode` to the child node, subtract the edge length from `activeLen`, and adjust `activeEdgeChar`.
- _Why?_ This keeps our "cursor" valid.

#### B. The Three Rules of Insertion

Once the Active Point is valid, we check if the character we want to add exists.

- **Rule 1: Extension (The "Showstopper")**

  - _Scenario:_ The character `c` **already exists** at the Active Point.
  - _Action:_ We increment `activeLen` and **break** the loop.
  - _Meaning:_ "This path exists. I don't need to add a new leaf yet. Let's remember we have `rem` pending suffixes and move to the next character."

- **Rule 2: Splitting / New Leaf**

  - _Scenario:_ The character `c` does **not** exist here.
  - _Action:_ 1. **If on an edge:** We cut the edge in half! We create a new internal node (`splitNode`) at the cut point. 2. **Create Leaf:** We create a new leaf node representing the new character `c`. 3. **Link:** If we created a split node previously in this step, we connect its `t_link` to this new split node.
  - _Meaning:_ We just branched off the tree to represent a unique substring.

- **Rule 3: Suffix Link Traversal**
  - _Scenario:_ After applying Rule 2 (creating a leaf), we have finished inserting _one_ of the pending suffixes.
  - _Action:_ We decrement `rem`. We assume the position of the **next shortest suffix** by moving `activeNode` to `t_link[activeNode]`.
  - _Optimization:_ This jump prevents us from walking down from the root again.

---

## 🧮 Counting Substrings Logic

This is the specific logic required by the problem. How do we count distinct substrings without traversing the whole tree?

**Key Insight:**
When we are at the Active Point, we are essentially standing at a string depth of `D`.
The current string being processed has length `L`.

1. Any suffix longer than `D` (the path from root to Active Point) is **already represented** in the tree.
2. Any suffix created by the "Remainder" that we haven't inserted yet is implicitly part of the tree's future leaves.

The formula used in the solution is derived from the **Online Counting Property**:
The number of **new** distinct substrings added by appending a character is equal to the number of suffixes that end at the new position which did not appear before.

In our optimized code, we simplify this accumulation:
$$\text{Total} += \text{CurrentStringLength} - \text{Depth}(\text{ActivePoint})$$

- **`CurrentStringLength`**: Represents all possible suffixes ending at the current position.
- **`Depth(ActivePoint)`**: Represents the longest suffix that _already existed_ in the tree (found via Rule 1 Extension).
- **Difference**: The count of suffixes that are strictly new.

---

## 🚀 JavaScript Specific Optimizations

To pass the 2.0s Time Limit in Node.js:

1. **Raw I/O (`fs.readFileSync(0)`):**

   - `readline` or `fs.readFileSync("/dev/stdin", "utf8")` converts bytes to strings, which is slow.
   - We read the raw buffer and process ASCII bytes directly ($97$ for 'a', $63$ for '?').

2. **Manual Memory Management:**

   - We reuse the `Int32Arrays` between test cases.
   - Instead of `array.fill(0)` (which clears the whole array and is $O(N)$), we track `nodes_count` and only clear the specific indices used in the previous test case. This keeps the reset logic efficient.

3. **Inlining:**
   - Helper functions (like `createNode`) are removed. The logic is written directly inside the `while` loop to avoid the overhead of the function call stack.

---

## 📝 Summary for Students

1. **Don't fear the code:** The implementation looks scary because of the flat arrays (`t_next`, `t_start`), but it maps 1:1 to the logical "Nodes" and "Edges" of a tree.
2. **The "Active Point" is your cursor:** Imagine typing the string and moving a cursor through the tree. If the path exists, move the cursor. If not, draw a new branch.
3. **Counting is math, not traversal:** We don't count nodes. We calculate how "deep" we are in the tree and subtract that from the total string length.

---

## 🤖 Alternative Approach: Suffix Automaton (SAM)

While the Suffix Tree (Ukkonen's) is a powerful visual structure, many competitive programmers prefer the **Suffix Automaton (SAM)**. It solves the same problems but is often considered "cleaner" to implement because it doesn't require managing "edges" with string indices or active points jumping mid-edge.

### 1. What is a Suffix Automaton?

A Suffix Automaton is a **Directed Acyclic Graph (DAG)**.

- **Nodes (States):** Each node represents a set of substrings that occur in the text and share the exact same set of "end positions" (right-end contexts).
- **Edges (Transitions):** Represent appending a character.
- **Suffix Links:** Similar to the Suffix Tree, these point to the state representing the longest suffix that belongs to a _different_ equivalence class.

Unlike the Suffix Tree, which compresses paths, the SAM compresses **states**. For a string of length $N$, a SAM has at most $2N-1$ states and $3N-4$ transitions.

### 2. Key Properties

Every state $u$ in the SAM represents a contiguous range of substring lengths:

- **`len(u)`**: The length of the _longest_ substring represented by state $u$.
- **`minlen(u)`**: The length of the _shortest_ substring in state $u$.
- **The Invariant**: $\text{minlen}(u) = \text{len}(\text{link}(u)) + 1$.

This leads to the beautiful counting property. The number of distinct substrings represented uniquely by state $u$ is simply:
$$Count(u) = len(u) - len(link(u))$$

### 3. Construction Algorithm (Step-by-Step)

The construction is also **online** (character by character). When adding character `c`:

1. **Create State:** Create a new state `cur`. Set `len(cur) = len(last) + 1`.
2. **Add Transitions:** Iterate backwards from the `last` state using Suffix Links. For every state `p` that doesn't have a transition on `c`, point `p --c--> cur`.
3. **Handle Conflicts:**
   - **Case A (Simple):** We reached the root (`-1`). `link(cur) = 0`.
   - **Case B (Merge):** We found a state `p` that _already_ has a transition `q` on `c`.
     - **If `len(p) + 1 == len(q)`:** This means `q` is the perfect candidate. We just set `link(cur) = q`.
     - **If `len(p) + 1 < len(q)` (The "Clone" Step):** This is the tricky part. State `q` represents substrings that are "too long" to simply append `c` to `p`.
       - We **Clone** state `q` into `clone`.
       - The `clone` inherits `q`'s transitions and suffix link, but has `len(clone) = len(p) + 1`.
       - We redirect all transitions from `p` (and its ancestors) that pointed to `q` to now point to `clone`.
       - Finally, `link(q) = clone` and `link(cur) = clone`.

### 4. Why use SAM over Suffix Tree?

- **Simpler Counting:** To count all distinct substrings, you sum `len(u) - len(link(u))` for all nodes. To count _newly added_ distinct substrings (like in this problem), you just calculate `len(cur) - len(link(cur))` after the update.

- **Memory:** It often uses slightly less memory for the edges (26 edges per node worst-case, but usually sparse) compared to the heavy edge management of Suffix Trees.
- **Traversal:** It acts like a DFA (Deterministic Finite Automaton). Checking if a substring exists is just following edges $O(M)$, exactly like in a Trie.

---

## Bibliographies

### Ukkonen's Algorithm

- <https://www.youtube.com/watch?v=ALEV0Hc5dDk>
- <https://www.youtube.com/watch?v=OT5CigmVfh0>
- <https://www.geeksforgeeks.org/ukkonens-suffix-tree-construction-part-1/>
