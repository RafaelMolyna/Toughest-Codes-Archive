import sys
import math
from collections import deque

from typing import Tuple

# --- Constants for "Point" list indices ---
# Replaces the Point class
LINK_ARR = 0  # Index for the list of links
DEG = 1  # Index for the degree (integer)
DISTANCE = 2  # Index for shortest path distance
VISITED = 3  # Index for DFS visited (boolean)

# --- Constants for "Link" list indices ---
# Replaces the LinkObj class
NAME = 0  # Index for the link's destination name (e.g., "C2")
DIST = 1  # Index for the link's distance (float)
# ------------------------------------------

# CHAR_TO_ROW = {
RAW_POINT_INFO: dict[str, Tuple[int, int, int]] = {
    "A1": [0, 0, 0],  # x, y, nº
    "A2": [0, 1, 1],
    "A3": [0, 2, 2],
    "A4": [0, 3, 3],
    "A5": [0, 4, 4],
    "B1": [1, 0, 5],
    "B2": [1, 1, 6],
    "B3": [1, 2, 7],
    "B4": [1, 3, 8],
    "B5": [1, 4, 9],
    "C1": [2, 0, 10],
    "C2": [2, 1, 11],
    "C3": [2, 2, 12],
    "C4": [2, 3, 13],
    "C5": [2, 4, 14],
    "D1": [3, 0, 15],
    "D2": [3, 1, 16],
    "D3": [3, 2, 17],
    "D4": [3, 3, 18],
    "D5": [3, 4, 19],
    "E1": [4, 0, 20],
    "E2": [4, 1, 21],
    "E3": [4, 2, 22],
    "E4": [4, 3, 23],
    "E5": [4, 4, 24],
}

POINT_COORDINATES = [
    [0, 0],  # x, y, nº
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
]
# ROW_TO_CHAR = ["A", "B", "C", "D", "E"]

POINT_NUMBER_MATRIX = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
]

Point = Tuple[int, int]
Link = Tuple[int, int]
AdjLink = Tuple[list[Point], int, float, bool]
# adj_list = {"points": [],"arr": [], "num_p": 0, "length": 0.0}
graph_adj_list: list[AdjLink | None] = [None] * 25
graph_points_list = []
graph_num_points = 0
graph_length = 0.0

# def a1_to_point(s):
#     """Converts 'A1' string to [0, 0] coordinates."""
#     return CHAR_TO_ROW[s[0]], int(s[1]) - 1


def link_point(p1_n: int, p2_n: int, dist: float):
    """
    Links p1 to p2. Creates p1 in the adj_list if it doesn't exist.
    This is the Python equivalent of the JS function.
    """
    if p1_n in graph_points_list:
        # Point already exists, just add the link and increment degree
        graph_adj_list[p1_n][LINK_ARR].append([p2_n, dist])
        graph_adj_list[p1_n][DEG] += 1
    else:
        # Point is new. Create its data list.
        graph_adj_list[p1_n] = [
            [
                # List of links:
                [p2_n, dist],
            ],
            1,  # degree
            float("inf"),  # distance
            False,  # is visited
        ]
        # Add to our list of keys for iteration
        graph_points_list.append(p1_n)
        graph_num_points += 1


def link_segment_on_adj_list(p1_n: int, p2_n: int, dist):
    """Creates a bidirectional link and adds to the total length."""
    link_point(p1_n, p2_n, dist)
    link_point(p2_n, p1_n, dist)
    graph_length += dist


