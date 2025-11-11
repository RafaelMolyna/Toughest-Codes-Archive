/**
 * Beecrowd 1058: Independent Attacking Zones
 *
 * * CP-Optimized Port of the "saveAllRotations" logic *
 *
 * This port implements the user's latest JS logic:
 * 1. Pass 'vector<char>' by value.
 * 2. Save the original vector as 'key'.
 * 3. Check memo for 'key'.
 * 4. Mutate the *local copy* 'points' to its canonical form.
 * 5. Run base cases and recursion on the mutated 'points'.
 * 6. Call 'saveAllRotations(key, ...)' to store the result.
 */

#include <iostream>
#include <vector>
#include <string>
#include <numeric>   // For std::accumulate
#include <algorithm> // For std::find, std::rotate
#include <unordered_map>
#include <iterator> // For std::distance

using namespace std;
typedef long long ll;

// --- Pre-calculated Base Cases ---
ll triArr[] = {
    1, 1, 3, 12, 55, 273, 1428, 7752, 43263,
    246675, 1430715, 8414640, 50067108, 300830572};

// --- Custom Hasher for vector<char> ---
struct VectorCharHasher
{
  std::size_t operator()(const vector<char> &v) const
  {
    std::size_t hash = v.size();
    for (char b : v)
    {
      hash ^= (b << 1) + 0x9e3779b9 + (hash << 6) + (hash >> 2);
    }
    return hash;
  }
};

// --- Memoization Cache ---
unordered_map<vector<char>, ll, VectorCharHasher> memo;

// --- Helper Functions ---

// Pass by const reference (&)
int countReds(const vector<char> &points)
{
  int acc = 0;
  for (char p : points)
  {
    acc += p;
  }
  return acc;
}

// Pass by const reference (&)
bool isAllRedsInMod3(const vector<char> &points)
{
  for (int i = 0; i < points.size(); ++i)
  {
    if (points[i] && i % 3 != 0)
    {
      return false;
    }
  }
  return true;
}

/**
 * @brief Pre-caches the answer for all N rotations.
 */
void saveAllRotations(vector<char> key_vec, int num_points, ll result)
{
  memo[key_vec] = result;
  for (int i = 1; i < num_points; ++i)
  {
    // std::rotate is an efficient way to get the next rotation
    rotate(key_vec.begin(), key_vec.begin() + 1, key_vec.end());
    memo[key_vec] = result;
  }
}

/**
 * @param points The sub-problem. Passed *by value* to
 * create a local, mutable copy.
 * @param numPoints The size of the sub-problem.
 * @param redsCount The pre-computed red count.
 */
ll solve(vector<char> points, int numPoints, int redsCount)
{
  if (numPoints == 0)
  {
    return 1;
  }

  // Save the original key (which is the 'points' vector
  // as it was passed in, before mutation).
  const vector<char> original_key = points;

  // --- MEMOIZATION CHECK (Original Key) ---
  auto it_memo = memo.find(original_key);
  if (it_memo != memo.end())
  {
    return it_memo->second;
  }

  int numTriag = numPoints / 3;

  // --- Base Case 1: Pruning ---
  if (redsCount > numTriag)
  {
    saveAllRotations(original_key, numPoints, 0);
    return 0;
  }

  // --- Base Case 2: 0 or 1 Red ---
  // (Re-adding this tweak as it's a solid optimization)
  if (redsCount <= 1)
  {
    ll result = triArr[numTriag];
    saveAllRotations(original_key, numPoints, result);
    return result;
  }

  // --- Logic: Rotate *local copy* to Canonical Form ---
  auto it_find = find(points.begin(), points.end(), (char)1);
  // No need to check for points.end(), handled by redsCount <= 1
  rotate(points.begin(), it_find, points.end());

  // --- Base Case 3: "Magic" mod 3 optimization ---
  // This check happens *after* the local copy was rotated.
  if (isAllRedsInMod3(points))
  {
    ll result = triArr[numTriag];
    saveAllRotations(original_key, numPoints, result);
    return result;
  }

  // --- Recursive Step ---
  // 'points' is now the canonical (red-first) vector.
  ll numTriagCount = 0;

  for (int p1 = 1; p1 < numPoints; p1 += 3)
  {
    if (points[p1]) // p1 must be Black
    {
      continue;
    }

    vector<char> pointsA1(points.begin() + 1, points.begin() + p1);
    int n1 = pointsA1.size();
    int r1 = countReds(pointsA1);
    if (r1 > n1 / 3)
      continue;

    ll area1 = solve(pointsA1, n1, r1);
    if (area1 == 0)
      continue;

    for (int p2 = p1 + 1; p2 < numPoints; p2 += 3)
    {
      if (points[p2]) // p2 must be Black
      {
        continue;
      }

      vector<char> pointsA2(points.begin() + p1 + 1, points.begin() + p2);
      int n2 = pointsA2.size();
      int r2 = countReds(pointsA2);
      if (r2 > n2 / 3)
        continue;

      vector<char> pointsA3(points.begin() + p2 + 1, points.end());
      int n3 = pointsA3.size();
      int r3 = countReds(pointsA3);
      if (r3 > n3 / 3)
        continue;

      ll area2 = solve(pointsA2, n2, r2);
      if (area2 == 0)
        continue;

      ll area3 = solve(pointsA3, n3, r3);

      numTriagCount += area1 * area2 * area3;
    }
  }

  // --- MEMOIZATION SAVE ---
  // Save the result for the *original* key and all its rotations
  saveAllRotations(original_key, numPoints, numTriagCount);
  return numTriagCount;
}

// --- Main Function ---
int main()
{
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

    vector<char> points(numPoints);
    int redsCount = 0;
    for (int j = 0; j < numPoints; ++j)
    {
      if (line[j] == 'R')
      {
        points[j] = 1;
        redsCount++;
      }
      else
      {
        points[j] = 0;
      }
    }

    memo.clear();

    // Pass 'points' by value. 'solve' gets its own copy.
    cout << "Case " << i << ": " << solve(points, numPoints, redsCount) << "\n";
  }

  return 0;
}