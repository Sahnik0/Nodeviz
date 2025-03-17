
import { useEffect, useState } from 'react';
import GraphCanvas from '@/components/Graph/GraphCanvas';
import GraphControls from '@/components/Graph/GraphControls';
import NodeEdgeCreator from '@/components/Graph/NodeEdgeCreator';
import { useGraph } from '@/hooks/useGraph';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { Menu, Trash2, Undo2, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { resetNodeCounter } from '@/lib/graphUtils';

const Index = () => {
  const isMobile = useIsMobile();
  const [showControls, setShowControls] = useState(!isMobile);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<'circle' | 'square'>('circle');
  const [edgeTypeToAdd, setEdgeTypeToAdd] = useState<'directed' | 'undirected'>('directed');
  
  const {
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
    canUndo,
    startEdgeEditing,
    finishEdgeEditing,
    cancelEdgeEditing,
    moveNodePosition
  } = useGraph();

  const {
    algorithmType,
    heuristicType,
    algorithmResult,
    isRunning,
    isPaused,
    stepDelay,
    setAlgorithmType,
    setHeuristicType,
    setStepDelay,
    runAlgorithm: executeAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
    stopAlgorithm,
    resetAlgorithm
  } = useAlgorithm(
    (nodeId) => {
      if (nodeId !== startNodeId && nodeId !== goalNodeId) {
        updateNodeType(nodeId, 'visited');
      }
    },
    (nodeId) => {
      if (nodeId !== startNodeId && nodeId !== goalNodeId) {
        updateNodeType(nodeId, 'path');
      }
    },
    (edgeId) => {
      updateEdgeType(edgeId, 'path');
    },
    resetNodeTypes
  );

  const handleNodeClick = (nodeId: string) => {
    if (isRunning || isEditingEdge) return;
    
    if (isCreatingEdge && selectedNodeId && nodeId !== selectedNodeId) {
      // Use the persistent edgeTypeToAdd value
      if (edgeTypeToAdd === 'undirected') {
        addNewEdge(selectedNodeId, nodeId, 1, 'undirected');
      } else {
        addNewEdge(selectedNodeId, nodeId, 1, 'default');
      }
      finishEdgeCreation();
      toast.success(`${edgeTypeToAdd.charAt(0).toUpperCase() + edgeTypeToAdd.slice(1)} edge created successfully!`);
    } else {
      selectNode(nodeId);
      startEdgeCreation();
      toast('Click on another node to create an edge', {
        description: 'Or click elsewhere to cancel.',
        duration: 3000,
      });
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (isRunning || isEditingEdge) return;
    
    if (isCreatingEdge) {
      finishEdgeCreation();
      toast.info('Edge creation cancelled');
    } else {
      // Always use the persistent nodeTypeToAdd value
      addNewNode(x, y, nodeTypeToAdd);
      toast.success(`${nodeTypeToAdd.charAt(0).toUpperCase() + nodeTypeToAdd.slice(1)} node added! Right-click to set as Start or Goal.`);
    }
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    moveNodePosition(nodeId, x, y);
  };

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: ''
  });

  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      
      if (isRunning || isEditingEdge) return;
      
      const target = e.target as Element;
      const nodePath = target.closest('.node-container');
      
      if (nodePath) {
        const nodeId = nodePath.getAttribute('data-node-id');
        
        if (nodeId) {
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            nodeId
          });
        }
      } else {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    
    document.addEventListener('contextmenu', handleRightClick);
    
    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [isRunning, isEditingEdge]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const handleRunAlgorithm = () => {
    if (!startNodeId || !goalNodeId) {
      toast.error('Please set start and goal nodes first!', {
        description: 'Right-click on nodes to set them as Start and Goal.'
      });
      return;
    }
    
    resetNodeTypes();
    
    executeAlgorithm(graph, startNodeId, goalNodeId);
    
    toast.info('Running algorithm', {
      description: `Watch as nodes are explored in real-time!`,
    });
  };

  useEffect(() => {
    const nodeContainers = document.querySelectorAll('.node-container');
    
    nodeContainers.forEach((container, index) => {
      if (index < graph.nodes.length) {
        container.setAttribute('data-node-id', graph.nodes[index].id);
      }
    });
  }, [graph.nodes]);

  const handleDeleteNode = (nodeId: string) => {
    removeNode(nodeId);
    toast.success('Node deleted!');
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleUndo = () => {
    undoLastAction();
    toast.info('Action undone');
  };

  useEffect(() => {
    if (isMobile) {
      toast('Tap to add nodes', {
        description: 'Tap existing nodes to connect them, long-press for options',
        duration: 5000,
      });
    }
  }, [isMobile]);

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  useEffect(() => {
    toast('Welcome to Graph Search Visualizer!', {
      description: '1️⃣ Click on the canvas to add nodes\n2️⃣ Click on a node and then another to create an edge\n3️⃣ Right-click nodes to set Start/Goal or delete\n4️⃣ Click on edge weights to edit them',
      duration: 8000,
    });
  }, []);

  const handleCreateNode = (type: 'circle' | 'square') => {
    setNodeTypeToAdd(type);
    toast.info(`Selected ${type} node shape`, {
      description: "All new nodes will use this shape until changed.",
      duration: 3000,
    });
  };

  const handleCreateEdge = (type: 'directed' | 'undirected') => {
    setEdgeTypeToAdd(type);
    toast.info(`Selected ${type} edge type`, {
      description: "All new edges will use this type until changed.",
      duration: 3000,
    });
  };

  const handleResetGraph = () => {
    resetGraph();
    resetNodeCounter(); // Reset the node counter when clearing the graph
    toast.success('Graph cleared');
  };

  useEffect(() => {
    if (graph.nodes.length > 0) {
      localStorage.setItem('graphData', JSON.stringify(graph));
    }
  }, [graph]);

  return (
    <div className="min-h-screen bg-[#F2FCE2] flex flex-col">
      <header className="border-b animate-fade-in sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-dashed border-[#38a169]/30">
        <div className="container mx-auto py-3 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Graph Search Visualizer</h1>
              <p className="text-muted-foreground text-sm hidden sm:block">Visualize search algorithms in action</p>
            </div>
            <div className="flex gap-2 items-center">
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleControls}
                  className="flex items-center gap-1"
                >
                  {showControls ? <X size={16} /> : <Info size={16} />}
                  {showControls ? 'Hide' : 'Controls'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo || isRunning || isEditingEdge}
                className="flex items-center gap-1"
              >
                <Undo2 size={16} />
                <span className="hidden sm:inline">Undo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className={`${isMobile && showControls ? 'hidden' : 'block'} lg:col-span-3 h-[500px] sm:h-[600px] rounded-lg border border-dashed border-[#38a169]/30 shadow-sm overflow-hidden animate-scale-in bg-white`}>
            <GraphCanvas
              graph={graph}
              onNodeClick={handleNodeClick}
              onCanvasClick={handleCanvasClick}
              onNodeHover={hoverNode}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              isCreatingEdge={isCreatingEdge}
              isEditingEdge={isEditingEdge}
              currentEditEdgeId={currentEditEdgeId}
              onStartEdgeEdit={startEdgeEditing}
              onFinishEdgeEdit={finishEdgeEditing}
              onCancelEdgeEdit={cancelEdgeEditing}
              onNodeMove={handleNodeMove}
            />
          </div>

          <div className={`${isMobile && !showControls ? 'hidden' : 'block'} flex flex-col gap-4 animate-fade-in`}>
            <NodeEdgeCreator 
              onCreateNode={handleCreateNode}
              onCreateEdge={handleCreateEdge}
              onClearGraph={handleResetGraph}
              onUndo={handleUndo}
              disabled={isRunning || isEditingEdge}
              canUndo={canUndo}
              selectedNodeType={nodeTypeToAdd}
              selectedEdgeType={edgeTypeToAdd}
            />
            
            <GraphControls
              onRun={handleRunAlgorithm}
              onPause={pauseAlgorithm}
              onResume={resumeAlgorithm}
              onStop={stopAlgorithm}
              onReset={resetAlgorithm}
              onClearGraph={handleResetGraph}
              onLoadSample={loadSampleGraph}
              onAlgorithmChange={setAlgorithmType}
              onHeuristicChange={setHeuristicType}
              onSpeedChange={setStepDelay}
              algorithmType={algorithmType}
              heuristicType={heuristicType}
              algorithmResult={algorithmResult}
              isRunning={isRunning}
              isPaused={isPaused}
              hasStartAndGoal={!!startNodeId && !!goalNodeId}
              isMobile={isMobile}
            />
          </div>
        </div>
      </main>

      {contextMenu.visible && (
        <div
          className="fixed bg-white shadow-lg border-2 border-dashed hover:border-solid border-[#38a169]/30 rounded-md py-1 z-50 min-w-[160px] animate-scale-in transition-all"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
            onClick={() => {
              setStartNode(contextMenu.nodeId);
              setContextMenu(prev => ({ ...prev, visible: false }));
              toast.success('Start node set');
            }}
          >
            <div className="w-3 h-3 rounded-full bg-node-start border border-node-start"></div>
            Set as Start Node
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
            onClick={() => {
              setGoalNode(contextMenu.nodeId);
              setContextMenu(prev => ({ ...prev, visible: false }));
              toast.success('Goal node set');
            }}
          >
            <div className="w-3 h-3 rounded-full bg-node-goal border border-node-goal"></div>
            Set as Goal Node
          </button>
          <hr className="my-1 border-border border-dashed" />
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-accent text-destructive flex items-center gap-2"
            onClick={() => handleDeleteNode(contextMenu.nodeId)}
          >
            <Trash2 size={14} />
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
