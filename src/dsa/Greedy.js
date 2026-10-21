import { PathFinder } from './PathFinder';

class PriorityQueue {
  constructor(compareFn) {
    this.elements = [];
    this.compare = compareFn;
  }
  push(element) {
    this.elements.push(element);
    this.elements.sort(this.compare);
  }
  pop() {
    return this.elements.shift();
  }
  isEmpty() {
    return this.elements.length === 0;
  }
  toArray() {
    return [...this.elements];
  }
}

export class GreedyFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const heuristic = (nodeA, nodeB) => {
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const visited = new Set();
    const parents = { [this.startNodeId]: null };
    const hScore = heuristic(startNode, endNode);
    
    const costs = {
      [this.startNodeId]: {
        g: 0,
        h: Math.round(hScore * 10) / 10,
        f: Math.round(hScore * 10) / 10
      }
    };

    const pq = new PriorityQueue((a, b) => a.priority - b.priority);
    pq.push({ id: this.startNodeId, priority: hScore });

    this.recordStep(
      null,
      pq.toArray(),
      Array.from(visited),
      costs,
      parents,
      `Initialized Greedy Best-First: Added start node '${this.startNodeId}' to priority queue with h = ${costs[this.startNodeId].h}.`,
      5
    );

    while (!pq.isEmpty()) {
      const currentObj = pq.pop();
      const currentId = currentObj.id;
      const currentNode = this.graph.nodes.get(currentId);

      this.recordStep(
        currentId,
        pq.toArray(),
        Array.from(visited),
        costs,
        parents,
        `Popped node '${currentId}' with lowest h-cost (${costs[currentId] ? costs[currentId].h : 0}) from queue.`,
        7
      );

      if (currentId === this.endNodeId) {
        this.recordStep(
          currentId,
          pq.toArray(),
          Array.from(visited),
          costs,
          parents,
          `Reached destination node '${currentId}'! Reconstructing path.`,
          8
        );
        return this.steps;
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      this.recordStep(
        currentId,
        pq.toArray(),
        Array.from(visited),
        costs,
        parents,
        `Marked node '${currentId}' as visited. Exploring neighbors.`,
        10
      );

      for (const neighborObj of currentNode.neighbors) {
        const neighborId = neighborObj.nodeId;
        const neighborNode = this.graph.nodes.get(neighborId);

        if (neighborNode.isWall) continue;

        if (!visited.has(neighborId) && !parents[neighborId]) {
          const hVal = heuristic(neighborNode, endNode);
          parents[neighborId] = currentId;
          
          costs[neighborId] = {
            g: (costs[currentId]?.g || 0) + 1,
            h: Math.round(hVal * 10) / 10,
            f: Math.round(hVal * 10) / 10
          };

          pq.push({ id: neighborId, priority: hVal });

          this.recordStep(
            currentId,
            pq.toArray(),
            Array.from(visited),
            costs,
            parents,
            `Found neighbor '${neighborId}' with h-cost = ${costs[neighborId].h}. Adding to queue.`,
            18
          );
        }
      }
    }

    this.recordStep(
      null,
      [],
      Array.from(visited),
      costs,
      parents,
      "Priority Queue is empty. No path found.",
      21
    );

    return this.steps;
  }
}
