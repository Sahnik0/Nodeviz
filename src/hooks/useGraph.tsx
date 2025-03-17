import { useState, useCallback, useRef } from 'react';
import { 
  Graph, Node, Edge, createEmptyGraph, addNode, addEdge, 
  setNodeType, setEdgeType, generateSampleGraph, deleteNode, updateEdgeWeight
} from '@/lib/graphUtils';
import { moveNode } from '@/lib/graphUtilsExtension';

type GraphAction = {
  type: 'add-node' | 'add-edge' | 'set-start' | 'set-goal' | 'delete-node' | 'update-edge-weight' | 'move-node';
  data: any;
  prevGraph: Graph;
};

interface UseGraphResult {
  graph: Graph;
  startNodeId: string | null;
  goalNodeId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isCreatingEdge: boolean;
  isEditingEdge: boolean;
  currentEditEdgeId: string | null;
  addNewNode: (x: number, y: number, shape?: 'circle' | 'square') => void;
  addNewEdge: (sourceId: string, targetId: string, weight?: number, type?: 'default' | 'undirected') => void;
  setStartNode: (nodeId: string) => void;
  setGoalNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  startEdgeCreation: () => void;
  finishEdgeCreation: () => void;
  resetGraph: () => void;
  loadSampleGraph: () => void;
  resetNodeTypes: () => void;
  updateNodeType: (nodeId: string, type: Node['type']) => void;
  updateEdgeType: (edgeId: string, type: Edge['type']) => void;
  removeNode: (nodeId: string) => void;
  undoLastAction: () => void;
  canUndo: boolean;
  startEdgeEditing: (edgeId: string) => void;
  finishEdgeEditing: (newWeight: number) => void;
  cancelEdgeEditing: () => void;
  moveNodePosition: (nodeId: string, x: number, y: number) => void;
}

