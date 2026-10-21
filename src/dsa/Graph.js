export class GraphNode {
  constructor(id, x, y, isWall = false, weight = 1) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.isWall = isWall;
    this.weight = weight;
    this.neighbors = [];
  }
}

export class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(id, x, y, isWall = false, weight = 1) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, new GraphNode(id, x, y, isWall, weight));
    } else {
      const node = this.nodes.get(id);
      node.x = x;
      node.y = y;
      node.isWall = isWall;
      node.weight = weight;
    }
    return this.nodes.get(id);
  }

  addEdge(fromId, toId, weight = 1) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (fromNode && toNode) {
      if (!fromNode.neighbors.some(n => n.nodeId === toId)) {
        fromNode.neighbors.push({ nodeId: toId, weight: Number(weight) });
      }
      if (!toNode.neighbors.some(n => n.nodeId === fromId)) {
        toNode.neighbors.push({ nodeId: fromId, weight: Number(weight) });
      }
    }
  }

  removeEdge(fromId, toId) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (fromNode && toNode) {
      fromNode.neighbors = fromNode.neighbors.filter(n => n.nodeId !== toId);
      toNode.neighbors = toNode.neighbors.filter(n => n.nodeId !== fromId);
    }
  }

  removeNode(id) {
    const node = this.nodes.get(id);
    if (node) {
      for (const neighbor of node.neighbors) {
        const neighborNode = this.nodes.get(neighbor.nodeId);
        if (neighborNode) {
          neighborNode.neighbors = neighborNode.neighbors.filter(n => n.nodeId !== id);
        }
      }
      this.nodes.delete(id);
    }
  }

  clear() {
    this.nodes.clear();
  }
}
