#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <set>

using namespace std;

// Documentation:
// Structure to hold Slab details.
struct Card
{
  int v_small;
  int v_large;
  int v_diff;
  int v_sum;
  int original_index;
};

// Global storage to avoid reallocation
vector<Card> cards;
vector<int> suffix_sums;
// Memoization: store visited states. Key = idx * 400000 + sum + offset
// Using a set because array [400][800000] is too large (320MB integers).
// Given strict memory, std::set<pair<int,int>> is safer.
set<pair<int, int>> memo;

// Recursive Solver
// idx: current card index we are deciding on
// target: the balance we need to achieve (0)
// ignore_idx: index of the card we decided to discard (or -1)
bool can_solve(int idx, int target, int ignore_idx)
{
  // 1. Base Case: No cards left
  if (idx < 0)
  {
    return target == 0;
  }

  // 2. Skip ignored card
  if (idx == ignore_idx)
  {
    return can_solve(idx - 1, target, ignore_idx);
  }

  // 3. Pruning (Bounding)
  // logic: suffix_sums[idx] is the max possible sum achievable by all cards from 0 to idx.
  // If abs(target) > max_possible, we can never reach 0.
  // Note: If ignore_idx < idx, suffix_sums[idx] includes the ignored card,
  // making the bound slightly loose but still valid (valid upper bound).
  // For tighter bounds, we'd recalculate suffix sums, but this is usually sufficient.
  if (abs(target) > suffix_sums[idx])
  {
    return false;
  }

  // 4. Memoization Check
  if (memo.count({idx, target}))
  {
    return false; // Already visited this state and it failed
  }

  int diff = cards[idx].v_diff;

  // 5. Try Subtracting Difference
  if (can_solve(idx - 1, target - diff, ignore_idx))
    return true;

  // 6. Try Adding Difference
  if (can_solve(idx - 1, target + diff, ignore_idx))
    return true;

  // 7. Mark failure
  memo.insert({idx, target});
  return false;
}

// Comparator for discarding strategy
bool compareCardsForDiscard(const pair<Card, int> &a, const pair<Card, int> &b)
{
  // Minimize total sum discarded (Maximize remaining)
  if (a.first.v_sum != b.first.v_sum)
  {
    return a.first.v_sum < b.first.v_sum;
  }
  // Tie-breaker: Minimize the smaller face value
  return a.first.v_small < b.first.v_small;
}

void solve()
{
  int N;
  while (cin >> N && N != 0)
  {
    cards.clear();
    int total_sum_all = 0;

    for (int i = 0; i < N; ++i)
    {
      int u, v;
      cin >> u >> v;
      Card c;
      c.v_small = min(u, v);
      c.v_large = max(u, v);
      c.v_diff = c.v_large - c.v_small;
      c.v_sum = c.v_large + c.v_small;
      c.original_index = i;
      cards.push_back(c);
      total_sum_all += c.v_sum;
    }

    // Optimization: Sort cards by difference (ascending).
    // This helps pruning cut off branches earlier in the recursion.
    sort(
        cards.begin(),
        cards.end(),
        [](const Card &a, const Card &b)
        { return a.v_diff < b.v_diff; });

    // Precompute Suffix Sums for Pruning
    // suffix_sums[i] = Sum(diff) for cards 0..i
    suffix_sums.resize(N);
    int run_diff = 0;
    for (int i = 0; i < N; ++i)
    {
      run_diff += cards[i].v_diff;
      suffix_sums[i] = run_diff;
    }

    bool solved = false;

    // 1. Try solving with NO discard
    if (total_sum_all % 2 == 0)
    {
      memo.clear();
      if (can_solve(N - 1, 0, -1))
      {
        cout << total_sum_all / 2 << " discard none" << endl;
        solved = true;
      }
    }

    // 2. Try discarding one card
    if (!solved)
    {
      // Prepare candidates with their index in the sorted 'cards' vector
      vector<pair<Card, int>> candidates;
      for (int i = 0; i < N; ++i)
      {
        candidates.push_back({cards[i], i});
      }

      // Sort candidates based on problem rules (Min Sum, then Min Value)
      sort(candidates.begin(), candidates.end(), compareCardsForDiscard);

      for (auto &p : candidates)
      {
        Card c = p.first;
        int idx_in_vec = p.second;
        int remaining_sum = total_sum_all - c.v_sum;

        if (remaining_sum % 2 != 0)
          continue;

        // Temporarily adjust suffix sums could be optimized here,
        // but using the slightly loose bound (including the ignored card)
        // is mathematically safe and faster to implement.
        // Strict: if (abs(target) > suffix_sums[idx] - (idx >= ignore ? diff : 0))
        // The loose bound is usually fine. Let's use loose bound.

        memo.clear();
        if (can_solve(N - 1, 0, idx_in_vec))
        {
          cout << remaining_sum / 2 << " discard " << c.v_small << " " << c.v_large << endl;
          solved = true;
          break;
        }
      }
    }

    if (!solved)
    {
      cout << "impossible" << endl;
    }
  }
}

int main()
{
  // Fast I/O
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);
  solve();
  return 0;
}