import React from 'react';

export default function DataStructureInspector({ selectedAlgo, currentStepData }) {
  const frontier = currentStepData?.frontier || [];
  
  let title = 'DATA STRUCTURE FRONTIER';
  let dsType = 'Priority Queue';
  let dsDescription = 'Stores node references sorted by cost metric.';

  if (selectedAlgo === 'bfs') {
    title = 'FIFO QUEUE (FIRST-IN-FIRST-OUT)';
    dsType = 'Queue';
    dsDescription = 'New neighbors enter at back, evaluated nodes exit from front.';
  } else if (selectedAlgo === 'dfs') {
    title = 'LIFO STACK (LAST-IN-FIRST-OUT)';
    dsType = 'Stack';
    dsDescription = 'New neighbors pushed to top, evaluated nodes popped from top.';
  } else if (selectedAlgo === 'dijkstra') {
    title = 'PRIORITY QUEUE (MIN-HEAP)';
    dsType = 'Priority Queue (Sorted by g-cost)';
    dsDescription = 'Prioritizes nodes with lowest cost from the start node.';
  } else if (selectedAlgo === 'bellmanford') {
    title = 'BELLMAN-FORD RELAXATION DISTANCES';
    dsType = 'Edge Relaxation Tracker';
    dsDescription = 'Iteratively relaxes all edges. Detects negative cost cycles.';
  } else if (selectedAlgo === 'floydwarshall') {
    title = 'FLOYD-WARSHALL DISTANCE MATRIX';
    dsType = 'All-Pairs Cost Matrix (N x N)';
    dsDescription = 'Matrix cells show shortest cost. Red highlights intermediate vertex k.';
  }

  const renderItemCard = (item, index) => {
    let id = '';
    let costText = '';

    if (typeof item === 'object' && item !== null) {
      id = item.id;
      costText = `p = ${Number(item.priority).toFixed(1)}`;
    } else {
      id = item;
    }

    const costDetails = currentStepData?.costs?.[id];
    let extraCosts = null;
    if (costDetails) {
      if (selectedAlgo === 'dijkstra' || selectedAlgo === 'bellmanford') {
        extraCosts = `dist:${Math.round(costDetails.g)}`;
      }
    }

    return (
      <div 
        key={`${id}-${index}`} 
        className={`ds-item-card ${index === 0 && selectedAlgo !== 'bellmanford' ? 'next-in-line' : ''}`}
      >
        <div className="ds-item-idx">#{index + 1}</div>
        <div className="ds-item-id">{id}</div>
        {costText && <div className="ds-item-priority">{costText}</div>}
        {extraCosts && <div className="ds-item-formula">{extraCosts}</div>}
      </div>
    );
  };

  return (
    <div className="ds-inspector">
      <div className="ds-inspector-header">
        <div className="ds-inspector-title">{title}</div>
        <div className="ds-inspector-meta">
          Type: <span className="text-neon-cyan">{dsType}</span>
        </div>
      </div>

      <div className="ds-inspector-body">
        {!currentStepData ? (
          <div className="ds-empty-state">
            <span className="pulsing-text">Frontier is currently empty.</span>
            <p className="ds-empty-sub">Start or play the simulation to see memory states populating.</p>
          </div>
        ) : (
          <div className={`ds-visualizer-container ds-mode-${selectedAlgo}`}>
            
            {/* BFS Queue */}
            {selectedAlgo === 'bfs' && (
              <div className="bfs-queue-track">
                <div className="queue-endpoint dequeue-end">← Exit [Front]</div>
                <div className="queue-cards-row">
                  {frontier.map((item, idx) => renderItemCard(item, idx))}
                </div>
                <div className="queue-endpoint enqueue-end">← Enter [Back]</div>
              </div>
            )}

            {/* DFS Stack */}
            {selectedAlgo === 'dfs' && (
              <div className="dfs-stack-column">
                <div className="stack-endpoint pop-end">↑ Pop / Push [Top]</div>
                <div className="stack-cards-column">
                  {[...frontier].reverse().map((item, idx) => renderItemCard(item, frontier.length - 1 - idx))}
                </div>
                <div className="stack-endpoint bottom-end">Base</div>
              </div>
            )}

            {/* Dijkstra */}
            {selectedAlgo === 'dijkstra' && (
              <div className="priority-queue-list">
                <div className="pq-header-labels">
                  <span>Priority Queue (Sorted Min → Max)</span>
                </div>
                <div className="pq-cards-grid">
                  {frontier.map((item, idx) => renderItemCard(item, idx))}
                </div>
              </div>
            )}

            {/* Bellman-Ford Edge List */}
            {selectedAlgo === 'bellmanford' && (
              <div className="priority-queue-list">
                <div className="pq-header-labels">
                  <span>Node Distances (Active edge highlighted in search log)</span>
                </div>
                <div className="pq-cards-grid">
                  {Object.keys(currentStepData.costs || {}).map((nodeId, idx) => renderItemCard(nodeId, idx))}
                </div>
              </div>
            )}

            {/* Floyd-Warshall 2D Matrix */}
            {selectedAlgo === 'floydwarshall' && currentStepData?.matrix && (
              <div className="fw-matrix-container">
                <table className="fw-matrix-table">
                  <thead>
                    <tr>
                      <th>from \ to</th>
                      {Object.keys(currentStepData.matrix).map(nodeId => (
                        <th key={nodeId} className={nodeId === currentStepData.currentNodeId ? 'fw-highlight-k' : ''}>
                          {nodeId}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(currentStepData.matrix).map(([rowId, colObj]) => (
                      <tr key={rowId}>
                        <td className={`row-hdr ${rowId === currentStepData.currentNodeId ? 'fw-highlight-k' : ''}`}>
                          {rowId}
                        </td>
                        {Object.entries(colObj).map(([colId, val]) => {
                          const isKRowOrCol = rowId === currentStepData.currentNodeId || colId === currentStepData.currentNodeId;
                          return (
                            <td 
                              key={colId} 
                              className={`matrix-cell ${val === Infinity ? 'text-muted' : 'text-neon-cyan'} ${isKRowOrCol ? 'fw-cell-k' : ''}`}
                            >
                              {val === Infinity ? '∞' : Math.round(val * 10) / 10}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        )}
      </div>
      
      {selectedAlgo === 'bellmanford' && currentStepData?.hasNegativeCycle && (
        <div className="has-cycle-alarm-banner">
          ⚠️ WARNING: NEGATIVE CYCLE DETECTED IN MAP GRAPH
        </div>
      )}

      <div className="ds-inspector-footer">
        <p>{dsDescription}</p>
      </div>
    </div>
  );
}