export const useGraph = (): UseGraphResult => {
  const [graph, setGraph] = useState<Graph>(createEmptyGraph());
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [goalNodeId, setGoalNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [isEditingEdge, setIsEditingEdge] = useState(false);
  const [currentEditEdgeId, setCurrentEditEdgeId] = useState<string | null>(null);
  
  const [actionHistory, setActionHistory] = useState<GraphAction[]>([]);
  
  const addNewNode = useCallback((x: number, y: number, shape: 'circle' | 'square' = 'circle') => {
    setGraph(prevGraph => {
      const action: GraphAction = {
        type: 'add-node',
        data: { x, y, shape },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      return addNode(prevGraph, { x, y }, shape);
    });
  }, []);

  const addNewEdge = useCallback((sourceId: string, targetId: string, weight = 1, type: 'default' | 'undirected' = 'default') => {
    setGraph(prevGraph => {
      const action: GraphAction = {
        type: 'add-edge',
        data: { sourceId, targetId, weight, type },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      return addEdge(prevGraph, sourceId, targetId, weight, type);
    });
  }, []);

  const setStartNode = useCallback((nodeId: string) => {
    setGraph(prevGraph => {
      const action: GraphAction = {
        type: 'set-start',
        data: { nodeId, previousStartNodeId: startNodeId },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      let updatedGraph = prevGraph;
      if (startNodeId) {
        updatedGraph = setNodeType(updatedGraph, startNodeId, 'default');
      }
      updatedGraph = setNodeType(updatedGraph, nodeId, 'start');
      return updatedGraph;
    });
    setStartNodeId(nodeId);
  }, [startNodeId]);

  const setGoalNode = useCallback((nodeId: string) => {
    setGraph(prevGraph => {
      const action: GraphAction = {
        type: 'set-goal',
        data: { nodeId, previousGoalNodeId: goalNodeId },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      let updatedGraph = prevGraph;
      if (goalNodeId) {
        updatedGraph = setNodeType(updatedGraph, goalNodeId, 'default');
      }
      updatedGraph = setNodeType(updatedGraph, nodeId, 'goal');
      return updatedGraph;
    });
    setGoalNodeId(nodeId);
  }, [goalNodeId]);

  const removeNode = useCallback((nodeId: string) => {
    setGraph(prevGraph => {
      const action: GraphAction = {
        type: 'delete-node',
        data: { nodeId },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      const updatedGraph = deleteNode(prevGraph, nodeId);
      
      if (nodeId === startNodeId) {
        setStartNodeId(null);
      }
      if (nodeId === goalNodeId) {
        setGoalNodeId(null);
      }
      
      return updatedGraph;
    });
  }, [startNodeId, goalNodeId]);

  const startEdgeEditing = useCallback((edgeId: string) => {
    setIsEditingEdge(true);
    setCurrentEditEdgeId(edgeId);
  }, []);

  const finishEdgeEditing = useCallback((newWeight: number) => {
    if (currentEditEdgeId) {
      setGraph(prevGraph => {
        const edge = prevGraph.edges.find(e => e.id === currentEditEdgeId);
        if (!edge) return prevGraph;
        
        const action: GraphAction = {
          type: 'update-edge-weight',
          data: { edgeId: currentEditEdgeId, previousWeight: edge.weight, newWeight },
          prevGraph: prevGraph
        };
        setActionHistory(prev => [...prev, action]);
        
        return updateEdgeWeight(prevGraph, currentEditEdgeId, newWeight);
      });
    }
    setIsEditingEdge(false);
    setCurrentEditEdgeId(null);
  }, [currentEditEdgeId]);

  const cancelEdgeEditing = useCallback(() => {
    setIsEditingEdge(false);
    setCurrentEditEdgeId(null);
  }, []);

  const moveNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setGraph(prevGraph => {
      const node = prevGraph.nodes.find(n => n.id === nodeId);
      if (!node) return prevGraph;
      
      const action: GraphAction = {
        type: 'move-node',
        data: { nodeId, previousX: node.x, previousY: node.y, newX: x, newY: y },
        prevGraph: prevGraph
      };
      setActionHistory(prev => [...prev, action]);
      
      return moveNode(prevGraph, nodeId, x, y);
    });
  }, []);

  const undoLastAction = useCallback(() => {
    if (actionHistory.length === 0) return;
    
    const lastAction = actionHistory[actionHistory.length - 1];
    
    setGraph(lastAction.prevGraph);
    
    if (lastAction.type === 'set-start') {
      setStartNodeId(lastAction.data.previousStartNodeId);
    } else if (lastAction.type === 'set-goal') {
      setGoalNodeId(lastAction.data.previousGoalNodeId);
    } else if (lastAction.type === 'delete-node') {
      const deletedNodeId = lastAction.data.nodeId;
      const nodeInPrevGraph = lastAction.prevGraph.nodes.find(n => n.id === deletedNodeId);
      
      if (nodeInPrevGraph) {
        if (nodeInPrevGraph.type === 'start') {
          setStartNodeId(deletedNodeId);
        } else if (nodeInPrevGraph.type === 'goal') {
          setGoalNodeId(deletedNodeId);
        }
      }
    }
    
    setActionHistory(prev => prev.slice(0, -1));
  }, [actionHistory]);

  const resetGraph = useCallback(() => {
    setGraph(createEmptyGraph());
    setStartNodeId(null);
    setGoalNodeId(null);
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setIsCreatingEdge(false);
    setIsEditingEdge(false);
    setCurrentEditEdgeId(null);
    setActionHistory([]);
  }, []);

  const loadSampleGraph = useCallback(() => {
    const sampleGraph = generateSampleGraph();
    setGraph(sampleGraph);
    
    const startNode = sampleGraph.nodes.find(node => node.type === 'start');
    const goalNode = sampleGraph.nodes.find(node => node.type === 'goal');
    
    if (startNode) setStartNodeId(startNode.id);
    if (goalNode) setGoalNodeId(goalNode.id);
    
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setIsCreatingEdge(false);
    setIsEditingEdge(false);
    setCurrentEditEdgeId(null);
    setActionHistory([]);
  }, []);

  const resetNodeTypes = useCallback(() => {
    setGraph(prevGraph => {
      let updatedGraph = prevGraph;
      
      for (const node of updatedGraph.nodes) {
        if (node.id !== startNodeId && node.id !== goalNodeId && (node.type === 'visited' || node.type === 'path')) {
          updatedGraph = setNodeType(updatedGraph, node.id, 'default');
        }
      }
      
      for (const edge of updatedGraph.edges) {
        if (edge.type === 'path') {
          updatedGraph = setEdgeType(updatedGraph, edge.id, 'default');
        }
      }
      
      return updatedGraph;
    });
  }, [startNodeId, goalNodeId]);

  const updateNodeType = useCallback((nodeId: string, type: Node['type']) => {
    setGraph(prevGraph => setNodeType(prevGraph, nodeId, type));
  }, []);

  const updateEdgeType = useCallback((edgeId: string, type: Edge['type']) => {
    setGraph(prevGraph => setEdgeType(prevGraph, edgeId, type));
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const hoverNode = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  const startEdgeCreation = useCallback(() => {
    setIsCreatingEdge(true);
  }, []);

  const finishEdgeCreation = useCallback(() => {
    setIsCreatingEdge(false);
    setSelectedNodeId(null);
  }, []);

  return {
    graph,
    startNodeId,
    goalNodeId,
    selectedNodeId,
    hoveredNodeId,
    isCreatingEdge,
    isEditingEdge,
    currentEditEdgeId,
    addNewNode,
    addNewEdge,
    setStartNode,
    setGoalNode,
    selectNode,
    hoverNode,
    startEdgeCreation,
    finishEdgeCreation,
    resetGraph,
    loadSampleGraph,
    resetNodeTypes,
    updateNodeType,
    updateEdgeType,
    removeNode,
    undoLastAction,
    canUndo: actionHistory.length > 0,
    startEdgeEditing,
    finishEdgeEditing,
    cancelEdgeEditing,
    moveNodePosition
  };
};
