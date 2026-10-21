import React, { useState, useEffect, useRef } from 'react';
import { Graph } from './dsa/Graph';
import { BFSFinder } from './dsa/BFS';
import { DFSFinder } from './dsa/DFS';
import { DijkstraFinder } from './dsa/Dijkstra';
import { BellmanFordFinder } from './dsa/BellmanFord';
import { FloydWarshallFinder } from './dsa/FloydWarshall';

import DashboardHUD from './components/DashboardHUD';
import NavigatorNetwork from './components/NavigatorNetwork';
import DataStructureInspector from './components/DataStructureInspector';
import CodeTraceViewer from './components/CodeTraceViewer';

// Default network landmarks configuration (Major Indian Cities)
const DEFAULT_NETWORK_NODES = {
  'Delhi': { label: 'Delhi', x: 300, y: 60 },
  'Mumbai': { label: 'Mumbai', x: 80, y: 260 },
  'Kolkata': { label: 'Kolkata', x: 580, y: 190 },
  'Hyderabad': { label: 'Hyderabad', x: 300, y: 280 },
  'Bengaluru': { label: 'Bengaluru', x: 180, y: 390 },
  'Chennai': { label: 'Chennai', x: 420, y: 390 }
};

const DEFAULT_NETWORK_EDGES = [
  { from: 'Delhi', to: 'Mumbai', weight: 14 },
  { from: 'Delhi', to: 'Kolkata', weight: 15 },
  { from: 'Delhi', to: 'Hyderabad', weight: 12 },
  { from: 'Mumbai', to: 'Hyderabad', weight: 7 },
  { from: 'Mumbai', to: 'Bengaluru', weight: 10 },
  { from: 'Kolkata', to: 'Hyderabad', weight: 12 },
  { from: 'Kolkata', to: 'Chennai', weight: 16 },
  { from: 'Hyderabad', to: 'Bengaluru', weight: 6 },
  { from: 'Hyderabad', to: 'Chennai', weight: 6 },
  { from: 'Bengaluru', to: 'Chennai', weight: 4 }
];

