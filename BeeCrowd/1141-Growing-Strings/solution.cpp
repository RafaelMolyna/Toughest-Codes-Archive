#include <iostream>
#include <vector>
#include <queue>
#include <cstring>
#include <algorithm>

using namespace std;

// Constraints
const int MAX_NODES = 1000005; // 10^6 + 5
const int ALPHABET = 26;

// Global Automaton Structures
// We use static arrays for performance (better cache locality, no allocation overhead)
int trieNodes[MAX_NODES][ALPHABET];
int failLink[MAX_NODES];
int dp[MAX_NODES]; // Previously nSubWords
bool isWord[MAX_NODES];
int nodesCount = 1;

// Reset only the row we are about to use (Lazy Clearing)
void clearNode(int node)
{
  memset(trieNodes[node], 0, sizeof(int) * ALPHABET);
  isWord[node] = false;
  dp[node] = 0;
  failLink[node] = 0;
}

void insertWord(const string &s)
{
  int curr = 0; // Root is 0
  for (char c : s)
  {
    int idx = c - 'a';
    if (!trieNodes[curr][idx])
    {
      trieNodes[curr][idx] = nodesCount;
      clearNode(nodesCount); // Clear memory only when allocating
      nodesCount++;
    }
    curr = trieNodes[curr][idx];
  }
  isWord[curr] = true;
}

int buildAutomaton()
{
  queue<int> q;
  int maxChain = 0;

  // 1. Initialize Root's children (Depth 1)
  for (int i = 0; i < ALPHABET; i++)
  {
    int child = trieNodes[0][i];
    if (child)
    {
      // Fail link of depth 1 is always root (0)
      // DP: if it's a word, count starts at 1, else 0.
      if (isWord[child])
      {
        dp[child] = 1;
        maxChain = max(maxChain, 1);
      }
      q.push(child);
    }
  }

  // 2. BFS to build Fail Links and compute DP
  while (!q.empty())
  {
    int u = q.front();
    q.pop();

    for (int i = 0; i < ALPHABET; i++)
    {
      int v = trieNodes[u][i];

      if (v)
      {
        // Case A: Child exists.
        // 1. Set Failure Link: Use the pre-calculated edge from the failure of parent
        failLink[v] = trieNodes[failLink[u]][i];

        // 2. DP Logic:
        // Option 1: Extend from Parent (Prefix property)
        int fromParent = dp[u];
        // Option 2: Extend from Failure Link (Suffix property)
        int fromSuffix = dp[failLink[v]];

        dp[v] = max(fromParent, fromSuffix);

        if (isWord[v])
        {
          dp[v]++;
        }

        maxChain = max(maxChain, dp[v]);
        q.push(v);
      }
      else
      {
        // Case B: Child doesn't exist.
        // Optimization: Direct the edge to the failure state's edge.
        // This creates the DFA Graph Structure (O(1) transition).
        trieNodes[u][i] = trieNodes[failLink[u]][i];
      }
    }
  }
  return maxChain;
}

int main()
{
  // Fast I/O
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  while (cin >> n && n != 0)
  {
    // Reset for new test case
    nodesCount = 1;
    clearNode(0); // Clear root manually

    string s;
    for (int i = 0; i < n; i++)
    {
      cin >> s;
      insertWord(s);
    }

    cout << buildAutomaton() << "\n";
  }
  return 0;
}
