/**
 * BeeCrowd 1034 - Ice Statues Festival
 * Author: [Your Name/Handle]
 * Algorithm: Hybrid Greedy + Unbounded Knapsack
 * Complexity: O(C * N) where C is constant (~10,000)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

const int INF = 1e9;

void solve()
{
  int T;
  // Fast I/O is crucial for competitive C++
  if (!(cin >> T))
    return;

  // We reuse this buffer to avoid memory allocation overhead per test case.
  // Max needed size is approx 100 * 100 = 10,000.
  // 20,000 is a safe upper bound.
  vector<int> dp(20000);

  while (T--)
  {
    int N, M;
    cin >> N >> M;

    vector<int> coins(N);
    for (int i = 0; i < N; ++i)
    {
      cin >> coins[i];
    }

    // 1. Sort Descending
    // We need the largest coins to calculate the "Safe Limit"
    sort(coins.begin(), coins.end(), greater<int>());

    int max_coin = coins[0];
    int count = 0;

    // 2. Dynamic Limit Heuristic
    // The pattern of optimal coins stabilizes after Largest * 2nd_Largest.
    // We only need to DP the "unstable" remainder.
    int safe_limit = 0;
    if (N >= 2)
    {
      safe_limit = max_coin * coins[1];
    }

    // 3. Greedy Reduction
    // If M is huge, peel off layers of the largest coin
    // until M is close to our safe_limit.
    if (M > safe_limit)
    {
      int reduce_amount = M - safe_limit;
      int num_max_coins = reduce_amount / max_coin;
      if (num_max_coins > 0)
      {
        count += num_max_coins;
        M -= num_max_coins * max_coin;
      }
    }

    // 4. Dynamic Programming
    // Solve the small remainder using standard Unbounded Knapsack

    // Reset DP table (only up to the new M)
    fill(dp.begin(), dp.begin() + M + 1, INF);
    dp[0] = 0;

    for (int i = 1; i <= M; ++i)
    {
      for (int j = 0; j < N; ++j)
      {
        if (i >= coins[j])
        {
          if (dp[i - coins[j]] != INF)
          {
            dp[i] = min(dp[i], dp[i - coins[j]] + 1);
          }
        }
      }
    }

    count += dp[M];
    cout << count << "\n";
  }
}

int main()
{
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);
  solve();
  return 0;
}
