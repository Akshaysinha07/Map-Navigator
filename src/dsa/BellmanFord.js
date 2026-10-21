import { PathFinder } from './PathFinder';

export class BellmanFordFinder extends PathFinder {
  solve() {
    const startNode = this.graph.nodes.get(this.startNodeId);
    const endNode = this.graph.nodes.get(this.endNodeId);
    
    if (!startNode || !endNode) return [];

    const nodesList = Array.from(this.graph.nodes.keys());
    const edgesList = [];
    
    for (const [fromId, node] of this.graph.nodes.entries()) {
      for (const neighborObj of node.neighbors) {
        edgesList.push({
          from: fromId,
          to: neighborObj.nodeId,
          weight: neighborObj.weight
        });
      }
    }

    const distances = {};
    const parents = {};
    for (const nodeId of nodesList) {
      distances[nodeId] = Infinity;
      parents[nodeId] = null;
    }
    distances[this.startNodeId] = 0;

    const getCostsSnapshot = () => {
      const snapshot = {};
      for (const nodeId of nodesList) {
        snapshot[nodeId] = { 
          g: distances[nodeId], 
          h: 0, 
          f: distances[nodeId] 
        };
      }
      return snapshot;
    };

    this.recordStep(
      null,
      edgesList.map(e => `${e.from}→${e.to}`),
      [],
      getCostsSnapshot(),
      parents,
      `Initialized Bellman-Ford: Set distance to start '${this.startNodeId}' to 0, and all other nodes to Infinity.`,
      3
    );

    const V = nodesList.length;
    
    for (let i = 1; i < V; i++) {
      let relaxedAny = false;
      
      for (const edge of edgesList) {
        const u = edge.from;
        const v = edge.to;
        const weight = edge.weight;

        if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
          distances[v] = distances[u] + weight;
          parents[v] = u;
          relaxedAny = true;
          
          this.recordStep(
            v,
            edgesList.map(e => `${e.from}→${e.to}`),
            [u, v],
            getCostsSnapshot(),
            parents,
            `Iteration ${i}: Relaxed edge '${u} → ${v}'. Updated distance to '${v}' to ${distances[v]} via '${u}'.`,
            10
          );
        } else {
          this.recordStep(
            u,
            edgesList.map(e => `${e.from}→${e.to}`),
            [u, v],
            getCostsSnapshot(),
            parents,
            `Iteration ${i}: Checked edge '${u} → ${v}'. Path via '${u}' (${distances[u] === Infinity ? '∞' : distances[u] + weight}) is not shorter than current (${distances[v] === Infinity ? '∞' : distances[v]}).`,
            9
          );
        }
      }

      if (!relaxedAny) {
        this.recordStep(
          null,
          [],
          [],
          getCostsSnapshot(),
          parents,
          `Iteration ${i}: No edges relaxed. Shortest paths finalized early.`,
          13
        );
        return this.steps;
      }
    }

    for (const edge of edgesList) {
      const u = edge.from;
      const v = edge.to;
      const weight = edge.weight;

      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        const step = {
          currentNodeId: v,
          frontier: edgesList.map(e => `${e.from}→${e.to}`),
          visited: [u, v],
          costs: getCostsSnapshot(),
          parents: parents,
          description: `CRITICAL ALERT: Negative weight cycle detected at edge '${u} → ${v}'! Travel costs drop infinitely.`,
          highlightLine: 16,
          hasNegativeCycle: true
        };
        this.steps.push(step);
        return this.steps;
      }
    }

    this.recordStep(
      null,
      [],
      [],
      getCostsSnapshot(),
      parents,
      `Bellman-Ford completed. No negative cycles detected. Reconstructing route.`,
      19
    );

    return this.steps;
  }
}
