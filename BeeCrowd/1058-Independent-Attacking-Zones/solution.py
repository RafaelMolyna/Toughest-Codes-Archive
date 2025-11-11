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


def is_all_reds_in_mod_3(points):
    """Checks if all Reds are at indices i % 3 == 0."""
    for i, p in enumerate(points):
        if p and i % 3 != 0:
            return False
    return True


def save_all_rotations(key_tuple, num_points, result):
    """
    Pre-caches the answer for all N rotations of the
    original key.
    """
    memo[key_tuple] = result
    for i in range(1, num_points):
        # Python's fast tuple slicing for rotation
        rotated_key = key_tuple[i:] + key_tuple[:i]
        memo[rotated_key] = result


def solve(points_tuple, num_points, reds_count):
    """
    Main recursive function.
    'points_tuple' is the *original* (un-rotated) problem.
    """

    # Base Case 0: Empty array
    if num_points == 0:
        return 1

    # --- MEMOIZATION CHECK (Original Key) ---
    if points_tuple in memo:
        return memo[points_tuple]

    # --- FIX 1: Define num_triag at the top ---
    num_triag = num_points // 3

    # --- Base Case 1: Pruning ---
    # --- FIX 2: Use consistent lowercase 'num_triag' ---
    if reds_count > num_triag:
        save_all_rotations(points_tuple, num_points, 0)
        return 0

    # --- Base Case 2: 0 or 1 Red ---
    if reds_count <= 1:
        # 'num_triag' is now guaranteed to be defined
        result = TRI_ARR[num_triag]
        save_all_rotations(points_tuple, num_points, result)
        return result

    # --- Logic: Rotate to Canonical Form ---
    # We find the first red and create a *new* canonical tuple.
    try:
        first_red_index = points_tuple.index(1)
        canonical_points = (
            points_tuple[first_red_index:] + points_tuple[:first_red_index]
        )
    except ValueError:
        # This should be impossible (handled by reds_count <= 1)
        # but just in case, return the 0-red answer.
        return TRI_ARR[num_triag]

    # --- Base Case 3: "Magic" mod 3 optimization ---
    # This check *must* happen *after* the rotation.
    if is_all_reds_in_mod_3(canonical_points):
        # 'num_triag' is defined
        result = TRI_ARR[num_triag]
        save_all_rotations(points_tuple, num_points, result)
        return result

    # --- Recursive Step ---
    # We fixed p0 (index 0) which is guaranteed to be RED here.
    num_triag_count = 0

    # We iterate using the `canonical_points`
    for p1 in range(1, num_points, 3):
        # p0 is Red, so p1 MUST be Black.
        if canonical_points[p1]:
            continue

        points_a1 = canonical_points[1:p1]
        n1 = len(points_a1)
        r1 = sum(points_a1)
        if r1 > n1 // 3:
            continue

        area1 = solve(points_a1, n1, r1)
        if area1 == 0:
            continue

        for p2 in range(p1 + 1, num_points, 3):
            # p0 is Red, so p2 MUST be Black.
            if canonical_points[p2]:
                continue

            points_a2 = canonical_points[p1 + 1 : p2]
            n2 = len(points_a2)
            r2 = sum(points_a2)
            if r2 > n2 // 3:
                continue

            points_a3 = canonical_points[p2 + 1 : num_points]
            n3 = len(points_a3)
            r3 = sum(points_a3)
            if r3 > n3 // 3:
                continue

            area2 = solve(points_a2, n2, r2)
            if area2 == 0:
                continue

            area3 = solve(points_a3, n3, r3)

            num_triag_count += area1 * area2 * area3

    # --- MEMOIZATION SAVE ---
    # Save the result for the original key and all its rotations
    save_all_rotations(points_tuple, num_points, num_triag_count)
    return num_triag_count


def main():
    """Main function to read input, process cases, and print output."""
    lines = sys.stdin.read().splitlines()
    num_cases = int(lines[0])
    line_index = 1
    output = []

    for i in range(1, num_cases + 1):
        if line_index >= len(lines):
            break

        num_points_str = lines[line_index]
        if not num_points_str:
            break
        num_points = int(num_points_str)
        line_index += 1

        if line_index >= len(lines):
            break
        points_str = lines[line_index]
        line_index += 1

        # Use 1 for 'R' and 0 for 'B'
        points_list = [1 if char == "R" else 0 for char in points_str]
        reds_count = sum(points_list)

        # This is the hashable key for our memo.
        points_tuple = tuple(points_list)

        memo.clear()

        solution = solve(points_tuple, num_points, reds_count)
        output.append(f"Case {i}: {solution}")

    sys.stdout.write("\n".join(output) + "\n")


if __name__ == "__main__":
    main()
