import { PathFinder } from './PathFinder';

export class DFSFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const stack = [this.startNodeId];
    const visited = new Set();
    const parents = { [this.startNodeId]: null };
    const costs = { [this.startNodeId]: { g: 0, h: 0, f: 0 } };

    this.recordStep(
      null,
      [...stack],
      Array.from(visited),
      costs,
      parents,
      `Initialized DFS: Added start node '${this.startNodeId}' to stack.`,
      2
    );

    while (stack.length > 0) {
      const currentId = stack.pop();
      const currentNode = this.graph.nodes.get(currentId);

      this.recordStep(
        currentId,
        [...stack],
        Array.from(visited),
        costs,
        parents,
        `Popped '${currentId}' from stack.`,
        6
      );

      if (currentId === this.endNodeId) {
        this.recordStep(
          currentId,
          [...stack],
          Array.from(visited),
          costs,
          parents,
          `Reached target node '${currentId}'! Reconstructing path.`,
          7
        );
        return this.steps;
      }

      if (!visited.has(currentId)) {
        visited.add(currentId);

        this.recordStep(
          currentId,
          [...stack],
          Array.from(visited),
          costs,
          parents,
          `Marked '${currentId}' as visited. Exploring neighbors.`,
          9
        );

        for (const neighborObj of currentNode.neighbors) {
          const neighborId = neighborObj.nodeId;
          const neighborNode = this.graph.nodes.get(neighborId);

          if (neighborNode.isWall) continue;

          if (!visited.has(neighborId)) {
            parents[neighborId] = currentId;
            costs[neighborId] = { g: costs[currentId].g + 1, h: 0, f: 0 };
            stack.push(neighborId);

            this.recordStep(
              currentId,
              [...stack],
              Array.from(visited),
              costs,
              parents,
              `Pushed neighbor '${neighborId}' onto stack and set parent to '${currentId}'.`,
              13
            );
          }
        }
      }
    }

    this.recordStep(
      null,
      [],
      Array.from(visited),
      costs,
      parents,
      "Stack is empty. DFS traversed all reachable nodes and found no path.",
      18
    );

    return this.steps;
  }
}
