# BeeCrowd 1023 - Drought (Seca)

**Problem Link:** [BeeCrowd 1023](https://www.beecrowd.com.br/judge/en/problems/view/1023)  
**Topic:** Data Structures, Sorting, Fast I/O  
**Difficulty:** Medium (due to strict time limits and precision constraints)

## 1. Problem Breakdown

The government needs a report on water consumption. For a list of cities, you are given several properties. For each property, you get:

1. **X:** Number of residents.
2. **Y:** Total consumption ($m^3$).

**The Goal:**

1. Group residents by their integer average consumption ($\lfloor Y/X \rfloor$).
2. Sort these groups in ascending order of consumption.
3. Calculate the overall average consumption of the city, truncated to 2 decimal places.

### Constraints & Pitfalls

- **N (Properties):** Up to $1,000,000$.
- **Y (Consumption):** Up to $200$.
- **Time Limit:** 2.0 seconds.
- **Pitfall 1 (Performance):** Sorting 1 million items using standard algorithms ($O(N \log N)$) is often too slow for interpreted languages (JS/Python) on this platform.
- **Pitfall 2 (Precision):** The problem asks for _truncation_ (floor) of the average, not rounding. `13.289` must become `13.28`, not `13.29`.

---

## 2. The Logic: Bucket Sort (Counting Sort)

The most critical observation in this problem is the constraint: **No residence consumes more than 200 $m^3$.**

Since the total consumption $Y \le 200$, the average consumption per person ($Y/X$) can never exceed 200. This allows us to discard standard sorting algorithms (like Quicksort or Mergesort) in favor of **Bucket Sort**.

### Step-by-Step Algorithm

1. **Create Buckets:** We allocate an array of size 201 (indices 0 to 200).
   - `bucket[i]` will store the number of people who have an average consumption of `i`.
2. **Fill Buckets (One Pass):**
   - Read a house with $X$ people and $Y$ consumption.
   - Calculate average: $avg = \lfloor Y / X \rfloor$.
   - Add people to the bucket: `bucket[avg] += X`.
3. **Read Buckets (Output):**
   - Iterate from index 0 to 200.
   - If `bucket[i] > 0`, print "$bucket[i]-i$".
   - Since we iterate indices in order, the output is automatically sorted.

**Complexity Analysis:**

- **Time:** $O(N)$ to read input + $O(K)$ to print (where $K=200$). This is linear time.
- **Space:** $O(K)$ for the buckets.

[Image of Bucket Sort Logic Diagram]

---

## 3. Aggressive Optimization: Fast I/O

For $N = 10^6$, simply reading the input text is often slower than the math itself. The "standard" ways of reading input involve:

1. Reading bytes from disk.
2. Decoding bytes to UTF-8 characters.
3. Scanning for newlines.
4. Creating String objects (memory allocation).
5. Parsing Strings to Integers.

**Our Strategy:** We bypass steps 2, 3, and 4. We read raw binary bytes into a buffer and use a pointer to construct integers directly.

---

## 4. Language Specific Details

### ⚡ C++ (Rank #2 - ~0.000s)

C++ is naturally fast, but `cin` and `scanf` can still be slow with millions of integers.

- **`fread`:** We read the entire input into a massive `char` buffer in one shot.
- **Pointer Arithmetic:** We parse integers by checking byte values manually. This eliminates all overhead of format specifiers used in `scanf`.

### 🚀 JavaScript / Node.js (Rank #1 - ~0.179s)

Node.js usually handles I/O via Strings (`fs.readFileSync(...).toString()`).

- **Buffer Read:** We use `fs.readFileSync(0)` to get the raw buffer.
- **No `split()`:** Using `.split('\n')` on a 10MB file creates millions of small strings, thrashing the Garbage Collector. We avoid this entirely by iterating the buffer.
- **`Int32Array`:** We use a TypedArray for the buckets, which is closer to a C-array in memory performance than a standard JS Array.

---

## 5. The Truncation Math

To calculate the city average truncated to 2 decimal places without floating point errors:

1. Multiply total consumption by 100: `total * 100`.
2. Integer divide by residents: `val = (total * 100) // residents`.
3. Extract parts:
   - Whole part: `val // 100`
   - Fraction part: `val % 100`

Example:

- Real Average: `13.289`
- `(Total * 100) // Residents` -> `1328`
- Whole: `13`
- Frac: `28`
- Result: `13.28`
  s
