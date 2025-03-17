import { Graph, Node, Edge, euclideanDistance, manhattanDistance, findEdge } from "./graphUtils";

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar';
export type HeuristicType = 'manhattan' | 'euclidean';

export interface AlgorithmResult {
  path: string[];
  pathEdges: string[];
  pathLength: number;
  pathCost: number;
  nodesVisited: number;
  executionTime: number;
}

export interface AlgorithmStepResult {
  currentNodeId: string | null;
  visited: string[];
  path: string[];
  pathEdges: string[];
  frontier: string[];
  isComplete: boolean;
}

export interface QueueItem {
  nodeId: string;
  path: string[];
  pathEdges: string[];
  cost: number;
  priority: number;
}

const getNeighbors = (graph: Graph, nodeId: string): { nodeId: string; weight: number }[] => {
  const adjacencyList: Record<string, Array<{nodeId: string, weight: number}>> = {};
  
  // Initialize empty arrays for all nodes
  graph.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  // Add edges to adjacency list
  graph.edges.forEach(edge => {
    if (edge.source === nodeId) {
      adjacencyList[edge.source].push({
        nodeId: edge.target,
        weight: edge.weight
      });
    }
    
    // For undirected edges, add the reverse connection
    if (edge.type === 'undirected' && edge.target === nodeId) {
      adjacencyList[edge.target].push({
        nodeId: edge.source,
        weight: edge.weight
      });
    }
  });
  
  return adjacencyList[nodeId] || [];
};

const reconstructPath = (
  graph: Graph,
  cameFrom: Map<string, string>,
  startNodeId: string,
  goalNodeId: string
): { path: string[]; pathEdges: string[] } => {
  const path: string[] = [goalNodeId];
  const pathEdges: string[] = [];
  let current = goalNodeId;

  while (current !== startNodeId) {
    const previous = cameFrom.get(current);
    if (!previous) break;
    
    path.unshift(previous);
    
    const edge = findEdge(graph, previous, current);
    if (edge) pathEdges.push(edge.id);
    
    current = previous;
  }

  return { path, pathEdges };
};

export const calculateHeuristic = (
  node: Node,
  goalNode: Node,
  heuristicType: HeuristicType
): number => {
  if (heuristicType === 'euclidean') {
    return euclideanDistance(node, goalNode);
  } else if (heuristicType === 'manhattan') {
    return manhattanDistance(node, goalNode);
  }
  return 0;
};

export const bfs = (
  graph: Graph,
  startNodeId: string,
  goalNodeId: string,
  onStep?: (stepResult: AlgorithmStepResult) => void
): AlgorithmResult => {
  const startTime = performance.now();
  
  const frontier: QueueItem[] = [{ 
    nodeId: startNodeId, 
    path: [startNodeId], 
    pathEdges: [], 
    cost: 0,
    priority: 0
  }];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  
  let nodesVisited = 0;
  let result: AlgorithmResult = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited: 0,
    executionTime: 0
  };
  
  while (frontier.length > 0) {
    const { nodeId, path, pathEdges, cost } = frontier.shift()!;
    
    if (nodeId === goalNodeId) {
      const endTime = performance.now();
      result = {
        path,
        pathEdges,
        pathLength: path.length,
        pathCost: cost,
        nodesVisited,
        executionTime: endTime - startTime
      };
      
      if (onStep) {
        onStep({
          currentNodeId: nodeId,
          visited: Array.from(visited),
          path,
          pathEdges,
          frontier: frontier.map(item => item.nodeId),
          isComplete: true
        });
      }
      
      return result;
    }
    
    if (visited.has(nodeId)) continue;
    
    visited.add(nodeId);
    nodesVisited++;
    
    if (onStep) {
      onStep({
        currentNodeId: nodeId,
        visited: Array.from(visited),
        path,
        pathEdges,
        frontier: frontier.map(item => item.nodeId),
        isComplete: false
      });
    }
    
    const neighbors = getNeighbors(graph, nodeId);
    
    for (const { nodeId: neighborId, weight } of neighbors) {
      if (!visited.has(neighborId)) {
        cameFrom.set(neighborId, nodeId);
        
        const edge = findEdge(graph, nodeId, neighborId);
        const newPathEdges = edge ? [...pathEdges, edge.id] : pathEdges;
        
        frontier.push({
          nodeId: neighborId,
          path: [...path, neighborId],
          pathEdges: newPathEdges,
          cost: cost + weight,
          priority: 0
        });
      }
    }
  }
  
  const endTime = performance.now();
  result = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited,
    executionTime: endTime - startTime
  };
  
  if (onStep) {
    onStep({
      currentNodeId: null,
      visited: Array.from(visited),
      path: [],
      pathEdges: [],
      frontier: [],
      isComplete: true
    });
  }
  
  return result;
};

