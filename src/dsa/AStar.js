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

export class AStarFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const heuristic = (nodeA, nodeB) => {
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const gScore = { [this.startNodeId]: 0 };
    const hScore = { [this.startNodeId]: heuristic(startNode, endNode) };
    const fScore = { [this.startNodeId]: hScore[this.startNodeId] };

    const parents = { [this.startNodeId]: null };
    const visited = new Set();
    
    const costs = {
      [this.startNodeId]: {
        g: 0,
        h: Math.round(hScore[this.startNodeId] * 10) / 10,
        f: Math.round(fScore[this.startNodeId] * 10) / 10
      }
    };

    const pq = new PriorityQueue((a, b) => a.priority - b.priority);
    pq.push({ id: this.startNodeId, priority: fScore[this.startNodeId] });

    this.recordStep(
      null,
      pq.toArray(),
      Array.from(visited),
      costs,
      parents,
      `Initialized A*: Added start node '${this.startNodeId}' to priority queue with f = g + h = 0 + ${costs[this.startNodeId].h} = ${costs[this.startNodeId].f}.`,
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
        `Popped node '${currentId}' with lowest f-cost (${Math.round(fScore[currentId] * 10) / 10}) from queue.`,
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
          const hVal = heuristic(neighborNode, endNode);
          hScore[neighborId] = hVal;
          fScore[neighborId] = tentativeG + hVal;
          
          parents[neighborId] = currentId;

          costs[neighborId] = {
            g: tentativeG,
            h: Math.round(hVal * 10) / 10,
            f: Math.round((tentativeG + hVal) * 10) / 10
          };

          pq.push({ id: neighborId, priority: fScore[neighborId] });

          this.recordStep(
            currentId,
            pq.toArray(),
            Array.from(visited),
            costs,
            parents,
            `Found shorter path to '${neighborId}' via '${currentId}' with f = g + h = ${tentativeG} + ${costs[neighborId].h} = ${costs[neighborId].f}.`,
            19
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
