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

export class DijkstraFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const gScore = { [this.startNodeId]: 0 };
    const parents = { [this.startNodeId]: null };
    const visited = new Set();
    
    const costs = { [this.startNodeId]: { g: 0, h: 0, f: 0 } };

    const pq = new PriorityQueue((a, b) => a.priority - b.priority);
    pq.push({ id: this.startNodeId, priority: 0 });

    this.recordStep(
      null,
      pq.toArray(),
      Array.from(visited),
      costs,
      parents,
      `Initialized Dijkstra: Added start node '${this.startNodeId}' to priority queue with cost 0.`,
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
        `Popped node '${currentId}' with lowest g-cost (${gScore[currentId]}) from queue.`,
        7
      );

      if (currentId === this.endNodeId) {
        this.recordStep(
          currentId,
          pq.toArray(),
          Array.from(visited),
          costs,
          parents,
          `Reached destination node '${currentId}'! Reconstructing shortest path.`,
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
        `Marked node '${currentId}' as visited. Relaxing neighbors.`,
        10
      );

      for (const neighborObj of currentNode.neighbors) {
        const neighborId = neighborObj.nodeId;
        const neighborNode = this.graph.nodes.get(neighborId);

        if (neighborNode.isWall) continue;

        const edgeWeight = neighborObj.weight;
        const tentativeG = gScore[currentId] + edgeWeight;

        const currentNeighborG = gScore[neighborId] !== undefined ? gScore[neighborId] : Infinity;

        if (tentativeG < currentNeighborG) {
          gScore[neighborId] = tentativeG;
          parents[neighborId] = currentId;
          
          costs[neighborId] = { g: tentativeG, h: 0, f: tentativeG };
          
          pq.push({ id: neighborId, priority: tentativeG });

          this.recordStep(
            currentId,
            pq.toArray(),
            Array.from(visited),
            costs,
            parents,
            `Found shorter path to '${neighborId}' via '${currentId}' (cost: ${tentativeG}). Adding to queue.`,
            17
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
