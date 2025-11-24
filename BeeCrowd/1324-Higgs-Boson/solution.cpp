#include <iostream>
#include <vector>
#include <numeric> // For std::gcd in C++17, but we'll write a custom one for safety
#include <cmath>   // For std::abs

using namespace std;

// Use a pair for fractions: {numerator, denominator}
// { -1, -1 } will represent NULL (no collision found)
typedef pair<long long, long long> Fraction;

// Standard GCD function
long long gcd(long long a, long long b)
{
  a = std::abs(a);
  b = std::abs(b);
  while (b)
  {
    a %= b;
    swap(a, b);
  }
  return a;
}

// Check if a fraction represents a valid collision
bool isValid(const Fraction &t)
{
  return t.second > 0 && t.first >= 0;
  // We treat {-1, -1} or denominator 0 as invalid
}

// Compare two time fractions. Returns the "smaller valid" one.
Fraction compareAndReturn(Fraction t1, Fraction t2)
{
  if (!isValid(t1))
    return isValid(t2) ? t2 : Fraction{0, 0}; // 0 0 is default "No Collision" for output
  if (!isValid(t2))
    return t1;

  // Cross-multiply to compare: n1/d1 < n2/d2  <=>  n1*d2 < n2*d1
  // Using __int128_t would be overkill for 10^4 inputs, but long long is mandatory.
  long long val1 = t1.first * t2.second;
  long long val2 = t2.first * t1.second;

  return (val1 < val2) ? t1 : t2;
}

// Forward declarations
Fraction findCollisionOverlapping(long long a, long long b, long long c1, long long d1, long long c2, long long d2);
Fraction findCollisionNotParallel(long long a1, long long b1, long long c1, long long d1, long long a2, long long b2, long long c2, long long d2);

Fraction solveCase(long long a1, long long b1, long long c1, long long d1,
                   long long a2, long long b2, long long c2, long long d2)
{
  // === SCENARIO 1: PARALLEL RADIUS ===
  if (a1 == a2)
  {
    // Different intercepts = Parallel lines that never touch
    if (b1 != b2)
      return {-1, -1};
    // Identical lines
    return findCollisionOverlapping(a1, b1, c1, d1, c2, d2);
  }

  // === SCENARIO 2: INTERSECTING RADIUS ===
  return findCollisionNotParallel(a1, b1, c1, d1, a2, b2, c2, d2);
}

Fraction findCollisionOverlapping(long long a, long long b, long long c1, long long d1, long long c2, long long d2)
{
  Fraction t_zero = {-1, -1};

  // 1. Check Radius Zero crossing (r = at + b = 0)
  if (a != 0)
  {
    long long num = -b;
    long long den = a;
    // Check if t >= 0
    if ((num >= 0 && den > 0) || (num <= 0 && den < 0))
    {
      long long common = gcd(num, den);
      t_zero = {std::abs(num) / common, std::abs(den) / common};
    }
  }
  else if (b == 0)
  {
    // Radius always 0
    return {0, 1};
  }

  // 2. Check Angle Alignment
  // Normalize angles to positive [0, 360)
  d1 = ((d1 % 360) + 360) % 360;
  d2 = ((d2 % 360) + 360) % 360;

  if (c1 == c2)
  {
    if (d1 == d2)
      return {0, 1};
    return isValid(t_zero) ? t_zero : Fraction{-1, -1};
  }

  // Ensure C1 > C2 for positive relative speed
  if (c1 < c2)
  {
    swap(c1, c2);
    swap(d1, d2);
  }

  // (c1 - c2)t = d2 - d1 (mod 360)
  long long diff = d2 - d1;
  while (diff < 0)
    diff += 360;
  diff %= 360;

  long long ta = diff;
  long long tb = c1 - c2;

  long long common = gcd(ta, tb);
  Fraction t_angle = {ta / common, tb / common};

  return compareAndReturn(t_zero, t_angle);
}

Fraction findCollisionNotParallel(long long a1, long long b1, long long c1, long long d1,
                                  long long a2, long long b2, long long c2, long long d2)
{
  // t = (b2 - b1) / (a1 - a2)
  long long num = b2 - b1;
  long long den = a1 - a2;

  if (den == 0)
    return {-1, -1}; // Safety

  // Check t >= 0
  if ((num < 0 && den > 0) || (num > 0 && den < 0))
    return {-1, -1};

  num = std::abs(num);
  den = std::abs(den);

  long long common = gcd(num, den);
  long long ta = num / common;
  long long tb = den / common;

  // CHECK 1: Angle match
  // (c1 - c2)*ta + (d1 - d2)*tb = 360*tb*k
  long long term1 = (c1 - c2) * ta;
  long long term2 = (d1 - d2) * tb;
  long long lhs = term1 + term2;
  long long modBase = 360 * tb;

  if (lhs % modBase == 0)
  {
    return {ta, tb};
  }

  // CHECK 2: Radius Zero
  // a1*ta + b1*tb == 0
  if (a1 * ta + b1 * tb == 0)
  {
    return {ta, tb};
  }

  return {-1, -1};
}

int main()
{
  long long a1, b1, c1, d1, a2, b2, c2, d2;

  while (cin >> a1 >> b1 >> c1 >> d1 >> a2 >> b2 >> c2 >> d2)
  {
    // Check for termination
    if (a1 == 0 && b1 == 0 && c1 == 0 && d1 == 0 &&
        a2 == 0 && b2 == 0 && c2 == 0 && d2 == 0)
    {
      break;
    }

    // Case A: Standard Collision
    Fraction t_same = solveCase(a1, b1, c1, d1, a2, b2, c2, d2);

    // Case B: Anti-Parallel Collision (r1 -> -r1, angle -> angle + 180)
    Fraction t_opp = solveCase(-a1, -b1, c1, d1 + 180, a2, b2, c2, d2);

    Fraction best = compareAndReturn(t_same, t_opp);

    // If best is invalid (meaning compareAndReturn returned the default {0,0} NO COLLISION logic)
    // Wait, compareAndReturn logic:
    // If both invalid -> {0, 0}
    // If one valid -> returns valid
    // So we just print best.

    cout << best.first << " " << best.second << endl;
  }

  return 0;
}