export const dfs = (
  graph: Graph,
  startNodeId: string,
  goalNodeId: string,
  onStep?: (stepResult: AlgorithmStepResult) => void
): AlgorithmResult => {
  const startTime = performance.now();
  
  const frontier: QueueItem[] = [{ 
    nodeId: startNodeId, 
    path: [startNodeId], 
    pathEdges: [], 
    cost: 0,
    priority: 0
  }];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  
  let nodesVisited = 0;
  let result: AlgorithmResult = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited: 0,
    executionTime: 0
  };
  
  while (frontier.length > 0) {
    const { nodeId, path, pathEdges, cost } = frontier.pop()!;
    
    if (nodeId === goalNodeId) {
      const endTime = performance.now();
      result = {
        path,
        pathEdges,
        pathLength: path.length,
        pathCost: cost,
        nodesVisited,
        executionTime: endTime - startTime
      };
      
      if (onStep) {
        onStep({
          currentNodeId: nodeId,
          visited: Array.from(visited),
          path,
          pathEdges,
          frontier: frontier.map(item => item.nodeId),
          isComplete: true
        });
      }
      
      return result;
    }
    
    if (visited.has(nodeId)) continue;
    
    visited.add(nodeId);
    nodesVisited++;
    
    if (onStep) {
      onStep({
        currentNodeId: nodeId,
        visited: Array.from(visited),
        path,
        pathEdges,
        frontier: frontier.map(item => item.nodeId),
        isComplete: false
      });
    }
    
    const neighbors = getNeighbors(graph, nodeId);
    
    for (const { nodeId: neighborId, weight } of neighbors) {
      if (!visited.has(neighborId)) {
        cameFrom.set(neighborId, nodeId);
        
        const edge = findEdge(graph, nodeId, neighborId);
        const newPathEdges = edge ? [...pathEdges, edge.id] : pathEdges;
        
        frontier.push({
          nodeId: neighborId,
          path: [...path, neighborId],
          pathEdges: newPathEdges,
          cost: cost + weight,
          priority: 0
        });
      }
    }
  }
  
  const endTime = performance.now();
  result = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited,
    executionTime: endTime - startTime
  };
  
  if (onStep) {
    onStep({
      currentNodeId: null,
      visited: Array.from(visited),
      path: [],
      pathEdges: [],
      frontier: [],
      isComplete: true
    });
  }
  
  return result;
};

export const dijkstra = (
  graph: Graph,
  startNodeId: string,
  goalNodeId: string,
  onStep?: (stepResult: AlgorithmStepResult) => void
): AlgorithmResult => {
  const startTime = performance.now();
  
  const frontier: QueueItem[] = [{ 
    nodeId: startNodeId, 
    path: [startNodeId], 
    pathEdges: [], 
    cost: 0,
    priority: 0
  }];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const costSoFar = new Map<string, number>();
  
  costSoFar.set(startNodeId, 0);
  let nodesVisited = 0;
  
  let result: AlgorithmResult = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited: 0,
    executionTime: 0
  };
  
  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    
    const { nodeId, path, pathEdges, cost } = frontier.shift()!;
    
    if (nodeId === goalNodeId) {
      const endTime = performance.now();
      result = {
        path,
        pathEdges,
        pathLength: path.length,
        pathCost: cost,
        nodesVisited,
        executionTime: endTime - startTime
      };
      
      if (onStep) {
        onStep({
          currentNodeId: nodeId,
          visited: Array.from(visited),
          path,
          pathEdges,
          frontier: frontier.map(item => item.nodeId),
          isComplete: true
        });
      }
      
      return result;
    }
    
    if (visited.has(nodeId)) continue;
    
    visited.add(nodeId);
    nodesVisited++;
    
    if (onStep) {
      onStep({
        currentNodeId: nodeId,
        visited: Array.from(visited),
        path,
        pathEdges,
        frontier: frontier.map(item => item.nodeId),
        isComplete: false
      });
    }
    
    const neighbors = getNeighbors(graph, nodeId);
    
    for (const { nodeId: neighborId, weight } of neighbors) {
      const newCost = cost + weight;
      
      if (!costSoFar.has(neighborId) || newCost < costSoFar.get(neighborId)!) {
        costSoFar.set(neighborId, newCost);
        cameFrom.set(neighborId, nodeId);
        
        const edge = findEdge(graph, nodeId, neighborId);
        const newPathEdges = edge ? [...pathEdges, edge.id] : pathEdges;
        
        frontier.push({
          nodeId: neighborId,
          path: [...path, neighborId],
          pathEdges: newPathEdges,
          cost: newCost,
          priority: newCost
        });
      }
    }
  }
  
  const endTime = performance.now();
  result = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited,
    executionTime: endTime - startTime
  };
  
  if (onStep) {
    onStep({
      currentNodeId: null,
      visited: Array.from(visited),
      path: [],
      pathEdges: [],
      frontier: [],
      isComplete: true
    });
  }
  
  return result;
};

