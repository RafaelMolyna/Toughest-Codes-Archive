#include <bits/stdc++.h>
using namespace std;

// Play with: > g++ c1141_final3.cpp -o 1141f.exe && type stdinBig.txt | 1141f.exe
// Play with: > g++ c1141_final3.cpp -o 1141f.exe && type stdinBig.txt | 1141f.exe > stdoutBig2.txt

// Max number of Nodes
const int nodesMAX = 1000001;
// Trie variables
int Nodes[nodesMAX][26];
int lastNode = 1;
// Supportive Infos for each of the TrieNodes
int failLink[nodesMAX];
int isWord[nodesMAX];
// Number of subwords of the node (Problem-Solution aidding Info)
int nSubWords[nodesMAX];

// Supportive functions:
void setPathsToZero(int node)
{
    memset(Nodes[node], 0, sizeof(int) * 26);
}

void resetArrayZero(int *arr, int last = nodesMAX)
{
    memset(arr, 0, sizeof(int) * last);
}

// Core functions:
void insertWord(char *word)
{
    int node = 0;

    for (int i = 0; word[i]; i++)
    {
        char path = word[i] - 'a';
        // create node if there isn't
        if (!Nodes[node][path])
        {
            Nodes[node][path] = lastNode;
            setPathsToZero(lastNode);
            lastNode++;
        }
        // goes to next node
        node = Nodes[node][path];
    }

    isWord[node] = true;
}

int findFailureLink(int node, int child, char i)
{
    // parents failLink is the initial
    int testFailLink = failLink[node];

    while (true)
    {
        // parent's failink has the path: -> SET failink and EXIT
        if (Nodes[testFailLink][i])
        {
            failLink[child] = Nodes[testFailLink][i];
            nSubWords[child] = max(nSubWords[child], nSubWords[failLink[child]]);
            return testFailLink;
        }
        // Reached the root: -> SET 0 and EXIT
        if (testFailLink == 0)
            return 0;
        testFailLink = failLink[testFailLink];
    }
}

int buildAutomaton()
{
    int maxSubWords = 1;
    queue<int> q;

    // ROOT: its failink and parentLink is the root itself
    failLink[0] = 0;

    // DEPTH=1 case: failLinks to root, no dictLinks:
    for (char i = 0; i < 26; i++)
    {
        // ignore non-nodes
        int rootChild = Nodes[0][i];
        if (rootChild)
        {
            // set failLink and nSubWords, push to queue:
            failLink[rootChild] = 0;
            if (isWord[rootChild])
                nSubWords[rootChild] = 1;
            else
                nSubWords[rootChild] = 0;

            q.push(rootChild);
        }
    }

    // EACH LEVEL: solve automaton in levelOrder:
    while (!q.empty())
    {
        // EACH NODE:
        int node = q.front();
        q.pop();

        // EACH CHILD OF NODE:
        for (char i = 0; i < 26; i++)
        {
            // ignore non-nodes
            int nodeChild = Nodes[node][i];
            if (nodeChild)
            {
                q.push(nodeChild);
                nSubWords[nodeChild] = nSubWords[node];

                // solve the FAILURE LINK: -> Largest existing SUFFIX of the Node in the Trie:
                findFailureLink(node, nodeChild, i);

                // if child is word: nSubWords gets +1
                if (isWord[nodeChild])
                {
                    nSubWords[nodeChild] += 1;
                    maxSubWords = max(maxSubWords, nSubWords[nodeChild]);
                }
            }
        }
    }

    return maxSubWords;
}

int main()
{
    int result, i = 0;
    int numWords;
    char word[1002];

    scanf("%d", &numWords);

    while (numWords)
    {
        // clean Root initial infos;
        resetArrayZero(failLink, lastNode); // Reset failLinks array (to 0)
        // resetArrayZero(nSubWords, lastNode); // Reset number-of-subwords array(to 0)
        resetArrayZero(isWord, lastNode); // Reset word-Nodes array(to 0)

        lastNode = 1;
        setPathsToZero(0); // Root paths to zero

        for (int w = 0; w < numWords; w++)
        {
            scanf("%s", word);
            insertWord(word);
        }

        result = buildAutomaton();
        printf("%d\n", result);

        scanf("%d", &numWords);
    }

    return 0;
}
