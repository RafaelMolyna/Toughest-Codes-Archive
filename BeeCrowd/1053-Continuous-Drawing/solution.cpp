#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <cmath>
#include <map>
#include <iomanip>
#include <limits>
#include <algorithm>

using namespace std;

// Graph: 25 nodes (0-24)
const int NUM_NODES = 25;
// An edge is a pair<neighbor_id, distance>
using Edge = pair<int, double>;
// Adjacency list
vector<vector<Edge>> adj(NUM_NODES);
vector<int> deg(NUM_NODES, 0);
double total_length = 0;

// All-pairs shortest paths for odd nodes
double odd_matrix[NUM_NODES][NUM_NODES];
vector<int> odd_nodes;

// --- Helper Functions ---

// Maps "A1" -> 0, "A2" -> 1, ..., "E5" -> 24
inline int a1_to_id(const string &s)
{
  return (s[0] - 'A') * 5 + (s[1] - '1');
}

void link_point(int u, int v, double dist)
{
  adj[u].emplace_back(v, dist);
  deg[u]++;
}

void link_segment(int u, int v, double dist)
{
  link_point(u, v, dist);
  link_point(v, u, dist);
  total_length += dist;
}

// --- Graph Algorithms ---

void shortest_path(int start_node, vector<double> &dist)
{
  fill(dist.begin(), dist.end(), numeric_limits<double>::infinity());
  dist[start_node] = 0;
  queue<int> q;
  q.push(start_node);

  while (!q.empty())
  {
    int u = q.front();
    q.pop();

    for (const auto &edge : adj[u])
    {
      int v = edge.first;
      double weight = edge.second;
      if (dist[v] > dist[u] + weight)
      {
        dist[v] = dist[u] + weight;
        // Only re-queue if it's a junction (or path)
        if (deg[v] > 1 || deg[v] == 0)
        { // deg[v]==0 for removed path points
          q.push(v);
        }
      }
    }
  }
}

int dfs_connected(int u, vector<bool> &visited)
{
  visited[u] = true;
  int count = 1;
  for (const auto &edge : adj[u])
  {
    int v = edge.first;
    if (!visited[v])
    {
      count += dfs_connected(v, visited);
    }
  }
  return count;
}

// Replaces link 'target' with 'replacement' in u's adj list
void replace_link(int u, int target, int replacement, double new_dist)
{
  for (auto &edge : adj[u])
  {
    if (edge.first == target)
    {
      edge.first = replacement;
      edge.second = new_dist;
      return;
    }
  }
}

// Deletes links to 'target' from u's adj list
void delete_loop_link(int u, int target)
{
  auto it = adj[u].begin();
  while (it != adj[u].end())
  {
    if (it->first == target)
    {
      it = adj[u].erase(it);
      deg[u]--;
    }
    else
    {
      ++it;
    }
  }
}

void remove_path_points()
{
  for (int u = 0; u < NUM_NODES; ++u)
  {
    if (deg[u] == 2)
    {
      int v1 = adj[u][0].first;
      double d1 = adj[u][0].second;
      int v2 = adj[u][1].first;
      double d2 = adj[u][1].second;

      if (v1 != v2)
      {
        double total_dist = d1 + d2;
        replace_link(v1, u, v2, total_dist);
        replace_link(v2, u, v1, total_dist);
      }
      else
      {
        delete_loop_link(v1, u);
      }
      adj[u].clear();
      deg[u] = 0; // Mark as removed
    }
  }
}

// --- Core Matching Logic ---

double find_min_matching(int mask, double current_sum, double longest_seg)
{
  if (mask == 0)
  {
    return current_sum - longest_seg;
  }

  double min_total = numeric_limits<double>::infinity();

  // Find the first available node
  int p1_idx = -1;
  for (int i = 0; i < odd_nodes.size(); ++i)
  {
    if (mask & (1 << i))
    {
      p1_idx = i;
      break;
    }
  }

  int p1_id = odd_nodes[p1_idx];
  int mask_without_p1 = mask ^ (1 << p1_idx);

  // Pair it with every other available node
  for (int p2_idx = p1_idx + 1; p2_idx < odd_nodes.size(); ++p2_idx)
  {
    if (mask_without_p1 & (1 << p2_idx))
    {
      int p2_id = odd_nodes[p2_idx];
      int next_mask = mask_without_p1 ^ (1 << p2_idx);
      double seg_dist = odd_matrix[p1_id][p2_id];

      min_total = min(min_total,
                      find_min_matching(next_mask, current_sum + seg_dist, max(longest_seg, seg_dist)));
    }
  }
  return min_total;
}

