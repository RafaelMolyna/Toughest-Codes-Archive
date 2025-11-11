/**
 * Toughest-Codes-Archive
 * Beecrowd 1058: Independent Attacking Zones
 * * This is a C++-native, high-performance implementation of the
 * recursive, memoized DP solution.
 * * The core bottleneck in a naive C++ port is using `std::map<vector<bool>>`.
 * `std::map` is a tree, requiring O(N*logM) for lookups/inserts.
 * * This solution uses `std::unordered_map`, which is a hash map.
 * Lookups/inserts are amortized O(N) (to hash the vector) or O(1).
 * This requires a custom hash function for `vector<bool>`.
 * * Original JS logic by: Rafael Molina
 * C++ Optimization by: Gemini
 */

// Play with: > g++ solution.cpp -o solution.exe && type stdin.txt | solution.exe
// Play with: > g++ solution.cpp -o solution.exe && type "test3 cult.txt" | solution.exe

#include <iostream>
#include <vector>
#include <string>
#include <numeric>       // For std::accumulate (though we'll write our own)
#include <algorithm>     // For std::rotate, std::find
#include <unordered_map> // The "fast map" (hash map)

// Use long long for all counts to prevent integer overflow.
using namespace std;
typedef long long ll;

// --- Pre-calculated Base Cases ---
// The "Catalan-like" sequence for N triangles with 0/1 Reds.
// triArr[N] = answer for N*3 points.
ll triArr[] = {
    1,  // 0 triangles (n=0)
    1,  // 1 triangle (n=3)
    3,  // 2 triangles (n=6)
    12, // 3 triangles (n=9)
    55, // 4 triangles (n=12)
    273,
    1428,
    7752,
    43263,
    246675,
    1430715,
    8414640,
    50067108,
    300830572 // 13 triangles (n=39)
};

// --- Custom Hasher (The "Magic") ---
// We must teach std::unordered_map how to hash a vector<bool>.
// This struct provides a hash function that combines all
// booleans into a single, unique-ish hash value.
struct VectorBoolHasher
{
  std::size_t operator()(const vector<bool> &v) const
  {
    std::size_t hash = v.size();
    for (bool b : v)
    {
      // A common hash-combining formula
      hash ^= (b << 1) + 0x9e3779b9 + (hash << 6) + (hash >> 2);
    }
    return hash;
  }
};

// --- Memoization Cache ---
// We now use the fast hash map.
// Key: The state (the array of points)
// Value: The computed answer (ll)
unordered_map<vector<bool>, ll, VectorBoolHasher> memo;

// --- Helper Functions (Optimized) ---

// Pass by const reference (&) to avoid copying the whole vector
int countReds(const vector<bool> &points)
{
  int acc = 0;
  for (bool p : points)
  {
    if (p)
      acc++;
  }
  return acc;
}

// Pass by const reference (&)
int countRedsEffective(const vector<bool> &points)
{
  int acc = 0;
  for (int i = 0; i < points.size(); ++i)
  {
    if (points[i] && i % 3 != 0)
    {
      acc++;
    }
  }
  return acc;
}

// --- The Main Recursive Function ---

/**
 * @param points The sub-problem (array segment) to solve.
 * We pass *by value* here. This is INTENTIONAL.
 * It creates a copy, which we are free to mutate
 * (rotate) without causing side effects for the caller.
 * @return The total number of valid triangulations (as a long long).
 */
ll solve(vector<bool> points)
{
  int numPoints = points.size();

  // Base Case 0: Empty array
  if (numPoints == 0)
  {
    return 1;
  }

  // --- MEMOIZATION CHECK ---
  // This is now an O(N) (hash) + O(1) (lookup) operation,
  // which is *much* faster than the O(N*logM) of std::map.
  if (memo.count(points))
  {
    return memo[points];
  }

  // --- Base Case 1: 0 or 1 Red ---
  int reds = countReds(points);
  int numTriag = numPoints / 3;
  if (reds <= 1)
  {
    // Store and return
    return memo[points] = triArr[numTriag];
  }

  // --- Base Case 2: Pruning ---
  if (reds > numTriag)
  {
    return memo[points] = 0;
  }

  // --- Logic from your original solution (The "Rotation") ---
  // We rotate *our copy* of 'points' to put the first Red at index 0.
  auto it = find(points.begin(), points.end(), true);
  if (it != points.begin() && it != points.end())
  {
    // This is the C++ version of your `splice/push` trick.
    rotate(points.begin(), it, points.end());
  }

  // --- Base Case 3: "Effective Red" Pruning ---
  // This check *must* happen *after* the rotation.
  if (countRedsEffective(points) == 0)
  {
    return memo[points] = triArr[numTriag];
  }

  // --- Recursive Step ---
  // p0 is at index 0 (and it's Red).
  ll numTriagCount = 0;
  for (int p1 = 1; p1 < numPoints; p1 += 3)
  {
    if (points[p1])
    { // p1 must be Black
      continue;
    }

    // Sub-problem 1 (points 1 to p1-1)
    // This 'slice' (vector construction) is the new bottleneck,
    // but it is *required* by the algorithm's rotating state.
    vector<bool> pointsA1(points.begin() + 1, points.begin() + p1);
    if (countReds(pointsA1) > pointsA1.size() / 3)
      continue;

    ll area1 = solve(pointsA1);
    if (area1 == 0)
      continue;

    for (int p2 = p1 + 1; p2 < numPoints; p2 += 3)
    {
      if (points[p2])
      { // p2 must be Black
        continue;
      }

      // Sub-problem 2 (p1+1 to p2-1)
      vector<bool> pointsA2(points.begin() + p1 + 1, points.begin() + p2);
      if (countReds(pointsA2) > pointsA2.size() / 3)
        continue;

      // Sub-problem 3 (p2+1 to N-1)
      vector<bool> pointsA3(points.begin() + p2 + 1, points.end());
      if (countReds(pointsA3) > pointsA3.size() / 3)
        continue;

      // Recurse only if all pruning passes
      ll area2 = solve(pointsA2);
      if (area2 == 0)
        continue;

      ll area3 = solve(pointsA3);
      if (area3 == 0)
        continue;

      numTriagCount += area1 * area2 * area3;
    }
  }

  // --- MEMOIZATION SAVE ---
  return memo[points] = numTriagCount;
}

// --- Main Function ---
int main()
{
  // Optimize C++ I/O streams
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);

  int numCases;
  cin >> numCases;
  for (int i = 1; i <= numCases; ++i)
  {
    int numPoints;
    cin >> numPoints;
    string line;
    cin >> line;

    vector<bool> points(numPoints);
    for (int j = 0; j < numPoints; ++j)
    {
      points[j] = (line[j] == 'R');
    }

    // Clear memo for each new test case
    memo.clear();

    cout << "Case " << i << ": " << solve(points) << "\n";
  }

  return 0;
}