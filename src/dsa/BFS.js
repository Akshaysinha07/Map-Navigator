import { PathFinder } from './PathFinder';

export class BFSFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const queue = [this.startNodeId];
    const visited = new Set([this.startNodeId]);
    const parents = { [this.startNodeId]: null };
    const costs = { [this.startNodeId]: { g: 0, h: 0, f: 0 } };

    this.recordStep(
      null,
      [...queue],
      Array.from(visited),
      costs,
      parents,
      `Initialized BFS: Added start node '${this.startNodeId}' to queue.`,
      2
    );

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = this.graph.nodes.get(currentId);

      this.recordStep(
        currentId,
        [...queue],
        Array.from(visited),
        costs,
        parents,
        `Dequeued '${currentId}' for evaluation.`,
        6
      );

      if (currentId === this.endNodeId) {
        this.recordStep(
          currentId,
          [...queue],
          Array.from(visited),
          costs,
          parents,
          `Reached target node '${currentId}'! Reconstructing path.`,
          7
        );
        return this.steps;
      }

      for (const neighborObj of currentNode.neighbors) {
        const neighborId = neighborObj.nodeId;
        const neighborNode = this.graph.nodes.get(neighborId);

        if (neighborNode.isWall) continue;

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          parents[neighborId] = currentId;
          costs[neighborId] = { g: costs[currentId].g + 1, h: 0, f: 0 };
          queue.push(neighborId);

          this.recordStep(
            currentId,
            [...queue],
            Array.from(visited),
            costs,
            parents,
            `Visited neighbor '${neighborId}', set parent to '${currentId}', and added to queue.`,
            12
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
      "Queue is empty. BFS traversed all reachable nodes and found no path.",
      16
    );

    return this.steps;
  }
}
