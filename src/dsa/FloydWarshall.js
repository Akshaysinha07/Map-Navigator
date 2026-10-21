import { PathFinder } from './PathFinder';

export class FloydWarshallFinder extends PathFinder {
  solve() {
    const nodesList = Array.from(this.graph.nodes.keys());
    const N = nodesList.length;

    const dist = {};
    const next = {};

    for (const u of nodesList) {
      dist[u] = {};
      next[u] = {};
      for (const v of nodesList) {
        if (u === v) {
          dist[u][v] = 0;
          next[u][v] = null;
        } else {
          dist[u][v] = Infinity;
          next[u][v] = null;
        }
      }
    }

    for (const [fromId, node] of this.graph.nodes.entries()) {
      for (const neighborObj of node.neighbors) {
        const toId = neighborObj.nodeId;
        const weight = neighborObj.weight;
        dist[fromId][toId] = weight;
        next[fromId][toId] = toId;
      }
    }

    this.steps.push({
      currentNodeId: null,
      frontier: [...nodesList],
      visited: [],
      costs: {},
      parents: {},
      description: "Initialized Floyd-Warshall matrix D0 with direct edge weights.",
      highlightLine: 3,
      matrix: JSON.parse(JSON.stringify(dist)),
      nextMatrix: JSON.parse(JSON.stringify(next))
    });

    for (let kIndex = 0; kIndex < N; kIndex++) {
      const k = nodesList[kIndex];
      let updates = [];

      for (let iIndex = 0; iIndex < N; iIndex++) {
        const i = nodesList[iIndex];
        for (let jIndex = 0; jIndex < N; jIndex++) {
          const j = nodesList[jIndex];

          if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
            const pathViaK = dist[i][k] + dist[k][j];
            if (pathViaK < dist[i][j]) {
              dist[i][j] = pathViaK;
              next[i][j] = next[i][k];
              updates.push(`Updated ${i}→${j} to cost ${pathViaK} via ${k}`);
            }
          }
        }
      }

      const desc = updates.length > 0
        ? `Checked routes through intermediate node '${k}'. ${updates.slice(0, 3).join(', ')}${updates.length > 3 ? ` (+${updates.length - 3} more)` : ''}.`
        : `Checked routes through intermediate node '${k}'. No improvements found.`;

      this.steps.push({
        currentNodeId: k,
        frontier: [...nodesList],
        visited: [k],
        costs: {},
        parents: {},
        description: desc,
        highlightLine: 10,
        matrix: JSON.parse(JSON.stringify(dist)),
        nextMatrix: JSON.parse(JSON.stringify(next))
      });
    }

    this.steps.push({
      currentNodeId: null,
      frontier: [],
      visited: [],
      costs: {},
      parents: {},
      description: "Floyd-Warshall all-pairs shortest paths computed successfully.",
      highlightLine: 19,
      matrix: JSON.parse(JSON.stringify(dist)),
      nextMatrix: JSON.parse(JSON.stringify(next))
    });

    return this.steps;
  }

  reconstructPath(parents) {
    const lastStep = this.steps[this.steps.length - 1];
    if (!lastStep || !lastStep.nextMatrix) return [];
    
    const nextMatrix = lastStep.nextMatrix;
    const start = this.startNodeId;
    const end = this.endNodeId;

    if (nextMatrix[start]?.[end] === null) {
      return [];
    }

    const path = [start];
    let u = start;
    while (u !== end) {
      u = nextMatrix[u]?.[end];
      if (u === null || u === undefined) return [];
      path.push(u);
      
      if (path.length > this.graph.nodes.size) break;
    }
    return path;
  }
}
