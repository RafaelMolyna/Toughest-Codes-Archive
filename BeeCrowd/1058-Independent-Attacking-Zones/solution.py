import sys

# Set higher recursion depth for deep problems, as this
# recursive solution can go many levels deep.
sys.setrecursionlimit(2000)

# Pre-calculated values (Catalan-like sequence)
# TRI_ARR[N] = answer for N triangles (N*3 points) with 0 or 1 Reds.
TRI_ARR = (
    1,  # 0 triangles (n=0)
    1,  # 1 triangle (n=3)
    3,  # 2 triangles (n=6)
    12,  # 3 triangles (n=9)
    55,  # 4 triangles (n=12)
    273,
    1428,
    7752,
    43263,
    246675,
    1430715,
    8414640,
    50067108,
    300830572,  # 13 triangles (n=39)
)

# Memoization cache (a dictionary).
# Key: A tuple of booleans (the state)
# Value: The computed result (an integer)
memo = {}


def count_reds(points):
    """Counts red platoons (True values) in a tuple."""
    return sum(1 for p in points if p)


def count_reds_effective(points):
    """
    Counts "effective" reds: platoons at an index i % 3 != 0.
    This is used for the "magic" optimization (see solve() function).
    """
    return sum(1 for i, p in enumerate(points) if p and i % 3 != 0)


def solve(points):
    """
    Main recursive function with memoization.
    'points' is expected to be a tuple (to be hashable and used as a dict key).
    This function is PURE; it does not mutate 'points'.
    """
    num_points = len(points)

    # Base Case 0: Empty array (an empty sub-problem)
    # has 1 solution (do nothing).
    if num_points == 0:
        return 1

    # --- MEMOIZATION CHECK ---
    # We must use a tuple as the key because lists are not hashable.
    # This check is O(1) on average.
    if points in memo:
        return memo[points]

    reds = count_reds(points)
    num_triag = num_points // 3

    # Base Case 1: 0 or 1 Red platoon.
    # The problem is trivial, solution is the pre-calculated value.
    if reds <= 1:
        memo[points] = TRI_ARR[num_triag]  # Store result
        return memo[points]

    # --- Logic: Rotate array to put the first Red at index 0 ---
    # We create a list copy to perform the rotation.
    rotated_points = list(points)
    try:
        first_red_index = rotated_points.index(True)
    except ValueError:
        # This should be impossible due to the 'reds <= 1' check,
        # but as a safeguard, we handle it.
        memo[points] = TRI_ARR[num_triag]
        return memo[points]

    if first_red_index > 0:
        # Perform the rotation (Python's slice version of the JS splice)
        rotated_points = (
            rotated_points[first_red_index:] + rotated_points[:first_red_index]
        )

    # Base Case 2: "Magic" mod 3 optimization.
    # If all Reds are at indices i % 3 == 0 (relative to the first Red),
    # then p1 (i % 3 == 1) and p2 (i % 3 == 2) will *always* be Black.
    # The problem becomes identical to the 0-Red case.
    if count_reds_effective(rotated_points) == 0:
        memo[points] = TRI_ARR[num_triag]  # Store result
        return memo[points]

    # Base Case 3: Pruning.
    # If we have more Reds than we can make triangles, it's impossible.
    if reds > num_triag:
        memo[points] = 0  # Store result
        return 0

    # --- Recursive Step ---
    # We fixed p0 (index 0) which is guaranteed to be RED here.
    # We now find all (p1, p2) pairs to form the first triangle.
    num_triag_count = 0

    # Loop for p1. We increment by 3 due to the (p1 - 1) % 3 == 0 constraint.
    for p1 in range(1, num_points, 3):
        # p0 is Red, so p1 MUST be Black.
        if rotated_points[p1]:
            continue

        # --- Sub-problem 1 (points 1 to p1-1) ---
        # We slice the *rotated* list and convert to a tuple for recursion.
        points_a1 = tuple(rotated_points[1:p1])
        # Pruning: If sub-problem 1 is impossible, skip this p1.
        if count_reds(points_a1) > len(points_a1) // 3:
            continue

        area1 = solve(points_a1)
        # Pruning: If sub-problem 1 has 0 solutions, skip this p1.
        if area1 == 0:
            continue

        # Loop for p2. We increment by 3 due to the (p2 - p1 - 1) % 3 == 0 constraint.
        for p2 in range(p1 + 1, num_points, 3):
            # p0 is Red, so p2 MUST be Black.
            if rotated_points[p2]:
                continue

            # --- Sub-problem 2 (points p1+1 to p2-1) ---
            points_a2 = tuple(rotated_points[p1 + 1 : p2])
            # Pruning: If sub-problem 2 is impossible, skip this p2.
            if count_reds(points_a2) > len(points_a2) // 3:
                continue

            # --- Sub-problem 3 (points p2+1 to N-1) ---
            points_a3 = tuple(rotated_points[p2 + 1 : num_points])
            # Pruning: If sub-problem 3 is impossible, skip this p2.
            if count_reds(points_a3) > len(points_a3) // 3:
                continue

            # Recurse on sub-problems 2 and 3
            area2 = solve(points_a2)
            # Pruning: If sub-problem 2 has 0 solutions, skip this p2.
            if area2 == 0:
                continue

            area3 = solve(points_a3)
            # (No need to check area3 for 0, as we just add it)

            # Total ways = product of sub-problems
            num_triag_count += area1 * area2 * area3

    # --- MEMOIZATION SAVE ---
    # Store the final computed result for this state (the original 'points' tuple).
    memo[points] = num_triag_count
    return num_triag_count


def main():
    """Main function to read input from stdin, process test cases, and print output."""
    lines = sys.stdin.read().splitlines()
    num_cases = int(lines[0])
    line_index = 1
    output = []

    for i in range(1, num_cases + 1):
        if line_index >= len(lines):
            break

        num_points = int(lines[line_index])
        line_index += 1

        if line_index >= len(lines):
            break

        points_str = lines[line_index]
        line_index += 1

        # Convert the string of 'R'/'B' to a tuple of booleans.
        # A tuple is used because it's immutable and hashable,
        # which is required for it to be a dictionary key.
        points_tuple = tuple(char == "R" for char in points_str)

        # CRITICAL: Clear the memoization cache for each new test case.
        # Otherwise, results from one case will pollute the next.
        memo.clear()

        solution = solve(points_tuple)
        output.append(f"Case {i}: {solution}")

    # Print all results at the end
    sys.stdout.write("\n".join(output) + "\n")


if __name__ == "__main__":
    main()
