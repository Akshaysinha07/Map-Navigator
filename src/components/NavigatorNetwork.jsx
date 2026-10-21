import React, { useState, useRef } from 'react';

export default function NavigatorNetwork({
  nodes,
  edges,
  startNode,
  endNode,
  setStartNode,
  setEndNode,
  currentStepData,
  finalPath,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onMoveNode,
  onUpdateEdgeWeight
}) {
  const [networkTool, setNetworkTool] = useState('addNode'); // 'addNode', 'addEdge', 'setStart', 'setEnd', 'delete'
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const canvasRef = useRef(null);
  const dragNodeId = useRef(null);

  // Custom Add City modal states
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [pendingNodeCoords, setPendingNodeCoords] = useState({ x: 0, y: 0 });
  const [newNodeName, setNewNodeName] = useState('');
  const [addNodeError, setAddNodeError] = useState('');

  // States from current visual step
  const currentId = currentStepData?.currentNodeId;
  const frontierSet = new Set(currentStepData?.frontier?.map(item => 
    typeof item === 'object' ? item.id : item
  ) || []);
  const visitedSet = new Set(currentStepData?.visited || []);
  const finalPathSet = new Set(finalPath || []);

  const handleCanvasClick = (e) => {
    if (networkTool !== 'addNode') return;
    if (showAddNodeModal) return; // Block clicking when modal is open
    
    if (e.target.tagName === 'circle' || e.target.closest('.network-node-group')) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Suggest a default name based on count
    const defaultLabel = `City-${Object.keys(nodes).length + 1}`;
    
    setPendingNodeCoords({ x, y });
    setNewNodeName(defaultLabel);
    setAddNodeError('');
    setShowAddNodeModal(true);
    setSelectedEdge(null);
  };

  const handleConfirmAddNode = () => {
    const name = newNodeName.trim();
    if (!name) {
      setAddNodeError("City name cannot be empty!");
      return;
    }
    if (nodes[name]) {
      setAddNodeError("A city with this name already exists!");
      return;
    }
    
    onAddNode(name, pendingNodeCoords.x, pendingNodeCoords.y);
    setShowAddNodeModal(false);
    setNewNodeName('');
  };

  const handleCancelAddNode = () => {
    setShowAddNodeModal(false);
    setNewNodeName('');
  };

  const handleNodeClick = (e, nodeId) => {
    setSelectedEdge(null);
    e.stopPropagation();

    if (networkTool === 'setStart') {
      if (nodeId !== endNode) {
        setStartNode(nodeId);
        setSelectedNodeId(null);
      }
    } else if (networkTool === 'setEnd') {
      if (nodeId !== startNode) {
        setEndNode(nodeId);
        setSelectedNodeId(null);
      }
    } else if (networkTool === 'delete') {
      if (nodeId === startNode) setStartNode(null);
      if (nodeId === endNode) setEndNode(null);
      onDeleteNode(nodeId);
      setSelectedNodeId(null);
    } else if (networkTool === 'addEdge') {
      if (!selectedNodeId) {
        setSelectedNodeId(nodeId);
      } else if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      } else {
        const n1 = nodes[selectedNodeId];
        const n2 = nodes[nodeId];
        const dist = Math.round(Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2) / 10);
        
        onAddEdge(selectedNodeId, nodeId, dist || 1);
        setSelectedNodeId(null);
      }
    } else if (networkTool === 'addNode') {
      setSelectedNodeId(nodeId);
    }
  };

  const handleNodeMouseDown = (e, nodeId) => {
    if (networkTool !== 'addNode') return;
    dragNodeId.current = nodeId;
    e.preventDefault();
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragNodeId.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    const cleanX = Math.max(20, Math.min(rect.width - 20, x));
    const cleanY = Math.max(20, Math.min(rect.height - 20, y));

    onMoveNode(dragNodeId.current, cleanX, cleanY);
  };

  const handleCanvasMouseUp = () => {
    dragNodeId.current = null;
  };

  const handleEdgeClick = (e, fromId, toId) => {
    if (networkTool === 'delete') {
      onDeleteEdge(fromId, toId);
      setSelectedEdge(null);
    } else {
      setSelectedEdge({ from: fromId, to: toId });
      setSelectedNodeId(null);
    }
  };

  const getEdgeStyle = (from, to) => {
    const fromIdxInPath = finalPath?.indexOf(from);
    const toIdxInPath = finalPath?.indexOf(to);
    
    const isOnFinalRoute = 
      fromIdxInPath !== -1 && 
      toIdxInPath !== -1 && 
      Math.abs(fromIdxInPath - toIdxInPath) === 1;

    const isEdgeSelected = selectedEdge && (
      (selectedEdge.from === from && selectedEdge.to === to) ||
      (selectedEdge.from === to && selectedEdge.to === from)
    );

    if (isEdgeSelected) {
      return { stroke: 'var(--neon-pink)', strokeWidth: '4px', filter: 'drop-shadow(0 0 6px var(--neon-pink))' };
    }

    if (isOnFinalRoute) {
      return { stroke: 'var(--neon-gold)', strokeWidth: '4px', filter: 'drop-shadow(0 0 6px var(--neon-gold))' };
    }

    if (currentStepData?.parents?.[from] === to || currentStepData?.parents?.[to] === from) {
      return { stroke: 'var(--neon-cyan)', strokeWidth: '2.5px', strokeDasharray: '4 4' };
    }

    return { stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: '2px' };
  };

  return (
    <div className="navigator-canvas-container">
      {/* Network Toolbox */}
      <div className="canvas-tool-bar">
        <span className="tool-title">EDIT LANDMARK NETWORK MAP:</span>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${networkTool === 'addNode' ? 'active' : ''}`}
            onClick={() => { setNetworkTool('addNode'); setSelectedEdge(null); setSelectedNodeId(null); }}
            title="Click on canvas to add cities. Drag them to adjust positions."
          >
            Add/Move City
          </button>
          <button
            className={`tool-btn ${networkTool === 'addEdge' ? 'active' : ''}`}
            onClick={() => { setNetworkTool('addEdge'); setSelectedEdge(null); setSelectedNodeId(null); }}
            title="Click city A, then click city B to construct a road connection."
          >
            Connect Roads
          </button>
          <button
            className={`tool-btn ${networkTool === 'setStart' ? 'active' : ''}`}
            onClick={() => { setNetworkTool('setStart'); setSelectedEdge(null); setSelectedNodeId(null); }}
            title="Select city to set as starting GPS location."
          >
            Set Start
          </button>
          <button
            className={`tool-btn ${networkTool === 'setEnd' ? 'active' : ''}`}
            onClick={() => { setNetworkTool('setEnd'); setSelectedEdge(null); setSelectedNodeId(null); }}
            title="Select city to set as target destination."
          >
            Set End
          </button>
          <button
            className={`tool-btn ${networkTool === 'delete' ? 'active' : ''}`}
            onClick={() => { setNetworkTool('delete'); setSelectedEdge(null); setSelectedNodeId(null); }}
            title="Click on a city or road link to delete it from the system."
          >
            Delete Road/City
          </button>
        </div>
      </div>

      {/* SVG Canvas Board */}
      <div 
        className="network-canvas-wrapper"
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          width: '100%',
          height: '450px',
          background: 'rgba(10, 10, 16, 0.9)',
          border: '1px solid rgba(0, 242, 254, 0.15)',
          borderRadius: '8px',
          position: 'relative',
          cursor: networkTool === 'addNode' ? 'crosshair' : 'default',
          overflow: 'hidden'
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Render Edges (Roads) */}
          {edges.map((edge, idx) => {
            const n1 = nodes[edge.from];
            const n2 = nodes[edge.to];
            if (!n1 || !n2) return null;

            const midX = (n1.x + n2.x) / 2;
            const midY = (n1.y + n2.y) / 2;

            const style = getEdgeStyle(edge.from, edge.to);

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  style={style}
                  onClick={(e) => handleEdgeClick(e, edge.from, edge.to)}
                  className="network-road"
                />
                
                {/* Edge click capture area (wider invisible line) */}
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke="transparent"
                  strokeWidth="12"
                  style={{ cursor: networkTool === 'delete' ? 'pointer' : 'pointer' }}
                  onClick={(e) => handleEdgeClick(e, edge.from, edge.to)}
                />

                {/* Weight Text Label */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-14"
                    y="-9"
                    width="28"
                    height="16"
                    rx="3"
                    fill="var(--obsidian-deep)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.5"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--neon-pink)"
                    fontSize="10"
                    fontWeight="bold"
                    dy="1.5"
                  >
                    {edge.weight}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Nodes (Cities) */}
          {Object.entries(nodes).map(([id, node]) => {
            const isStart = id === startNode;
            const isEnd = id === endNode;
            
            const isActiveNode = id === currentId;
            const isFrontier = frontierSet.has(id);
            const isVisited = visitedSet.has(id);
            const isSelected = id === selectedNodeId;

            let circleStroke = 'rgba(255, 255, 255, 0.4)';
            let circleFill = 'var(--obsidian-deep)';
            let glowColor = 'none';

            if (isStart) {
              circleStroke = 'var(--neon-green)';
              circleFill = 'rgba(57, 255, 20, 0.2)';
              glowColor = 'var(--neon-green)';
            } else if (isEnd) {
              circleStroke = 'var(--neon-pink)';
              circleFill = 'rgba(255, 0, 127, 0.2)';
              glowColor = 'var(--neon-pink)';
            } else if (isActiveNode) {
              circleStroke = 'var(--neon-pink)';
              circleFill = 'rgba(255, 0, 127, 0.4)';
              glowColor = 'var(--neon-pink)';
            } else if (finalPathSet.has(id)) {
              circleStroke = 'var(--neon-gold)';
              circleFill = 'rgba(255, 215, 0, 0.3)';
              glowColor = 'var(--neon-gold)';
            } else if (isVisited) {
              circleStroke = 'var(--neon-cyan)';
              circleFill = 'rgba(0, 242, 254, 0.15)';
              glowColor = 'var(--neon-cyan)';
            } else if (isFrontier) {
              circleStroke = 'var(--neon-purple)';
              circleFill = 'rgba(188, 19, 254, 0.15)';
              glowColor = 'var(--neon-purple)';
            }

            if (isSelected) {
              circleStroke = 'white';
            }

            return (
              <g
                key={id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`network-node-group ${isActiveNode ? 'pulse-node' : ''}`}
                onClick={(e) => handleNodeClick(e, id)}
                onMouseDown={(e) => handleNodeMouseDown(e, id)}
                style={{ cursor: dragNodeId.current ? 'grabbing' : 'grab' }}
              >
                {/* Glow ring */}
                {glowColor !== 'none' && (
                  <circle
                    r="18"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="1.5"
                    opacity="0.5"
                    className="breathing-ring"
                  />
                )}

                {/* Node circle */}
                <circle
                  r="12"
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter={glowColor !== 'none' ? `drop-shadow(0 0 4px ${glowColor})` : ''}
                />

                {/* Label text */}
                <text
                  y="-18"
                  textAnchor="middle"
                  fill={isSelected ? 'white' : 'var(--neon-cyan)'}
                  fontSize="12"
                  fontWeight="bold"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.label}
                </text>

                {/* Distance indicators */}
                {currentStepData?.costs?.[id] && !isStart && !isEnd && (
                  <text
                    y="24"
                    textAnchor="middle"
                    fill="var(--neon-purple)"
                    fontSize="10"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    dist: {Math.round(currentStepData.costs[id].g)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Edge Inspector Card */}
        {selectedEdge && (
          <div className="edge-inspector-card" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedEdge(null)} 
              className="inspector-close-btn"
            >
              ✕
            </button>
            <div className="inspector-title">ROAD INSPECTOR</div>
            <div className="inspector-route">{selectedEdge.from} ⇄ {selectedEdge.to}</div>
            <div className="inspector-weight-control">
              <label>Distance / Travel Time:</label>
              <input 
                type="number"
                value={edges.find(e => 
                  (e.from === selectedEdge.from && e.to === selectedEdge.to) ||
                  (e.from === selectedEdge.to && e.to === selectedEdge.from)
                )?.weight ?? 1}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  onUpdateEdgeWeight(selectedEdge.from, selectedEdge.to, w);
                }}
                className="inspector-input"
              />
            </div>
            <button 
              onClick={() => {
                onDeleteEdge(selectedEdge.from, selectedEdge.to);
                setSelectedEdge(null);
              }} 
              className="inspector-delete-btn"
            >
              Delete Road
            </button>
          </div>
        )}

        {/* Custom Add City Modal Overlay */}
        {showAddNodeModal && (
          <div className="add-node-modal-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="add-node-modal-card">
              <div className="modal-title">Create New Landmark</div>
              <div className="modal-body">
                <label>City Name:</label>
                <input
                  type="text"
                  className="modal-input"
                  value={newNodeName}
                  onChange={(e) => {
                    setNewNodeName(e.target.value);
                    setAddNodeError('');
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmAddNode();
                    if (e.key === 'Escape') handleCancelAddNode();
                  }}
                />
                {addNodeError && <div className="modal-error">{addNodeError}</div>}
              </div>
              <div className="modal-actions">
                <button className="modal-btn confirm" onClick={handleConfirmAddNode}>
                  Add City
                </button>
                <button className="modal-btn cancel" onClick={handleCancelAddNode}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Tip overlays */}
        <div className="network-instructions-overlay">
          {networkTool === 'addNode' && <p>Click empty space to create a city landmark. Drag cities to reposition.</p>}
          {networkTool === 'addEdge' && <p>Select starting city, then destination city to link them with a road.</p>}
          {networkTool === 'setStart' && <p>Select city to set as starting GPS location (e.g. Delhi).</p>}
          {networkTool === 'setEnd' && <p>Select city to set as target travel destination (e.g. Bengaluru).</p>}
          {networkTool === 'delete' && <p>Click on any city or road link to delete it from the graph.</p>}
        </div>
      </div>
    </div>
  );
}
