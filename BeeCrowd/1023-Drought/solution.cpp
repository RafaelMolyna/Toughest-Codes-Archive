/*
 * Problem: 1023 - Drought
 * Platform: BeeCrowd
 * Language: C++17 (Optimized)
 * Logic: Bucket Sort + Raw Buffer I/O
 */

#include <cstdio>
#include <cstring>
#include <vector>

using namespace std;

// CONSTANTS
// 8MB Buffer to safely read huge inputs in one go
const int BUF_SIZE = 1024 * 1024 * 8;
char buffer[BUF_SIZE];
int buf_idx = 0;
int bytes_read = 0;

/**
 * Fast Integer Reader
 * Reads characters directly from the buffer and constructs the integer.
 * Much faster than scanf because it skips format parsing.
 */
inline int readInt()
{
  int sum = 0;
  // Skip non-digit characters (newlines, spaces)
  while (buffer[buf_idx] < '0' || buffer[buf_idx] > '9')
  {
    buf_idx++;
    if (buf_idx >= bytes_read)
      return 0;
  }
  // Parse valid digits
  while (buffer[buf_idx] >= '0' && buffer[buf_idx] <= '9')
  {
    sum = sum * 10 + (buffer[buf_idx] - '0');
    buf_idx++;
  }
  return sum;
}

// Frequency array (Buckets)
// Indices 0-200 represent the average consumption.
int counts[205];

int main()
{
  // Read standard input (File Descriptor 0) into memory
  bytes_read = fread(buffer, 1, BUF_SIZE, stdin);

  int N;
  int cityNumber = 1;
  bool first = true;

  while (true)
  {
    N = readInt();
    if (N == 0)
      break;

    if (!first)
      printf("\n\n");
    first = false;

    // Reset buckets for the new test case.
    // memset is highly optimized in C++.
    memset(counts, 0, sizeof(counts));

    int totalResid = 0;
    int totalCons = 0;

    for (int i = 0; i < N; ++i)
    {
      int X = readInt(); // Residents
      int Y = readInt(); // Consumption

      totalResid += X;
      totalCons += Y;

      // BUCKET SORT LOGIC:
      // We don't store the house. We just increment the counter
      // for that specific average.
      counts[Y / X] += X;
    }

    printf("Cidade# %d:\n", cityNumber++);

    // Print Buckets
    // Since we iterate i from 0 to 200, the output is sorted by definition.
    bool firstItem = true;
    for (int i = 0; i <= 200; ++i)
    {
      if (counts[i] > 0)
      {
        if (!firstItem)
          printf(" ");
        printf("%d-%d", counts[i], i);
        firstItem = false;
      }
    }

    // MATH TRUNCATION LOGIC
    // We use integer math to avoid floating point issues.
    // Example: 314 / 100 = 3 remainder 14 -> 3.14
    int avgInt = (int)((100LL * totalCons) / totalResid);
    int whole = avgInt / 100;
    int frac = avgInt % 100;

    printf("\nConsumo medio: %d.%02d m3.", whole, frac);
  }

  printf("\n");
  return 0;
}