export const astar = (
  graph: Graph,
  startNodeId: string,
  goalNodeId: string,
  heuristicType: HeuristicType = 'euclidean',
  onStep?: (stepResult: AlgorithmStepResult) => void
): AlgorithmResult => {
  const startTime = performance.now();
  
  const startNode = graph.nodes.find(node => node.id === startNodeId);
  const goalNode = graph.nodes.find(node => node.id === goalNodeId);
  
  if (!startNode || !goalNode) {
    return {
      path: [],
      pathEdges: [],
      pathLength: 0,
      pathCost: 0,
      nodesVisited: 0,
      executionTime: 0
    };
  }
  
  const frontier: QueueItem[] = [{ 
    nodeId: startNodeId, 
    path: [startNodeId], 
    pathEdges: [], 
    cost: 0,
    priority: calculateHeuristic(startNode, goalNode, heuristicType)
  }];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const costSoFar = new Map<string, number>();
  
  costSoFar.set(startNodeId, 0);
  let nodesVisited = 0;
  
  let result: AlgorithmResult = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited: 0,
    executionTime: 0
  };
  
  while (frontier.length > 0) {
    frontier.sort((a, b) => a.priority - b.priority);
    
    const { nodeId, path, pathEdges, cost } = frontier.shift()!;
    
    if (nodeId === goalNodeId) {
      const endTime = performance.now();
      result = {
        path,
        pathEdges,
        pathLength: path.length,
        pathCost: cost,
        nodesVisited,
        executionTime: endTime - startTime
      };
      
      if (onStep) {
        onStep({
          currentNodeId: nodeId,
          visited: Array.from(visited),
          path,
          pathEdges,
          frontier: frontier.map(item => item.nodeId),
          isComplete: true
        });
      }
      
      return result;
    }
    
    if (visited.has(nodeId)) continue;
    
    visited.add(nodeId);
    nodesVisited++;
    
    if (onStep) {
      onStep({
        currentNodeId: nodeId,
        visited: Array.from(visited),
        path,
        pathEdges,
        frontier: frontier.map(item => item.nodeId),
        isComplete: false
      });
    }
    
    const neighbors = getNeighbors(graph, nodeId);
    
    for (const { nodeId: neighborId, weight } of neighbors) {
      const newCost = (costSoFar.get(nodeId) || 0) + weight;
      
      if (!costSoFar.has(neighborId) || newCost < costSoFar.get(neighborId)!) {
        costSoFar.set(neighborId, newCost);
        cameFrom.set(neighborId, nodeId);
        
        const neighborNode = graph.nodes.find(node => node.id === neighborId);
        
        if (neighborNode) {
          const edge = findEdge(graph, nodeId, neighborId);
          const newPathEdges = edge ? [...pathEdges, edge.id] : pathEdges;
          
          const priority = newCost + calculateHeuristic(neighborNode, goalNode, heuristicType);
          
          frontier.push({
            nodeId: neighborId,
            path: [...path, neighborId],
            pathEdges: newPathEdges,
            cost: newCost,
            priority
          });
        }
      }
    }
  }
  
  const endTime = performance.now();
  result = {
    path: [],
    pathEdges: [],
    pathLength: 0,
    pathCost: 0,
    nodesVisited,
    executionTime: endTime - startTime
  };
  
  if (onStep) {
    onStep({
      currentNodeId: null,
      visited: Array.from(visited),
      path: [],
      pathEdges: [],
      frontier: [],
      isComplete: true
    });
  }
  
  return result;
};

export const runAlgorithm = (
  graph: Graph,
  startNodeId: string,
  goalNodeId: string,
  algorithmType: AlgorithmType,
  heuristicType: HeuristicType = 'euclidean',
  onStep?: (stepResult: AlgorithmStepResult) => void
): AlgorithmResult => {
  switch (algorithmType) {
    case 'bfs':
      return bfs(graph, startNodeId, goalNodeId, onStep);
    case 'dfs':
      return dfs(graph, startNodeId, goalNodeId, onStep);
    case 'dijkstra':
      return dijkstra(graph, startNodeId, goalNodeId, onStep);
    case 'astar':
      return astar(graph, startNodeId, goalNodeId, heuristicType, onStep);
    default:
      return {
        path: [],
        pathEdges: [],
        pathLength: 0,
        pathCost: 0,
        nodesVisited: 0,
        executionTime: 0
      };
  }
};