// --- Main Solve Function ---

void solve_case(int case_num)
{
  int n;
  cin >> n;

  // Reset global state
  for (int i = 0; i < NUM_NODES; ++i)
  {
    adj[i].clear();
    deg[i] = 0;
  }
  total_length = 0;
  odd_nodes.clear();

  if (n == 0)
  {
    cout << "Case " << case_num << ": 0.00\n";
    return;
  }

  int start_node = -1;
  int num_graph_nodes = 0;

  for (int i = 0; i < n; ++i)
  {
    string s1, s2;
    cin >> s1 >> s2;
    int id1 = a1_to_id(s1);
    int id2 = a1_to_id(s2);

    if (start_node == -1)
      start_node = id1;

    int r1 = id1 / 5, c1 = id1 % 5;
    int r2 = id2 / 5, c2 = id2 % 5;
    int dr = r2 - r1, dc = c2 - c1;
    int abs_dr = abs(dr), abs_dc = abs(dc);

    if (abs_dr == abs_dc || abs_dr == 0 || abs_dc == 0)
    {
      int dir_r = (dr == 0) ? 0 : (dr > 0 ? 1 : -1);
      int dir_c = (dc == 0) ? 0 : (dc > 0 ? 1 : -1);
      double dist = (abs_dr == abs_dc) ? sqrt(2.0) : 1.0;
      while (r1 != r2 || c1 != c2)
      {
        int u = r1 * 5 + c1;
        r1 += dir_r;
        c1 += dir_c;
        int v = r1 * 5 + c1;
        link_segment(u, v, dist);
      }
    }
    else if ((abs_dr == 2 && abs_dc == 4) || (abs_dr == 4 && abs_dc == 2))
    {
      int mid_id = ((r1 + r2) / 2) * 5 + ((c1 + c2) / 2);
      double dist = sqrt(5.0);
      link_segment(id1, mid_id, dist);
      link_segment(id2, mid_id, dist);
    }
    else
    {
      link_segment(id1, id2, sqrt(pow(dr, 2) + pow(dc, 2)));
    }
  }

  // Count unique nodes in graph
  for (int i = 0; i < NUM_NODES; ++i)
  {
    if (deg[i] > 0)
      num_graph_nodes++;
  }

  // Connectivity check
  vector<bool> visited(NUM_NODES, false);
  if (num_graph_nodes > 0 && dfs_connected(start_node, visited) != num_graph_nodes)
  {
    cout << "Case " << case_num << ": ~x(\n";
    return;
  }

  // Simplify graph
  remove_path_points();

  // Find odd-degree nodes
  for (int i = 0; i < NUM_NODES; ++i)
  {
    if (deg[i] % 2 == 1)
    {
      odd_nodes.push_back(i);
    }
  }

  int num_odd = odd_nodes.size();
  cout << "Case " << case_num << ": " << fixed << setprecision(2);

  if (num_odd == 0 || num_odd == 2)
  {
    cout << total_length << "\n";
  }
  else
  {
    // Build all-pairs shortest paths for odd nodes
    vector<double> dist(NUM_NODES);
    for (int i = 0; i < num_odd; ++i)
    {
      int u = odd_nodes[i];
      shortest_path(u, dist);
      for (int j = i + 1; j < num_odd; ++j)
      {
        int v = odd_nodes[j];
        odd_matrix[u][v] = odd_matrix[v][u] = dist[v];
      }
    }

    // Initial mask with all odd nodes set
    int initial_mask = (1 << num_odd) - 1;
    double min_sum = find_min_matching(initial_mask, 0.0, 0.0);
    cout << total_length + min_sum << "\n";
  }
}

int main()
{
  // Fast I/O
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);

  int t;
  cin >> t;
  for (int i = 1; i <= t; ++i)
  {
    solve_case(i);
  }
  return 0;
}
