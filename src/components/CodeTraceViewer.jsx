import React from 'react';

export default function CodeTraceViewer({ selectedAlgo, currentLine, description }) {
  const codes = {
    bfs: [
      "function BFS(graph, start, end) {", // 1
      "  const queue = [start];", // 2
      "  const visited = new Set([start]);", // 3
      "  const parents = { [start]: null };", // 4
      "  while (queue.length > 0) {", // 5
      "    const current = queue.shift();", // 6
      "    if (current === end) return reconstructPath(parents);", // 7
      "    for (const neighbor of graph.getNeighbors(current)) {", // 8
      "      if (!visited.has(neighbor.id) && !neighbor.isWall) {", // 9
      "        visited.add(neighbor.id);", // 10
      "        parents[neighbor.id] = current;", // 11
      "        queue.push(neighbor.id);", // 12
      "      }", // 13
      "    }", // 14
      "  }", // 15
      "  return null;", // 16
      "}" // 17
    ],
    dfs: [
      "function DFS(graph, start, end) {", // 1
      "  const stack = [start];", // 2
      "  const visited = new Set();", // 3
      "  const parents = { [start]: null };", // 4
      "  while (stack.length > 0) {", // 5
      "    const current = stack.pop();", // 6
      "    if (current === end) return reconstructPath(parents);", // 7
      "    if (!visited.has(current)) {", // 8
      "      visited.add(current);", // 9
      "      for (const neighbor of graph.getNeighbors(current)) {", // 10
      "        if (!visited.has(neighbor.id) && !neighbor.isWall) {", // 11
      "          parents[neighbor.id] = current;", // 12
      "          stack.push(neighbor.id);", // 13
      "        }", // 14
      "      }", // 15
      "    }", // 16
      "  }", // 17
      "  return null;", // 18
      "}" // 19
    ],
    dijkstra: [
      "function Dijkstra(graph, start, end) {", // 1
      "  const pq = new PriorityQueue((a, b) => g[a] - g[b]);", // 2
      "  const gScore = { [start]: 0 };", // 3
      "  const visited = new Set();", // 4
      "  pq.push({ id: start, priority: 0 });", // 5
      "  while (!pq.isEmpty()) {", // 6
      "    const current = pq.pop().id;", // 7
      "    if (current === end) return reconstructPath(parents);", // 8
      "    if (visited.has(current)) continue;", // 9
      "    visited.add(current);", // 10
      "    for (const neighbor of graph.getNeighbors(current)) {", // 11
      "      if (neighbor.isWall) continue;", // 12
      "      const tentativeG = gScore[current] + neighbor.weight;", // 13
      "      if (tentativeG < (gScore[neighbor.id] || Infinity)) {", // 14
      "        gScore[neighbor.id] = tentativeG;", // 15
      "        parents[neighbor.id] = current;", // 16
      "        pq.push({ id: neighbor.id, priority: tentativeG });", // 17
      "      }", // 18
      "    }", // 19
      "  }", // 20
      "  return null;", // 21
      "}" // 22
    ],
    astar: [
      "function AStar(graph, start, end) {", // 1
      "  const pq = new PriorityQueue((a, b) => f[a] - f[b]);", // 2
      "  const gScore = { [start]: 0 };", // 3
      "  const fScore = { [start]: h(start, end) };", // 4
      "  pq.push({ id: start, priority: fScore[start] });", // 5
      "  while (!pq.isEmpty()) {", // 6
      "    const current = pq.pop().id;", // 7
      "    if (current === end) return reconstructPath(parents);", // 8
      "    if (visited.has(current)) continue;", // 9
      "    visited.add(current);", // 10
      "    for (const neighbor of graph.getNeighbors(current)) {", // 11
      "      if (neighbor.isWall) continue;", // 12
      "      const tentativeG = gScore[current] + neighbor.weight;", // 13
      "      if (tentativeG < (gScore[neighbor.id] || Infinity)) {", // 14
      "        gScore[neighbor.id] = tentativeG;", // 15
      "        const fVal = tentativeG + h(neighbor, end);", // 16
      "        parents[neighbor.id] = current;", // 17
      "        pq.push({ id: neighbor.id, priority: fVal });", // 18
      "      }", // 19
      "    }", // 20
      "  }", // 21
      "  return null;", // 22
      "}" // 23
    ],
    greedy: [
      "function GreedyBestFirst(graph, start, end) {", // 1
      "  const pq = new PriorityQueue((a, b) => h[a] - h[b]);", // 2
      "  const visited = new Set();", // 3
      "  pq.push({ id: start, priority: h(start, end) });", // 4
      "  while (!pq.isEmpty()) {", // 5
      "    const current = pq.pop().id;", // 6
      "    if (current === end) return reconstructPath(parents);", // 7
      "    if (visited.has(current)) continue;", // 8
      "    visited.add(current);", // 9
      "    for (const neighbor of graph.getNeighbors(current)) {", // 10
      "      if (neighbor.isWall) continue;", // 11
      "      if (!visited.has(neighbor.id) && !parents[neighbor.id]) {", // 12
      "        parents[neighbor.id] = current;", // 13
      "        pq.push({ id: neighbor.id, priority: h(neighbor, end) });", // 14
      "      }", // 15
      "    }", // 16
      "  }", // 17
      "  return null;", // 18
      "}" // 19
    ],
    bellmanford: [
      "function BellmanFord(graph, start, end) {", // 1
      "  const dist = {}; const parents = {};", // 2
      "  for (const n of graph.nodes) dist[n] = Infinity;", // 3
      "  dist[start] = 0;", // 4
      "  for (let i = 1; i < graph.nodes.length; i++) {", // 5
      "    for (const edge of graph.edges) {", // 6
      "      const { u, v, weight } = edge;", // 7
      "      if (dist[u] + weight < dist[v]) {", // 8
      "        dist[v] = dist[u] + weight;", // 9
      "        parents[v] = u;", // 10
      "      }", // 11
      "    }", // 12
      "  }", // 13
      "  for (const edge of graph.edges) {", // 14
      "    if (dist[edge.u] + edge.weight < dist[edge.v]) {", // 15
      "      throw new Error('Negative cycle detected');", // 16
      "    }", // 17
      "  }", // 18
      "  return reconstructPath(parents);", // 19
      "}" // 20
    ],
    floydwarshall: [
      "function FloydWarshall(graph) {", // 1
      "  const dist = {}; const next = {};", // 2
      "  for (const u of graph.nodes) {", // 3
      "    dist[u] = {}; next[u] = {};", // 4
      "    for (const v of graph.nodes) {", // 5
      "      dist[u][v] = u === v ? 0 : edge(u,v) ? wt : Infinity;", // 6
      "      next[u][v] = edge(u,v) ? v : null;", // 7
      "    }", // 8
      "  }", // 9
      "  for (const k of graph.nodes) {", // 10
      "    for (const i of graph.nodes) {", // 11
      "      for (const j of graph.nodes) {", // 12
      "        if (dist[i][k] + dist[k][j] < dist[i][j]) {", // 13
      "          dist[i][j] = dist[i][k] + dist[k][j];", // 14
      "          next[i][j] = next[i][k];", // 15
      "        }", // 16
      "      }", // 17
      "    }", // 18
      "  }", // 19
      "}" // 20
    ]
  };

  const activeCode = codes[selectedAlgo] || [];

  return (
    <div className="code-trace-viewer">
      <div className="code-header">
        <div className="code-header-title">LIVE CODE TRACE</div>
        <div className="code-header-lang">JavaScript (ES6 OOP)</div>
      </div>
      
      <div className="code-body">
        <pre className="code-editor-pre">
          <code>
            {activeCode.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = lineNum === currentLine;
              
              return (
                <div 
                  key={lineNum} 
                  className={`code-line-row ${isHighlighted ? 'highlighted-code-line' : ''}`}
                >
                  <span className="code-line-number">{lineNum}</span>
                  <span className="code-line-content">{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Dynamic Text Explanations */}
      <div className="explanation-panel">
        <div className="explanation-hdr">NAVIGATOR INSTRUCTION LOG:</div>
        <div className="explanation-text">
          {description ? (
            <span className="text-neon-cyan">{description}</span>
          ) : (
            <span className="text-muted">Start simulation or step through to inspect paths.</span>
          )}
        </div>
      </div>
    </div>
  );
}