def build_adjacency_list(arr_segments: list[Tuple[str, str]], num_segments: int):
    """
    Builds the graph from the list of segments, following the JS logic
    for breaking down lines into unit paths.
    """

    # adj_list = {"points": [],"arr": [], "num_p": 0, "length": 0.0}

    # graph_adj_list = [NULL] * 25
    # graph_points_list = []
    # graph_num_points = 0
    # graph_length = 0.0

    for p1_str, p2_str in arr_segments:
        x1, y1, p1_n = RAW_POINT_INFO[p1_str]
        x2, y2, p2_n = RAW_POINT_INFO[p2_str]

        dx, dy = x2 - x1, y2 - y1
        abs_dx, abs_dy = abs(dx), abs(dy)

        if abs_dx == abs_dy or abs_dx == 0 or abs_dy == 0:
            # Straight or 45-degree line
            dir_x = (dx > 0) - (dx < 0)  # Python's way to get Math.sign
            dir_y = (dy > 0) - (dy < 0)
            dist = math.sqrt(2) if abs_dx == abs_dy else 1
            while x1 != x2 or y1 != y2:
                p1_n = POINT_NUMBER_MATRIX[x1, y1]
                x1 += dir_x
                y1 += dir_y
                p2_n = POINT_NUMBER_MATRIX[x1, y1]
                link_segment_on_adj_list(p1_n, p2_n, dist)
        elif (abs_dx == 2 and abs_dy == 4) or (abs_dy == 2 and abs_dx == 4):
            # "Knight's move" with a middle point
            p_middle = POINT_NUMBER_MATRIX[(x1 + x2) // 2, (y1 + y2) // 2]
            dist = math.sqrt(5)
            link_segment_on_adj_list(p1_n, p_middle, dist)
            link_segment_on_adj_list(p2_n, p_middle, dist)
        else:
            # Other direct lines
            link_segment_on_adj_list(p1_n, p2_n, math.sqrt(dx**2 + dy**2))


def find_link(adj_list, p_str, p_str_to_find):
    """Finds the specific link [name, dist] in p_str's link list."""
    p = adj_list.get(p_str)  # .get is safer, returns None if p_str missing
    if not p:
        return None
    for link in p[LINK_ARR]:
        if link[NAME] == p_str_to_find:
            return link
    return None


def replace_link(adj_list, name, name_find, new_name, new_dist):
    """Finds a link and updates its destination and distance."""
    link = find_link(adj_list, name, name_find)
    if link:
        link[NAME] = new_name
        link[DIST] = new_dist


def find_loop_link_and_delete(adj_list, p_str, p_str_to_del):
    """Removes all links from p_str that point to p_str_to_del."""
    p = adj_list[p_str]
    # List comprehension is a fast, Pythonic way to do this
    original_deg = p[DEG]
    p[LINK_ARR] = [link for link in p[LINK_ARR] if link[NAME] != p_str_to_del]
    p[DEG] = len(p[LINK_ARR])


def remove_path_points():
    """
    Iterates all points and "dissolves" any that are just pass-throughs
    (degree == 2), connecting their neighbors directly.
    """
    i = 0
    # We use a while loop because we are modifying the list we iterate over
    while i < graph_num_points:
        p_n = graph_points_list[i]
        point = graph_adj_list[p_n]

        if point[DEG] == 2:
            p1_link = point[LINK_ARR][0]
            p2_link = point[LINK_ARR][1]

            if p1_link[NAME] != p2_link[NAME]:
                # Not a self-loop, connect the neighbors
                total_dist = p1_link[DIST] + p2_link[DIST]
                replace_link(p1_link[NAME], p_n, p2_link[NAME], total_dist)
                replace_link(p2_link[NAME], p_n, p1_link[NAME], total_dist)
            else:
                # It's a loop on a neighbor, just delete the links
                find_loop_link_and_delete(p1_link[NAME], p_n)

            # Remove the point from the graph
            del graph_adj_list[p_n]
            graph_num_points -= 1
            graph_points_list.pop(i)
        else:
            # This point is fine, move to the next
            i += 1


def shortest_path(adj_list, p_str_start):
    """
    Finds shortest path from start to all other nodes using BFS (SPFA).
    Uses collections.deque for an efficient O(1) queue.
    """
    queue = deque([p_str_start])
    adj_list[p_str_start][DISTANCE] = 0

    while queue:
        p_str = queue.popleft()  # O(1) operation
        p = adj_list[p_str]
        p_dist = p[DISTANCE]

        for link in p[LINK_ARR]:
            next_p_str, jump_dist = link
            next_p = adj_list[next_p_str]
            new_dist = p_dist + jump_dist

            if next_p[DISTANCE] > new_dist:
                next_p[DISTANCE] = new_dist
                if next_p[DEG] > 1:  # Only explore from junctions
                    queue.append(next_p_str)


def dfs_connected(adj_list, p_str):
    """Standard DFS to count connected nodes."""
    p = adj_list[p_str]
    p[VISITED] = True
    n_points = 1
    for link in p[LINK_ARR]:
        p_next = adj_list[link[NAME]]
        if not p_next[VISITED]:
            n_points += dfs_connected(adj_list, link[NAME])
    return n_points


def clear_data(adj_list):
    """Resets distances for the next shortestPath run."""
    for p_str in adj_list["arr"]:
        adj_list[p_str][DISTANCE] = float("inf")


def create_matrix_odd_points(adj_list, odd_array):
    """Builds the all-pairs shortest-paths matrix for odd-degree nodes."""
    odd_matrix_conj = {}
    num_odd_points = len(odd_array)

    for i in range(num_odd_points):
        p_str_on = odd_array[i]
        shortest_path(adj_list, p_str_on)  # Run BFS from this odd node
        odd_matrix_conj[p_str_on] = {}
        for j in range(i + 1, num_odd_points):
            p_str_in = odd_array[j]
            dist = adj_list[p_str_in][DISTANCE]
            odd_matrix_conj[p_str_on][p_str_in] = dist
            # Add symmetrical entry for easier lookup in minimum_path
            if p_str_in not in odd_matrix_conj:
                odd_matrix_conj[p_str_in] = {}
            odd_matrix_conj[p_str_in][p_str_on] = dist
        clear_data(adj_list)
    return odd_matrix_conj


def minimum_path(
    odd_matrix_conj, odd_array, num_odd_points, sum_val=0, longest=0, min_val=None
):
    """
    Recursive backtracking to find the minimum-weight perfect matching,
    implementing the "subtract longest segment" optimization.
    """
    if num_odd_points == 2:
        p1, p2 = odd_array
        seg = odd_matrix_conj[p1][p2]

        sum_val += seg
        if seg > longest:
            longest = seg
        # Python's equivalent of min = undefined
        if min_val is None or sum_val - longest < min_val:
            min_val = sum_val - longest
        return min_val

    p1 = odd_array[0]
    new_array1 = odd_array[1:]  # Slicing creates a new list

    for i in range(num_odd_points - 1):
        p2 = new_array1[i]
        # Create the next array for recursion
        new_array2 = new_array1[:i] + new_array1[i + 1 :]
        seg = odd_matrix_conj[p1][p2]

        min_val = minimum_path(
            odd_matrix_conj,
            new_array2,
            num_odd_points - 2,
            sum_val + seg,
            max(longest, seg),
            min_val,
        )
    return min_val


def main():
    """Main function to read input, run logic, and print output."""
    # Read all input at once and reverse it (like JS .reverse())
    lines = sys.stdin.read().splitlines()[::-1]

    # Handle potential empty line at the end
    if not lines[0]:
        lines.pop(0)

    n = int(lines.pop())
    output = []  # Build output in a list for fast printing at the end

    for i in range(1, n + 1):
        num_segments_line = lines.pop()
        # Skip empty lines between test cases
        while not num_segments_line and lines:
            num_segments_line = lines.pop()

        num_segments = int(num_segments_line)

        arr_segments = []
        for _ in range(num_segments):
            line = lines.pop()
            while not line and lines:  # Skip empty lines
                line = lines.pop()
            line = line.replace(" ", "")
            arr_segments.append((line[:2], line[2:]))

        adj_list = build_adjacency_list(arr_segments, num_segments)

        # Handle case where segments create no nodes (e.g., A1 A1)
        if not adj_list["arr"]:
            output.append(f"Case {i}: 0.00")
            continue

        if dfs_connected(adj_list, adj_list["arr"][0]) != adj_list["num_p"]:
            output.append(f"Case {i}: ~x(")
            continue

        clear_data(adj_list)
        remove_path_points(adj_list)

        # Use a list comprehension to find odd-degree nodes
        odd_array = [
            p_str for p_str in adj_list["arr"] if adj_list[p_str][DEG] % 2 == 1
        ]
        num_odd = len(odd_array)

        if num_odd <= 2:
            # Eulerian path/circuit exists
            output.append(f"Case {i}: {adj_list['length']:.2f}")
        else:
            # Chinese Postman problem
            odd_matrix_conj = create_matrix_odd_points(adj_list, odd_array)
            graph_length = adj_list["length"]
            min_sum = minimum_path(odd_matrix_conj, odd_array, num_odd)
            result = graph_length + min_sum
            output.append(f"Case {i}: {result:.2f}")

        # Reset graph state:
        graph_adj_list = [None] * 25
        graph_points_list = []
        graph_num_points = 0
        graph_length = 0.0

    # Print all output at once
    sys.stdout.write("\n".join(output) + "\n")


if __name__ == "__main__":
    main()
