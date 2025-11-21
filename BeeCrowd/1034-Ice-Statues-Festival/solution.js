function solve() {
  const fs = require("fs");
  const input = fs.readFileSync("/dev/stdin", "utf8");
  let pos = 0;

  // Custom integer parser for speed (faster than input.split)
  function readInt() {
    while (pos < input.length && input.charCodeAt(pos) <= 32) pos++;
    if (pos >= input.length) return null;
    let res = 0;
    while (pos < input.length && input.charCodeAt(pos) > 32) {
      res = res * 10 + (input.charCodeAt(pos) - 48);
      pos++;
    }
    return res;
  }

  const T = readInt();
  if (T === null) return;

  const dp = new Int32Array(12000); // Safe buffer size

  for (let t = 0; t < T; t++) {
    const N = readInt();
    let M = readInt();

    const coins = new Int32Array(N);
    for (let i = 0; i < N; i++) coins[i] = readInt();

    coins.sort((a, b) => b - a); // Sort Descending

    const maxCoin = coins[0];
    let count = 0;

    // Dynamic Limit Heuristic
    let safe_limit = 0;
    if (N >= 2) safe_limit = maxCoin * coins[1];

    // Greedy Reduction
    if (M > safe_limit) {
      const reduceAmount = M - safe_limit;
      const numMaxCoins = Math.floor(reduceAmount / maxCoin);
      if (numMaxCoins > 0) {
        count += numMaxCoins;
        M -= numMaxCoins * maxCoin;
      }
    }

    // DP on Remainder
    const INF = 1e9;
    dp[0] = 0;
    for (let i = 1; i <= M; i++) {
      dp[i] = INF;
      for (let j = 0; j < N; j++) {
        if (i >= coins[j]) {
          const val = dp[i - coins[j]];
          if (val + 1 < dp[i]) dp[i] = val + 1;
        }
      }
    }

    count += dp[M];
    process.stdout.write(count + "\n");
  }
}

solve();
