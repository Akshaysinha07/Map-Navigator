import React from 'react';

export default function DashboardHUD({
  selectedAlgo,
  setSelectedAlgo,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  speed,
  setSpeed,
  onLoadPreset,
  stats,
  onClearPath,
  onClearAll
}) {
  const algos = [
    { id: 'bfs', name: 'BFS (Breadth-First)', desc: 'Layer-by-layer unweighted search (shortest steps).' },
    { id: 'dfs', name: 'DFS (Depth-First)', desc: 'Backtracking-based search (non-optimal path).' },
    { id: 'dijkstra', name: 'Dijkstra', desc: 'Weighted cost-only search (guaranteed shortest path).' },
    { id: 'bellmanford', name: 'Bellman-Ford', desc: 'Weighted search supporting negative weights and cycle checks.' },
    { id: 'floydwarshall', name: 'Floyd-Warshall', desc: 'All-pairs shortest paths. Displays dynamic programming matrices.' }
  ];

  return (
    <div className="dashboard-hud">
      {/* Platform Title */}
      <div className="hud-header">
        <div className="glitch-title" data-text="MAP NAVIGATOR">MAP NAVIGATOR</div>
        <div className="hud-subtitle">GRAPH PATHFINDING ANALYZER</div>
      </div>

      {/* Algorithm Selector */}
      <div className="hud-section">
        <label className="hud-label">PATHFINDING ALGORITHM</label>
        <div className="algo-select-wrapper">
          <select 
            value={selectedAlgo} 
            onChange={(e) => setSelectedAlgo(e.target.value)}
            className="hud-select"
          >
            {algos.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <p className="algo-description">
          {algos.find(a => a.id === selectedAlgo)?.desc}
        </p>
      </div>

      {/* Simulation Controls */}
      <div className="hud-section">
        <label className="hud-label">SIMULATION PLAYBACK</label>
        <div className="playback-controls">
          <button onClick={onStepBackward} className="playback-btn" title="Step Backward">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          
          <button onClick={onPlayPause} className={`playback-btn play-pause-btn ${isPlaying ? 'playing' : ''}`} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button onClick={onStepForward} className="playback-btn" title="Step Forward">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>

          <button onClick={onReset} className="playback-btn" title="Reset Path">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="speed-slider-container">
          <div className="speed-labels">
            <span>Interval Delay:</span>
            <span className="speed-value">{speed}ms</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="1000" 
            step="20"
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="hud-slider"
          />
        </div>
      </div>

      {/* Preset Maps */}
      <div className="hud-section">
        <label className="hud-label">MAP PRESETS</label>
        <div className="preset-grid">
          <button onClick={() => onLoadPreset('metro')} className="preset-btn">Major Cities</button>
          <button onClick={() => onLoadPreset('highway')} className="preset-btn">Highway Grid</button>
          <button onClick={() => onLoadPreset('star')} className="preset-btn">Star Network</button>
          <button onClick={() => onLoadPreset('negcycle')} className="preset-btn text-neon-pink">Negative Cycle</button>
        </div>
      </div>

      {/* Map Cleanup */}
      <div className="hud-section clear-buttons-group">
        <button onClick={onClearPath} className="clear-btn secondary">Clear Navigation Route</button>
        <button onClick={onClearAll} className="clear-btn hazard">Wipe Entire Map</button>
      </div>

      {/* Stats Panel */}
      <div className="hud-section stats-hud-panel">
        <label className="hud-label">NAVIGATION STATS</label>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-name">Route Cost</div>
            <div className="stat-value text-neon-gold">
              {stats.pathCost === Infinity ? 'Unreachable' : stats.pathCost.toFixed(1)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-name">Nodes Visited</div>
            <div className="stat-value text-neon-cyan">{stats.visitedCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-name">Path Stops</div>
            <div className="stat-value text-neon-purple">{stats.pathLength}</div>
          </div>
          <div className="stat-card">
            <div className="stat-name">Visual Step</div>
            <div className="stat-value text-neon-pink">
              {stats.currentStep} / {stats.totalSteps}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
