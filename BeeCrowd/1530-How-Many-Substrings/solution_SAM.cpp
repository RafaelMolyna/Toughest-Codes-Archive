/**
 * Problem: Beecrowd 1530 - How Many Substrings?
 * Method: Suffix Automaton (SAM)
 * Language: C++
 * runtime: 0.291s
 */

#include <iostream>
#include <vector>
#include <cstring>
#include <cstdio>

using namespace std;

// Increased buffer size to be safe
const int MAXN = 300005;
const int MAX_NODES = MAXN * 2;

struct SAM
{
  int len[MAX_NODES];
  int link[MAX_NODES];
  // Using 2D array for transitions.
  // -1 indicates no edge.
  int t_next[MAX_NODES][26];

  int sz;
  int last;
  long long total_substrings;

  void init()
  {
    // Initialize the root (node 0)
    len[0] = 0;
    link[0] = -1;
    // We must clear the root's transitions
    memset(t_next[0], -1, sizeof(t_next[0]));

    sz = 1;   // Next available node index
    last = 0; // Index of the node representing the entire string so far
    total_substrings = 0;
  }

  void extend(char c)
  {
    int char_idx = c - 'a';

    // Safety check: prevent out of bounds
    if (sz >= MAX_NODES - 2)
      return;

    int cur = sz++;

    // CRITICAL FIX: Clear the transitions for the new node 'cur'.
    // It might contain garbage from the previous test case.
    len[cur] = len[last] + 1;
    memset(t_next[cur], -1, sizeof(t_next[cur]));

    int p = last;
    while (p != -1 && t_next[p][char_idx] == -1)
    {
      t_next[p][char_idx] = cur;
      p = link[p];
    }

    if (p == -1)
    {
      link[cur] = 0;
    }
    else
    {
      int q = t_next[p][char_idx];
      if (len[p] + 1 == len[q])
      {
        link[cur] = q;
      }
      else
      {
        int clone = sz++;
        len[clone] = len[p] + 1;
        link[clone] = link[q];

        // Copy transitions from q to clone
        // No need to memset clone, because memcpy overwrites everything
        memcpy(t_next[clone], t_next[q], sizeof(t_next[q]));

        while (p != -1 && t_next[p][char_idx] == q)
        {
          t_next[p][char_idx] = clone;
          p = link[p];
        }
        link[q] = clone;
        link[cur] = clone;
      }
    }

    last = cur;
    // Count new distinct substrings
    total_substrings += (long long)(len[cur] - len[link[cur]]);
  }
} sam;

int main()
{
  // Robust Input Parsing
  char c;
  bool line_started = false;

  sam.init();

  while ((c = getchar()) != EOF)
  {
    if (c == '\n' || c == '\r')
    {
      // Newline or Carriage Return detected
      if (line_started)
      {
        sam.init(); // Reset for the next string
        line_started = false;
      }
    }
    else if (c == '?')
    {
      printf("%lld\n", sam.total_substrings);
      line_started = true;
    }
    else if (c >= 'a' && c <= 'z')
    {
      sam.extend(c);
      line_started = true;
    }
    // Ignore other characters
  }
  return 0;
}