export default function App() {
  const [algo, setAlgo] = useState('bfs'); 
  const [speed, setSpeed] = useState(250); 
  const [isPlaying, setIsPlaying] = useState(false);

  // Network Data States
  const [networkNodes, setNetworkNodes] = useState(DEFAULT_NETWORK_NODES);
  const [networkEdges, setNetworkEdges] = useState(DEFAULT_NETWORK_EDGES);
  const [networkStart, setNetworkStart] = useState('Delhi');
  const [networkEnd, setNetworkEnd] = useState('Bengaluru');

  // Pathfinder Visual States
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [finalPath, setFinalPath] = useState([]);
  const playInterval = useRef(null);

  useEffect(() => {
    recalculatePath();
  }, [algo, networkNodes, networkEdges, networkStart, networkEnd]);

  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(playInterval.current);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(playInterval.current);
    }

    return () => clearInterval(playInterval.current);
  }, [isPlaying, steps, speed]);

  const recalculatePath = () => {
    setIsPlaying(false);
    setStepIndex(0);

    let graph = new Graph();
    let solver = null;
    let start = networkStart;
    let end = networkEnd;

    graph.isGrid = false;
    for (const [id, node] of Object.entries(networkNodes)) {
      graph.addNode(id, node.x, node.y, false, 1);
    }
    for (const edge of networkEdges) {
      graph.addEdge(edge.from, edge.to, edge.weight);
    }

    if (!graph.nodes.has(start) || !graph.nodes.has(end)) {
      setSteps([]);
      setFinalPath([]);
      return;
    }

    switch (algo) {
      case 'bfs':
        solver = new BFSFinder(graph, start, end);
        break;
      case 'dfs':
        solver = new DFSFinder(graph, start, end);
        break;
      case 'dijkstra':
        solver = new DijkstraFinder(graph, start, end);
        break;
      case 'bellmanford':
        solver = new BellmanFordFinder(graph, start, end);
        break;
      case 'floydwarshall':
        solver = new FloydWarshallFinder(graph, start, end);
        break;
      default:
        solver = new BFSFinder(graph, start, end);
    }

    const calculatedSteps = solver.solve();
    setSteps(calculatedSteps);

    if (calculatedSteps.length > 0) {
      const lastStep = calculatedSteps[calculatedSteps.length - 1];
      const route = solver.reconstructPath(lastStep.parents);
      setFinalPath(route);
    } else {
      setFinalPath([]);
    }
  };

  const handlePlayPause = () => {
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleClearPathOnly = () => {
    setIsPlaying(false);
    setStepIndex(0);
    recalculatePath();
  };

  const handleClearAll = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setNetworkNodes({});
    setNetworkEdges([]);
    setNetworkStart(null);
    setNetworkEnd(null);
    setSteps([]);
    setFinalPath([]);
  };

  const handleAddNetworkNode = (label, x, y) => {
    setNetworkNodes(prev => ({
      ...prev,
      [label]: { label, x, y }
    }));
    if (!networkStart) setNetworkStart(label);
    else if (!networkEnd) setNetworkEnd(label);
  };

  const handleAddNetworkEdge = (from, to, weight) => {
    const exists = networkEdges.some(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (exists) return;

    setNetworkEdges(prev => [...prev, { from, to, weight: Number(weight) }]);
  };

  const handleDeleteNetworkNode = (id) => {
    setNetworkNodes(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setNetworkEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (networkStart === id) setNetworkStart(null);
    if (networkEnd === id) setNetworkEnd(null);
  };

  const handleDeleteNetworkEdge = (from, to) => {
    setNetworkEdges(prev => prev.filter(e => 
      !((e.from === from && e.to === to) || (e.from === to && e.to === from))
    ));
  };

  const handleMoveNetworkNode = (id, x, y) => {
    setNetworkNodes(prev => ({
      ...prev,
      [id]: { ...prev[id], x, y }
    }));
  };

  const handleUpdateNetworkEdgeWeight = (from, to, weight) => {
    setNetworkEdges(prev => prev.map(e => {
      if ((e.from === from && e.to === to) || (e.from === to && e.to === from)) {
        return { ...e, weight };
      }
      return e;
    }));
  };

  const handleLoadPreset = (presetName) => {
    setIsPlaying(false);
    setStepIndex(0);

    if (presetName === 'metro') {
      const nodes = {
        'Delhi': { label: 'Delhi', x: 300, y: 60 },
        'Mumbai': { label: 'Mumbai', x: 80, y: 260 },
        'Kolkata': { label: 'Kolkata', x: 580, y: 190 },
        'Hyderabad': { label: 'Hyderabad', x: 300, y: 280 },
        'Bengaluru': { label: 'Bengaluru', x: 180, y: 390 },
        'Chennai': { label: 'Chennai', x: 420, y: 390 }
      };
      const edges = [
        { from: 'Delhi', to: 'Mumbai', weight: 14 },
        { from: 'Delhi', to: 'Kolkata', weight: 15 },
        { from: 'Delhi', to: 'Hyderabad', weight: 12 },
        { from: 'Mumbai', to: 'Hyderabad', weight: 7 },
        { from: 'Mumbai', to: 'Bengaluru', weight: 10 },
        { from: 'Kolkata', to: 'Hyderabad', weight: 12 },
        { from: 'Kolkata', to: 'Chennai', weight: 16 },
        { from: 'Hyderabad', to: 'Bengaluru', weight: 6 },
        { from: 'Hyderabad', to: 'Chennai', weight: 6 },
        { from: 'Bengaluru', to: 'Chennai', weight: 4 }
      ];
      setNetworkNodes(nodes);
      setNetworkEdges(edges);
      setNetworkStart('Delhi');
      setNetworkEnd('Bengaluru');
    } else if (presetName === 'highway') {
      const nodes = {
        'Amritsar': { label: 'Amritsar', x: 100, y: 225 },
        'Jalandhar': { label: 'Jalandhar', x: 350, y: 95 },
        'Ludhiana': { label: 'Ludhiana', x: 350, y: 355 },
        'Chandigarh': { label: 'Chandigarh', x: 600, y: 225 }
      };
      const edges = [
        { from: 'Amritsar', to: 'Jalandhar', weight: 80 },
        { from: 'Amritsar', to: 'Ludhiana', weight: 140 },
        { from: 'Jalandhar', to: 'Chandigarh', weight: 150 },
        { from: 'Ludhiana', to: 'Chandigarh', weight: 100 },
        { from: 'Jalandhar', to: 'Ludhiana', weight: 60 }
      ];
      setNetworkNodes(nodes);
      setNetworkEdges(edges);
      setNetworkStart('Amritsar');
      setNetworkEnd('Chandigarh');
    } else if (presetName === 'star') {
      const nodes = {
        'Nagpur': { label: 'Nagpur (Hub)', x: 350, y: 225 },
        'Delhi': { label: 'Delhi', x: 350, y: 55 },
        'Kolkata': { label: 'Kolkata', x: 550, y: 145 },
        'Chennai': { label: 'Chennai', x: 480, y: 355 },
        'Mumbai': { label: 'Mumbai', x: 220, y: 355 },
        'Ahmedabad': { label: 'Ahmedabad', x: 150, y: 145 }
      };
      const edges = [
        { from: 'Nagpur', to: 'Delhi', weight: 8 },
        { from: 'Nagpur', to: 'Kolkata', weight: 10 },
        { from: 'Nagpur', to: 'Chennai', weight: 11 },
        { from: 'Nagpur', to: 'Mumbai', weight: 7 },
        { from: 'Nagpur', to: 'Ahmedabad', weight: 8 },
        { from: 'Delhi', to: 'Kolkata', weight: 15 },
        { from: 'Kolkata', to: 'Chennai', weight: 16 },
        { from: 'Chennai', to: 'Mumbai', weight: 13 },
        { from: 'Mumbai', to: 'Ahmedabad', weight: 5 },
        { from: 'Ahmedabad', to: 'Delhi', weight: 9 }
      ];
      setNetworkNodes(nodes);
      setNetworkEdges(edges);
      setNetworkStart('Delhi');
      setNetworkEnd('Chennai');
    } else if (presetName === 'negcycle') {
      const nodes = {
        'Delhi': { label: 'Delhi', x: 100, y: 225 },
        'Jaipur': { label: 'Jaipur', x: 300, y: 105 },
        'Agra': { label: 'Agra', x: 300, y: 345 },
        'Lucknow': { label: 'Lucknow', x: 500, y: 225 }
      };
      const edges = [
        { from: 'Delhi', to: 'Jaipur', weight: 5 },
        { from: 'Delhi', to: 'Agra', weight: 8 },
        { from: 'Jaipur', to: 'Agra', weight: -15 }, // Loop cycle Jaipur-Agra-Jaipur has negative weight
        { from: 'Agra', to: 'Lucknow', weight: 3 },
        { from: 'Jaipur', to: 'Lucknow', weight: 2 }
      ];
      setNetworkNodes(nodes);
      setNetworkEdges(edges);
      setNetworkStart('Delhi');
      setNetworkEnd('Lucknow');
    }
  };

  const getStats = () => {
    const currentStep = steps[stepIndex] || null;
    let pathCost = 0;
    let pathLength = 0;

    const isFinished = stepIndex === steps.length - 1 && steps.length > 0;
    
    if (isFinished && finalPath.length > 0) {
      pathLength = finalPath.length;

      if (algo === 'floydwarshall' && currentStep?.matrix) {
        pathCost = currentStep.matrix[networkStart]?.[networkEnd] ?? Infinity;
      } else if (algo === 'bellmanford' && currentStep?.hasNegativeCycle) {
        pathCost = -Infinity;
      } else {
        for (let i = 0; i < finalPath.length - 1; i++) {
          const u = finalPath[i];
          const v = finalPath[i + 1];
          const edge = networkEdges.find(e => 
            (e.from === u && e.to === v) || (e.from === v && e.to === u)
          );
          if (edge) pathCost += edge.weight;
        }
      }
    } else {
      if (algo === 'floydwarshall') {
        pathCost = currentStep?.matrix?.[networkStart]?.[networkEnd] ?? Infinity;
      } else {
        pathCost = currentStep?.costs?.[networkEnd]?.g ?? Infinity;
      }
      pathLength = 0;
    }

    return {
      pathCost: pathCost,
      visitedCount: currentStep?.visited?.length || 0,
      pathLength: pathLength,
      totalSteps: steps.length,
      currentStep: steps.length > 0 ? stepIndex + 1 : 0
    };
  };

  const currentStep = steps[stepIndex] || null;
  let activeDescription = currentStep?.description || '';

  // If simulation is completed, override description with a clean GPS turn-by-turn route directions log
  if (stepIndex === steps.length - 1 && finalPath.length > 0 && algo !== 'floydwarshall' && !currentStep?.hasNegativeCycle) {
    const route = [...finalPath];
    const directions = [`GPS Navigation Route starting from ${route[0]}:`];
    for (let i = 0; i < route.length - 1; i++) {
      const u = route[i];
      const v = route[i+1];
      const edge = networkEdges.find(e => 
        (e.from === u && e.to === v) || (e.from === v && e.to === u)
      );
      directions.push(`Proceed to ${v} (${edge ? edge.weight : 0} km)`);
    }
    directions.push(`Destination reached at ${route[route.length-1]}. Total Distance: ${getStats().pathCost} km.`);
    activeDescription = directions.join(' ➔ ');
  }

  return (
    <div className="app-container">
      <DashboardHUD
        selectedAlgo={algo}
        setSelectedAlgo={setAlgo}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        speed={speed}
        setSpeed={setSpeed}
        onLoadPreset={handleLoadPreset}
        stats={getStats()}
        onClearPath={handleClearPathOnly}
        onClearAll={handleClearAll}
      />

      <div className="main-viewport">
        <NavigatorNetwork
          nodes={networkNodes}
          edges={networkEdges}
          startNode={networkStart}
          endNode={networkEnd}
          setStartNode={setNetworkStart}
          setEndNode={setNetworkEnd}
          currentStepData={currentStep}
          finalPath={stepIndex === steps.length - 1 ? finalPath : []}
          onAddNode={handleAddNetworkNode}
          onAddEdge={handleAddNetworkEdge}
          onDeleteNode={handleDeleteNetworkNode}
          onDeleteEdge={handleDeleteNetworkEdge}
          onMoveNode={handleMoveNetworkNode}
          onUpdateEdgeWeight={handleUpdateNetworkEdgeWeight}
        />

        <div className="info-deck-grid">
          <DataStructureInspector
            selectedAlgo={algo}
            currentStepData={currentStep}
          />
          <CodeTraceViewer
            selectedAlgo={algo}
            currentLine={currentStep?.highlightLine || 0}
            description={activeDescription}
          />
        </div>
      </div>
    </div>
  );
}
