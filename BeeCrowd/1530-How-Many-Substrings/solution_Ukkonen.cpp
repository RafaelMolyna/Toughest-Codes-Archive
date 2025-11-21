/**
 * Problem: Beecrowd 1530 - How Many Substrings?
 * Language: C++
 * Optimization: Static Arrays, Reset Optimization, Ukkonen's Algorithm
 * runtime: 0.214s
 */
#include <iostream>
#include <vector>
#include <string>
#include <cstring>

using namespace std;

const int INF = 1e9;
const int MAXN = 200005;        // Max string length
const int MAX_NODES = MAXN * 2; // Max nodes in suffix tree

// Tree Structure (Static Arrays)
int t_start[MAX_NODES];
int t_len[MAX_NODES];      // Length of edge
int t_link[MAX_NODES];     // Suffix Link
int t_depth[MAX_NODES];    // String depth (cumulative length from root)
int t_next[MAX_NODES][26]; // Children edges

// Global variables for the current tree state
int nodes_count;
int active_node;
int active_len;
int active_edge_char_idx; // Index in S[]
int rem;                  // Remainder
long long total_substrings;

// Input String Buffer
int S[MAXN];
int s_len;

void reset_tree()
{
  // Only clear the nodes we used in the previous iteration
  // Root is always 1
  for (int i = 0; i <= nodes_count; i++)
  {
    // No need to clear start/len/depth/link if we overwrite them,
    // but t_next MUST be cleared because we check for 0 (null).
    // Clearing 26 integers is fast.
    memset(t_next[i], 0, sizeof(t_next[i]));
  }

  nodes_count = 1;
  t_len[1] = 0; // Root len
  t_link[1] = 0;
  t_depth[1] = 0;

  active_node = 1;
  active_len = 0;
  active_edge_char_idx = -1;
  rem = 0;
  total_substrings = 0;
  s_len = 0;
}

void solve()
{
  string line;
  while (cin >> line)
  {
    reset_tree();

    string output_buffer = "";

    for (char c : line)
    {
      if (c == '?')
      {
        cout << total_substrings << "\n";
        continue;
      }

      // Add character to string
      int charVal = c - 'a';
      S[s_len++] = charVal;
      rem++;

      int last_new_node = 0;

      while (rem > 0)
      {
        if (active_len == 0)
        {
          active_edge_char_idx = s_len - 1;
        }

        int edge_char = S[active_edge_char_idx];
        int child = t_next[active_node][edge_char];

        if (child == 0)
        {
          // Rule 2: Create Leaf
          nodes_count++;
          int leaf = nodes_count;

          t_start[leaf] = s_len - 1;
          t_len[leaf] = INF;
          t_link[leaf] = 1;
          t_depth[leaf] = t_depth[active_node] + t_len[leaf]; // Virtual depth

          // t_next is already 0 due to reset logic
          t_next[active_node][edge_char] = leaf;

          if (last_new_node != 0)
          {
            t_link[last_new_node] = active_node;
            last_new_node = 0;
          }
        }
        else
        {
          // Edge exists
          int edge_len = t_len[child];
          if (edge_len > INF / 2)
          { // If essentially infinite
            edge_len = s_len - t_start[child];
          }

          if (active_len >= edge_len)
          {
            // Walk down
            active_edge_char_idx += edge_len;
            active_len -= edge_len;
            active_node = child;
            continue; // Continue outer while loop
          }

          // Check character on edge
          int existing_char = S[t_start[child] + active_len];

          if (existing_char == charVal)
          {
            // Rule 3: Extension
            active_len++;
            if (last_new_node != 0)
            {
              t_link[last_new_node] = active_node;
              last_new_node = 0;
            }
            break; // Stop processing remainder
          }

          // Rule 2: Split Edge
          nodes_count++;
          int split = nodes_count;

          t_start[split] = t_start[child];
          t_len[split] = active_len;
          t_depth[split] = t_depth[active_node] + active_len;

          // Update parent to point to split
          t_next[active_node][edge_char] = split;

          nodes_count++;
          int leaf = nodes_count;

          t_start[leaf] = s_len - 1;
          t_len[leaf] = INF;

          // Update original child
          t_start[child] += active_len;
          if (t_len[child] < INF / 2)
            t_len[child] -= active_len;

          // Connect split
          t_next[split][charVal] = leaf;
          t_next[split][existing_char] = child;

          if (last_new_node != 0)
          {
            t_link[last_new_node] = split;
          }
          last_new_node = split;
        }

        rem--;
        if (active_node == 1 && active_len > 0)
        {
          active_len--;
          active_edge_char_idx = s_len - rem;
        }
        else if (active_node != 1)
        {
          active_node = t_link[active_node];
        }
      }

      // Update substring count
      // Count += (string length) - (depth of active node + active length)
      long long active_depth = (long long)t_depth[active_node] + active_len;
      total_substrings += (long long)s_len - active_depth;
    }
  }
}

int main()
{
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);
  solve();
  return 0;
}
