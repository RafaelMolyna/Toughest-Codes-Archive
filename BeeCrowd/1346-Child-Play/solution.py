"""
Beecrowd 1346 - Child Play
Language: Python 3
Technique: DFS with Pruning
"""
import sys

# Increase recursion depth for N=400
sys.setrecursionlimit(5000)

class Card:
    def __init__(self, x, y, original_idx):
        self.v_small = min(x, y)
        self.v_large = max(x, y)
        self.v_diff = self.v_large - self.v_small
        self.v_sum = self.v_large + self.v_small
        self.original_idx = original_idx

def can_solve(idx, target, ignore_idx, cards, suffix_sums, memo):
    """
    Recursive solver with Pruning.
    """
    if idx < 0:
        return target == 0

    if idx == ignore_idx:
        return can_solve(idx - 1, target, ignore_idx, cards, suffix_sums, memo)

    # Pruning: Branch and Bound
    if abs(target) > suffix_sums[idx]:
        return False

    state = (idx, target)
    if state in memo:
        return False

    diff = cards[idx].v_diff
    
    # Try subtracting
    if can_solve(idx - 1, target - diff, ignore_idx, cards, suffix_sums, memo):
        return True
        
    # Try adding
    if can_solve(idx - 1, target + diff, ignore_idx, cards, suffix_sums, memo):
        return True

    memo.add(state)
    return False

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    iterator = iter(input_data)
    output = []

    try:
        while True:
            try:
                N = int(next(iterator))
            except StopIteration:
                break
                
            if N == 0:
                break

            cards = []
            total_sum_all = 0
            
            for i in range(N):
                u = int(next(iterator))
                v = int(next(iterator))
                c = Card(u, v, i)
                cards.append(c)
                total_sum_all += c.v_sum

            # Sort by difference ascending (Heuristic)
            cards.sort(key=lambda c: c.v_diff)

            # Precompute Suffix Sums
            suffix_sums = [0] * N
            run_diff = 0
            for i in range(N):
                run_diff += cards[i].v_diff
                suffix_sums[i] = run_diff

            found = False

            # 1. Try with all cards
            if total_sum_all % 2 == 0:
                if can_solve(N - 1, 0, -1, cards, suffix_sums, set()):
                    output.append(f"{total_sum_all // 2} discard none")
                    found = True

            # 2. Try discarding one card
            if not found:
                # Create candidates list: (Card Object, Index in Sorted Array)
                candidates = []
                for i, c in enumerate(cards):
                    candidates.append((c, i))
                
                # Sort: Min Sum, then Min Small Value
                candidates.sort(key=lambda x: (x[0].v_sum, x[0].v_small))

                for c, idx_in_vec in candidates:
                    remaining_sum = total_sum_all - c.v_sum
                    
                    if remaining_sum % 2 != 0:
                        continue
                        
                    if can_solve(N - 1, 0, idx_in_vec, cards, suffix_sums, set()):
                        output.append(f"{remaining_sum // 2} discard {c.v_small} {c.v_large}")
                        found = True
                        break

            if not found:
                output.append("impossible")

    except StopIteration:
        pass

    print('\n'.join(output))

if __name__ == "__main__":
    solve()
