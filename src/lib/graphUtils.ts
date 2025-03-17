
import { v4 as uuidv4 } from 'uuid';

export interface Node {
  id: string;
  x: number;
  y: number;
  label?: string;
  type: 'default' | 'start' | 'goal' | 'visited' | 'path';
  shape?: 'circle' | 'square';
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'default' | 'path' | 'undirected';
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

// Helper function to calculate Manhattan distance between two nodes
export const manhattanDistance = (node1: Node, node2: Node): number => {
  return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
};

// Helper function to calculate Euclidean distance between two nodes
export const euclideanDistance = (node1: Node, node2: Node): number => {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to find an edge between two nodes
export const findEdge = (graph: Graph, sourceId: string, targetId: string): Edge | undefined => {
  return graph.edges.find(
    edge => (edge.source === sourceId && edge.target === targetId) ||
           (edge.type === 'undirected' && edge.source === targetId && edge.target === sourceId)
  );
};

export const createEmptyGraph = (): Graph => {
  return {
    nodes: [],
    edges: []
  };
};

// Node counter to track node numbers
let nodeCounter = 1;

export const addNode = (graph: Graph, position: { x: number; y: number }, shape: 'circle' | 'square' = 'circle'): Graph => {
  const newNode: Node = {
    id: `node-${uuidv4().split('-')[0]}`,
    x: position.x,
    y: position.y,
    label: `Node ${nodeCounter}`,  // Changed to use sequential numbering
    type: 'default',
    shape: shape
  };
  
  // Increment the counter
  nodeCounter++;
  
  return {
    ...graph,
    nodes: [...graph.nodes, newNode]
  };
};

export const addEdge = (graph: Graph, source: string, target: string, weight: number = 1, type: 'default' | 'undirected' = 'default'): Graph => {
  // Check if edge already exists
  const existingEdge = graph.edges.find(
    edge => (edge.source === source && edge.target === target) || 
           (type === 'undirected' && edge.source === target && edge.target === source)
  );
  
  if (existingEdge) {
    return graph;
  }
  
  const newEdge: Edge = {
    id: `edge-${uuidv4().split('-')[0]}`,
    source,
    target,
    weight,
    type
  };
  
  return {
    ...graph,
    edges: [...graph.edges, newEdge]
  };
};

export const setNodeType = (graph: Graph, nodeId: string, type: Node['type']): Graph => {
  return {
    ...graph,
    nodes: graph.nodes.map(node =>
      node.id === nodeId ? { ...node, type } : node
    )
  };
};

export const setEdgeType = (graph: Graph, edgeId: string, type: Edge['type']): Graph => {
  return {
    ...graph,
    edges: graph.edges.map(edge =>
      edge.id === edgeId ? { ...edge, type } : edge
    )
  };
};

// Reset node counter when generating a sample graph
export const generateSampleGraph = (): Graph => {
  // Reset counter when generating a sample graph
  nodeCounter = 1;
  
  const graph = createEmptyGraph();
  
  let updatedGraph = addNode(graph, { x: 150, y: 150 });
  updatedGraph = addNode(updatedGraph, { x: 300, y: 100 });
  updatedGraph = addNode(updatedGraph, { x: 450, y: 150 });
  updatedGraph = addNode(updatedGraph, { x: 150, y: 300 });
  updatedGraph = addNode(updatedGraph, { x: 450, y: 300 });
  updatedGraph = addNode(updatedGraph, { x: 300, y: 400 });
  
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[0].id, updatedGraph.nodes[1].id, 2);
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[1].id, updatedGraph.nodes[2].id, 3);
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[0].id, updatedGraph.nodes[3].id, 4);
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[2].id, updatedGraph.nodes[4].id, 5);
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[3].id, updatedGraph.nodes[5].id, 6);
  updatedGraph = addEdge(updatedGraph, updatedGraph.nodes[4].id, updatedGraph.nodes[5].id, 7);
  
  updatedGraph = setNodeType(updatedGraph, updatedGraph.nodes[0].id, 'start');
  updatedGraph = setNodeType(updatedGraph, updatedGraph.nodes[5].id, 'goal');
  
  return updatedGraph;
};

export const updateEdgeWeight = (graph: Graph, edgeId: string, weight: number): Graph => {
  return {
    ...graph,
    edges: graph.edges.map(edge => 
      edge.id === edgeId ? { ...edge, weight } : edge
    )
  };
};

export const deleteNode = (graph: Graph, nodeId: string): Graph => {
  const filteredEdges = graph.edges.filter(
    edge => edge.source !== nodeId && edge.target !== nodeId
  );
  
  return {
    nodes: graph.nodes.filter(node => node.id !== nodeId),
    edges: filteredEdges
  };
};

// Reset node counter
export const resetNodeCounter = (): void => {
  nodeCounter = 1;
};

// Function to help algorithms
export const getAdjacencyList = (graph: Graph, nodeId?: string): Record<string, Array<{nodeId: string, weight: number}>> => {
  const adjacencyList: Record<string, Array<{nodeId: string, weight: number}>> = {};
  
  // Initialize empty arrays for all nodes
  graph.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  // Add edges to adjacency list
  graph.edges.forEach(edge => {
    adjacencyList[edge.source].push({
      nodeId: edge.target,
      weight: edge.weight
    });
    
    // For undirected edges, add the reverse connection
    if (edge.type === 'undirected') {
      adjacencyList[edge.target].push({
        nodeId: edge.source,
        weight: edge.weight
      });
    }
  });
  
  // If a specific nodeId is provided, return just its adjacency list
  if (nodeId) {
    return adjacencyList[nodeId] || [];
  }
  
  return adjacencyList;
};
