/**
 * Problem: 1231 - Words
 * Language: C++17 (Optimized)
 * Approach: Static Trie Arrays + DFS with 2D Visited Array
 */

#include <iostream>
#include <vector>
#include <string>
#include <cstring>

using namespace std;

// Structure to represent a Trie Node
struct Node
{
    int children[2]; // Indices of children nodes. -1 if null.
    bool isEnd;      // True if this node marks the end of a word.

    Node()
    {
        children[0] = -1;
        children[1] = -1;
        isEnd = false;
    }
};

// We use two vectors to act as our memory pools for the two Tries.
// This avoids the overhead of 'new' and pointer chasing.
vector<Node> trie1;
vector<Node> trie2;

// Visited array for Memoization.
// Max nodes calculation: 20 words * 40 chars = 800 nodes max.
// We use 1000 to be safe.
bool visited[1000][1000];

// Helper to insert words into our vector-based Trie
void insert(vector<Node> &trie, const string &s)
{
    int curr = 0; // Start at root (index 0)
    for (char c : s)
    {
        int bit = c - '0';
        if (trie[curr].children[bit] == -1)
        {
            // Create new node
            Node newNode;
            trie.push_back(newNode);
            trie[curr].children[bit] = trie.size() - 1; // Link to new index
        }
        curr = trie[curr].children[bit];
    }
    trie[curr].isEnd = true;
}

// DFS Function
// u: current index in trie1
// v: current index in trie2
bool dfs(int u, int v)
{
    // 1. Check for Cycle / Already Visited State
    if (visited[u][v])
        return false;
    visited[u][v] = true;

    // 2. Check for Successful Match
    // If both nodes mark the end of a word, we have found a valid common sequence.
    if (trie1[u].isEnd && trie2[v].isEnd)
        return true;

    // 3. Try transitions for '0' and '1'
    for (int k = 0; k < 2; k++)
    {
        int nextU = trie1[u].children[k];
        int nextV = trie2[v].children[k];

        // If both tries have a transition for this bit k
        if (nextU != -1 && nextV != -1)
        {
            if (dfs(nextU, nextV))
                return true;
        }
    }

    // 4. Epsilon Transitions (Restart Logic)
    // If trie1 ends a word here, we can conceptually jump 'u' back to root (0)
    // while keeping 'v' at the same place.
    if (trie1[u].isEnd)
    {
        if (dfs(0, v))
            return true;
    }

    // If trie2 ends a word here, jump 'v' back to root (0).
    if (trie2[v].isEnd)
    {
        if (dfs(u, 0))
            return true;
    }

    return false;
}

int main()
{
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n1, n2;
    while (cin >> n1 >> n2)
    {
        // Clear previous test case data
        trie1.clear();
        trie2.clear();

        // Initialize roots
        trie1.push_back(Node());
        trie2.push_back(Node());

        string s;
        for (int i = 0; i < n1; i++)
        {
            cin >> s;
            insert(trie1, s);
        }
        for (int i = 0; i < n2; i++)
        {
            cin >> s;
            insert(trie2, s);
        }

        // Reset visited array
        // We only need to clear the area we might use.
        // memset is very fast.
        // Size to clear: trie1.size() rows * 1000 cols.
        for (int i = 0; i < trie1.size(); ++i)
        {
            memset(visited[i], 0, trie2.size() * sizeof(bool));
        }

        if (dfs(0, 0))
        {
            cout << "S" << "\n";
        }
        else
        {
            cout << "N" << "\n";
        }
    }

    return 0;
}
