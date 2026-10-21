export class PathFinder {
  constructor(graph, startNodeId, endNodeId) {
    this.graph = graph;
    this.startNodeId = startNodeId;
    this.endNodeId = endNodeId;
    this.steps = [];
  }

  recordStep(currentNodeId, frontier, visited, costs, parents, description, highlightLine) {
    const frontierCopy = frontier.map(item => {
      if (typeof item === 'object' && item !== null) {
        return { ...item };
      }
      return item;
    });

    const visitedCopy = [...visited];

    const costsCopy = {};
    for (const [id, costObj] of Object.entries(costs)) {
      costsCopy[id] = { ...costObj };
    }

    const parentsCopy = { ...parents };

    this.steps.push({
      currentNodeId,
      frontier: frontierCopy,
      visited: visitedCopy,
      costs: costsCopy,
      parents: parentsCopy,
      description,
      highlightLine,
    });
  }

  reconstructPath(parents) {
    if (!parents[this.endNodeId] && this.startNodeId !== this.endNodeId) {
      return []; // No path found
    }
    
    const path = [];
    let current = this.endNodeId;
    while (current !== null && current !== undefined) {
      path.push(current);
      if (current === this.startNodeId) {
        break;
      }
      current = parents[current];
      
      if (path.includes(current) || path.length > this.graph.nodes.size) {
        break;
      }
    }
    return path.reverse();
  }
}
