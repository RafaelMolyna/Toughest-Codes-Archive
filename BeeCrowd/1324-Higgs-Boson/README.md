# Higgs Boson Challenge (Beecrowd 1324) - Step-by-Step Analysis

## 1. The Physics (Polar Coordinates)

The core difficulty of this problem lies in the properties of polar coordinates. A point in 2D space $(r, \theta)$ is not unique. It can be represented in two main ways that allow particles to collide:

1. **Standard Collision:** $r_1 = r_2$ AND $\theta_1 = \theta_2 \pmod{360^\circ}$
   - The particles are at the exact same distance and angle.
2. **Anti-Parallel Collision:** $r_1 = -r_2$ AND $\theta_1 = \theta_2 + 180^\circ \pmod{360^\circ}$
   - In polar coordinates, a negative radius $-r$ at angle $\theta$ is physically the same point as radius $r$ at angle $\theta + 180^\circ$.
   - Imagine looking "behind" you (180 degrees) and walking backwards (negative distance)—you end up in front of you.

## 2. Mathematical Strategy

We define the trajectory equations:

- $r(t) = At + B$
- $\theta(t) = Ct + D$

Since we need to find the **earliest collision time** $t \ge 0$, we solve for both Case 1 and Case 2 independently and pick the smallest valid $t$.

### Solving a Single Case

For each case (standard or anti-parallel), we compare the radius functions of the two particles:
$r_1(t) = A_1t + B_1$
$r_2(t) = A_2t + B_2$

This branches into two mathematical scenarios:

#### Scenario A: Intersecting Lines ($A_1 \neq A_2$)

If the slopes differ, the lines intersect at exactly **one** point in time:
$$t = \frac{B_2 - B_1}{A_1 - A_2}$$

1. Calculate $t$ as a fraction. If $t < 0$, no collision.
2. Plug this $t$ into the angle equations.
3. Check if $\theta_1(t) \equiv \theta_2(t) \pmod{360}$.
   - _Note:_ Even if angles don't match, if $r(t) = 0$ at this time, it is a valid collision (collision at the origin).

#### Scenario B: Parallel Lines ($A_1 = A_2$)

If the slopes are the same:

1. **Distinct Lines ($B_1 \neq B_2$):** The radii are parallel and never touch. No collision (unless they hit the origin, handled separately).
2. **Identical Lines ($B_1 = B_2$):** The particles are always at the same radius ($r_1(t) = r_2(t)$ for all $t$).
   - Collision occurs either when **Angles Align** OR when **Radius is Zero**.
   - We solve for the time angles align: $(C_1 - C_2)t \equiv D_2 - D_1 \pmod{360}$.
   - We solve for the time radius is zero: $At + B = 0$.
   - We pick the smallest non-negative $t$.

## 3. Implementation Details

### Integer Arithmetic Only

The problem requires exact fractional output ($ta/tb$) and high precision. Floating point numbers (`float`, `double`) are imprecise and can cause failures in competitive programming (e.g., `0.33333333` vs `1/3`).

- **Solution:** We store time as a pair `{numerator, denominator}`.
- **Simplification:** We use the Greatest Common Divisor (GCD) to keep fractions irreducible.

### The "BigInt" / "long long" Necessity

When comparing two fractions $\frac{n_1}{d_1}$ and $\frac{n_2}{d_2}$, we avoid division:
$$\frac{n_1}{d_1} < \frac{n_2}{d_2} \iff n_1 \cdot d_2 < n_2 \cdot d_1$$
With inputs up to $10^4$:

- Intermediate products in Angle Check: $(C_1 - C_2) \cdot ta \approx 10^4 \cdot 10^4 = 10^8$.
- Sum of terms can reach $10^9$.
- In C++, `int` (usually $\pm 2 \cdot 10^9$) is risky. `long long` ($\pm 9 \cdot 10^{18}$) is safe.
- In JavaScript, `Number` is safe up to $2^{53}$ ($9 \cdot 10^{15}$), but we used `BigInt` to be absolutely certain against edge case overflows.

## 4. Edge Cases Handled

1. **Negative Zero:** $r_1=0$ and $r_2=0$ logic handles inputs like `-0` gracefully via logic separation.
2. **Wait for Alignment:** If particles rotate at different speeds ($C_1 \neq C_2$), we calculate exactly how many loops it takes to align.
3. **Origin Singularity:** If $r=0$, angles don't need to match. The code explicitly checks `a*ta + b*tb == 0`.
