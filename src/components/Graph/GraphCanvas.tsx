
import { useEffect, useRef, useState } from 'react';
import { Graph, Node, Edge } from '@/lib/graphUtils';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GraphCanvasProps {
  graph: Graph;
  onNodeClick: (nodeId: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onNodeHover: (nodeId: string | null) => void;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isCreatingEdge: boolean;
  isEditingEdge: boolean;
  currentEditEdgeId: string | null;
  onStartEdgeEdit: (edgeId: string) => void;
  onFinishEdgeEdit: (newWeight: number) => void;
  onCancelEdgeEdit: () => void;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
}

const NODE_RADIUS = 30;

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  onNodeClick,
  onCanvasClick,
  onNodeHover,
  selectedNodeId,
  hoveredNodeId,
  isCreatingEdge,
  isEditingEdge,
  currentEditEdgeId,
  onStartEdgeEdit,
  onFinishEdgeEdit,
  onCancelEdgeEdit,
  onNodeMove
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const isMobile = useIsMobile();
  const [showLegend, setShowLegend] = useState(!isMobile);
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const longPressThreshold = isMobile ? 300 : 200;

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isEditingEdge && currentEditEdgeId) {
      const edge = graph.edges.find(e => e.id === currentEditEdgeId);
      if (edge) {
        setEdgeWeight(edge.weight);
      }
    }
  }, [isEditingEdge, currentEditEdgeId, graph.edges]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    if (isEditingEdge) {
      onCancelEdgeEdit();
      return;
    }

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedNode = graph.nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS;
      });
      
      if (clickedNode) {
        onNodeClick(clickedNode.id);
      } else {
        const clickedEdge = graph.edges.find(edge => {
          const sourceNode = graph.nodes.find(n => n.id === edge.source);
          const targetNode = graph.nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return false;
          
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2 - 10;
          
          const dx = midX - x;
          const dy = midY - y;
          return Math.sqrt(dx * dx + dy * dy) < 15;
        });
        
        if (clickedEdge) {
          onStartEdgeEdit(clickedEdge.id);
        } else {
          onCanvasClick(x, y);
        }
      }
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (isCreatingEdge || isEditingEdge) return;
    
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = node.x - (e.clientX - rect.left);
    const offsetY = node.y - (e.clientY - rect.top);
    
    setDragStartTime(Date.now());
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedNodeId(nodeId);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedNodeId || !canvasRef.current) return;
    
    const now = Date.now();
    const dragTime = now - dragStartTime;
    
    if (dragTime > longPressThreshold) {
      setIsDragging(true);
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = mouseX + dragOffset.x;
      const newY = mouseY + dragOffset.y;
      
      const boundedX = Math.max(NODE_RADIUS, Math.min(newX, canvasSize.width - NODE_RADIUS));
      const boundedY = Math.max(NODE_RADIUS, Math.min(newY, canvasSize.height - NODE_RADIUS));
      
      if (onNodeMove) {
        onNodeMove(draggedNodeId, boundedX, boundedY);
      }
    }
  };

  const handleMouseUp = () => {
    const wasDragging = isDragging;
    
    setIsDragging(false);
    setDraggedNodeId(null);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (!wasDragging && draggedNodeId) {
    }
  };

  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string) => {
    if (isCreatingEdge || isEditingEdge) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = node.x - (touch.clientX - rect.left);
    const offsetY = node.y - (touch.clientY - rect.top);
    
    setDragStartTime(Date.now());
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedNodeId(nodeId);
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    
    if (!draggedNodeId || !canvasRef.current) return;
    
    const now = Date.now();
    const dragTime = now - dragStartTime;
    
    if (dragTime > longPressThreshold) {
      setIsDragging(true);
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      const newX = touchX + dragOffset.x;
      const newY = touchY + dragOffset.y;
      
      const boundedX = Math.max(NODE_RADIUS, Math.min(newX, canvasSize.width - NODE_RADIUS));
      const boundedY = Math.max(NODE_RADIUS, Math.min(newY, canvasSize.height - NODE_RADIUS));
      
      if (onNodeMove) {
        onNodeMove(draggedNodeId, boundedX, boundedY);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const wasDragging = isDragging;
    
    setIsDragging(false);
    setDraggedNodeId(null);
    
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
    
    if (!wasDragging && draggedNodeId) {
      if (e.changedTouches && e.changedTouches.length > 0) {
        onNodeClick(draggedNodeId);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleNodeHover = (nodeId: string | null) => {
    if (!isMobile && !isDragging) {
      onNodeHover(nodeId);
    }
  };

  const handleEdgeWeightSubmit = () => {
    onFinishEdgeEdit(edgeWeight);
  };

  const toggleLegend = () => {
    setShowLegend(prev => !prev);
  };

  const renderEdges = () => {
    return graph.edges.map(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / distance;
      const ny = dy / distance;
      
      const startX = sourceNode.x + nx * NODE_RADIUS;
      const startY = sourceNode.y + ny * NODE_RADIUS;
      const endX = targetNode.x - nx * NODE_RADIUS;
      const endY = targetNode.y - ny * NODE_RADIUS;
      
      const isPathEdge = edge.type === 'path';
      const isEditingThisEdge = isEditingEdge && currentEditEdgeId === edge.id;
      const edgeClassName = `edge ${isPathEdge ? "edge-path" : "edge-default"} ${isEditingThisEdge ? "stroke-primary animate-pulse" : ""}`;
      const weightColor = isPathEdge ? "fill-primary-foreground" : "fill-foreground dark:fill-foreground";
      
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2 - 10;
      
      return (
        <g key={edge.id} className="edge-group">
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            className={edgeClassName}
            strokeWidth={isPathEdge ? 4 : 2}
            strokeLinecap="round"
          />
          
          {/* Only render arrow head for directed edges */}
          {edge.type !== 'undirected' && (
            <polygon 
              points={`${endX},${endY} ${endX - 10 * (nx + ny * 0.5)},${endY - 10 * (ny - nx * 0.5)} ${endX - 10 * (nx - ny * 0.5)},${endY - 10 * (ny + nx * 0.5)}`}
              className={isPathEdge ? "fill-edge-path" : "fill-edge-default"}
            />
          )}
          
          {isEditingThisEdge ? (
            <foreignObject
              x={midX - 40}
              y={midY - 15}
              width="80"
              height="30"
              className="overflow-visible"
            >
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={edgeWeight}
                  onChange={(e) => setEdgeWeight(Number(e.target.value) || 1)}
                  className="h-7 w-12 text-sm text-center p-1"
                  autoFocus
                />
                <button 
                  onClick={handleEdgeWeightSubmit}
                  className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={onCancelEdgeEdit}
                  className="w-7 h-7 bg-muted text-muted-foreground rounded-full flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            </foreignObject>
          ) : (
            <g 
              className="cursor-pointer hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdgeEdit(edge.id);
              }}
            >
              <circle 
                cx={midX} 
                cy={midY} 
                r="12" 
                className="fill-background stroke-border shadow-sm"
              />
              <text
                x={midX}
                y={midY}
                className={`text-xs font-bold ${weightColor} select-none`}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {edge.weight}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  const renderNodes = () => {
    return graph.nodes.map(node => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;
      const isDraggingThis = isDragging && draggedNodeId === node.id;
      const isStart = node.type === 'start';
      const isGoal = node.type === 'goal';
      const isPath = node.type === 'path';
      const isVisited = node.type === 'visited';
      const isSquare = node.shape === 'square';
      
      const baseClassName = `node node-${node.type}`;
      const pulseClass = isSelected && isCreatingEdge ? 'animate-pulse opacity-80' : '';
      const dragClass = isDraggingThis ? 'cursor-grabbing' : 'cursor-grab';
      
      const animationClass = isVisited ? 'animate-node-visited' : 
                            isPath ? 'animate-node-path' : '';
      
      return (
        <g
          key={node.id}
          className={`node-container ${pulseClass} ${animationClass} ${dragClass}`}
          onMouseEnter={() => handleNodeHover(node.id)}
          onMouseLeave={() => handleNodeHover(null)}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
          data-node-id={node.id}
        >
          {/* Node highlight/glow for special nodes */}
          {(isStart || isGoal || isPath) && (
            <>
              {isSquare ? (
                <rect
                  x={node.x - NODE_RADIUS - 5}
                  y={node.y - NODE_RADIUS - 5}
                  width={(NODE_RADIUS + 5) * 2}
                  height={(NODE_RADIUS + 5) * 2}
                  className={`
                    opacity-50 
                    ${isStart ? 'fill-green-300' : ''} 
                    ${isGoal ? 'fill-red-300' : ''} 
                    ${isPath ? 'fill-blue-300' : ''}
                  `}
                  rx="5"
                  ry="5"
                />
              ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 5}
                  className={`
                    opacity-50 
                    ${isStart ? 'fill-green-300' : ''} 
                    ${isGoal ? 'fill-red-300' : ''} 
                    ${isPath ? 'fill-blue-300' : ''}
                  `}
                />
              )}
            </>
          )}
          
          {/* Node shape - circle or square */}
          {isSquare ? (
            <rect
              x={node.x - NODE_RADIUS}
              y={node.y - NODE_RADIUS}
              width={NODE_RADIUS * 2}
              height={NODE_RADIUS * 2}
              className={`${baseClassName} ${isSelected ? 'stroke-2' : ''}`}
              rx="3"
              ry="3"
            />
          ) : (
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
              className={`${baseClassName} ${isSelected ? 'stroke-2' : ''}`}
            />
          )}
          
          {/* Node label */}
          <text
            x={node.x}
            y={node.y}
            className="text-sm font-bold fill-node-text select-none"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {node.label || node.id.split('-')[1]}
          </text>
          
          {/* Node type label */}
          <text
            x={node.x}
            y={node.y + NODE_RADIUS + 15}
            className="text-xs font-medium text-muted-foreground"
            textAnchor="middle"
          >
            {isStart ? 'Start' : isGoal ? 'Goal' : isPath ? 'Path' : isVisited ? 'Visited' : ''}
          </text>
        </g>
      );
    });
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current && isCreatingEdge && selectedNodeId) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCreatingEdge, selectedNodeId]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (canvasRef.current && isCreatingEdge && selectedNodeId) {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        setMousePos({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    return () => window.removeEventListener('touchmove', handleTouchMove);
  }, [isCreatingEdge, selectedNodeId]);

  const renderConnectionLine = () => {
    if (!isCreatingEdge || !selectedNodeId) return null;
    
    const sourceNode = graph.nodes.find(n => n.id === selectedNodeId);
    if (!sourceNode) return null;
    
    return (
      <line
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={mousePos.x}
        y2={mousePos.y}
        className="stroke-primary/70 stroke-dashed animate-pulse"
        strokeWidth={3}
        strokeDasharray="8,8"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full overflow-hidden bg-muted/30 rounded-lg relative grid place-items-center"
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
    >
      <div className={`absolute top-3 left-3 z-10 transition-all duration-300 ease-in-out ${showLegend ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-xs sm:text-sm">
          <h3 className="font-medium mb-2 font-hand">Node Types</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-node-default border-2 border-node-border"></div>
              <span>Default Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-node-start border-2 border-node-start"></div>
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-node-goal border-2 border-node-goal"></div>
              <span>Goal Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-node-visited border-2 border-node-visited"></div>
              <span>Visited Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-node-path border-2 border-node-path"></div>
              <span>Path Node</span>
            </div>
            <hr className="my-1 border-border" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-edge-default"></div>
              <span>Default Edge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-edge-path"></div>
              <span>Path Edge</span>
            </div>
          </div>
        </div>
      </div>
      
      {isMobile && (
        <div className="absolute bottom-3 right-3 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md text-xs">
          <p>Tap node: Select/connect</p>
          <p>Hold node: Drag to move</p>
          <p>Tap edge weight: Edit value</p>
        </div>
      )}
      
      {isMobile && (
        <button 
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            toggleLegend();
          }}
        >
          {showLegend ? <X size={16} /> : <span className="text-xs font-bold">?</span>}
        </button>
      )}
      
      <svg width="100%" height="100%">
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {renderEdges()}
        {renderNodes()}
        {renderConnectionLine()}
      </svg>
      
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="text-center p-6 rounded-lg max-w-xs">
            <h3 className="text-xl font-bold mb-2 font-hand">Get Started</h3>
            <p className="text-muted-foreground mb-4">
              {isMobile ? "Tap" : "Click"} anywhere on the canvas to add a node.
            </p>
            <p className="text-muted-foreground">
              Or use the "Load Sample" button to see a demo graph.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
