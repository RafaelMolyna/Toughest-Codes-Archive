import sys

# Set higher recursion depth for deep problems
sys.setrecursionlimit(2000)

# Pre-calculated values (Catalan-like sequence)
TRI_ARR = (
    1,
    1,
    3,
    12,
    55,
    273,
    1428,
    7752,
    43263,
    246675,
    1430715,
    8414640,
    50067108,
    300830572,
)

# Memoization cache
memo = {}


def count_reds(points):
    """Counts red platoons (True values) in a tuple."""
    return sum(1 for p in points if p)


def count_reds_effective(points):
    """Counts 'bad' reds (not at i % 3 == 0)"""
    return sum(1 for i, p in enumerate(points) if p and i % 3 != 0)


def solve(points):
    """
    Main recursive function with memoization.
    'points' is expected to be a tuple.
    """
    num_points = len(points)

    # Base Case 0: Empty array
    if num_points == 0:
        return 1

    # --- MEMOIZATION CHECK ---
    # We must use a tuple as the key because lists are not hashable
    if points in memo:
        return memo[points]

    reds = count_reds(points)
    num_triag = num_points // 3

    # Base Case 1: 0 or 1 Red
    if reds <= 1:
        memo[points] = TRI_ARR[num_triag]
        return memo[points]

    # --- Create a list copy to perform the rotation ---
    rotated_points = list(points)
    try:
        first_red_index = rotated_points.index(True)
    except ValueError:
        # This case should be handled by 'reds <= 1', but as a safeguard
        memo[points] = TRI_ARR[num_triag]
        return memo[points]

    if first_red_index > 0:
        # Perform the rotation
        rotated_points = (
            rotated_points[first_red_index:] + rotated_points[:first_red_index]
        )

    # Base Case 2: "Magic" mod 3 tip
    if count_reds_effective(rotated_points) == 0:
        memo[points] = TRI_ARR[num_triag]
        return memo[points]

    # Base Case 3: Pruning
    if reds > num_triag:
        memo[points] = 0
        return 0

    # --- Recursive Step (Your exact logic) ---
    num_triag_count = 0
    # p0 is at index 0 (and it's Red)
    for p1 in range(1, num_points, 3):
        if rotated_points[p1]:  # p1 must be Black
            continue

        # Sub-problem 1 (points 1 to p1-1)
        points_a1 = tuple(rotated_points[1:p1])
        if count_reds(points_a1) > len(points_a1) // 3:
            continue

        area1 = solve(points_a1)
        if area1 == 0:
            continue

        for p2 in range(p1 + 1, num_points, 3):
            if rotated_points[p2]:  # p2 must be Black
                continue

            # Sub-problem 2 (points p1+1 to p2-1)
            points_a2 = tuple(rotated_points[p1 + 1 : p2])
            if count_reds(points_a2) > len(points_a2) // 3:
                continue

            # Sub-problem 3 (points p2+1 to N-1)
            points_a3 = tuple(rotated_points[p2 + 1 : num_points])
            if count_reds(points_a3) > len(points_a3) // 3:
                continue

            area2 = solve(points_a2)
            if area2 == 0:
                continue

            area3 = solve(points_a3)
            if area3 == 0:
                continue

            num_triag_count += area1 * area2 * area3

    # --- MEMOIZATION SAVE ---
    memo[points] = num_triag_count
    return num_triag_count


def main():
    """Main function to read input and print output."""
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

        # Convert to tuple of bools for hashing
        points_tuple = tuple(char == "R" for char in points_str)

        # Clear the memo for each new test case
        memo.clear()

        solution = solve(points_tuple)
        output.append(f"Case {i}: {solution}")

    sys.stdout.write("\n".join(output) + "\n")


if __name__ == "__main__":
    main()
