
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { CircleIcon, SquareIcon, ArrowRightIcon, ServerIcon, Trash2Icon, Undo2Icon } from 'lucide-react';
import { Toggle } from "@/components/UI/toggle";

interface NodeEdgeCreatorProps {
  onCreateNode: (type: 'circle' | 'square') => void;
  onCreateEdge: (type: 'directed' | 'undirected') => void;
  onClearGraph: () => void;
  onUndo: () => void;
  disabled: boolean;
  canUndo: boolean;
  selectedNodeType: 'circle' | 'square';
  selectedEdgeType: 'directed' | 'undirected';
}

const NodeEdgeCreator: React.FC<NodeEdgeCreatorProps> = ({
  onCreateNode,
  onCreateEdge,
  onClearGraph,
  onUndo,
  disabled,
  canUndo,
  selectedNodeType,
  selectedEdgeType
}) => {
  return (
    <Card className="border-dashed shadow-sm border-[#38a169]/30 bg-white animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-hand">Node & Edge Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Node Shape</h3>
          <div className="flex gap-2">
            <Toggle 
              variant="outline" 
              pressed={selectedNodeType === 'circle'}
              onPressedChange={() => onCreateNode('circle')}
              disabled={disabled}
              className="flex items-center gap-1 border-dashed"
              aria-label="Create Circle Node"
            >
              <CircleIcon className={`h-5 w-5 ${selectedNodeType === 'circle' ? 'fill-node-default' : ''}`} />
              <span>Circle</span>
            </Toggle>
            
            <Toggle 
              variant="outline" 
              pressed={selectedNodeType === 'square'}
              onPressedChange={() => onCreateNode('square')}
              disabled={disabled}
              className="flex items-center gap-1 border-dashed"
              aria-label="Create Square Node"
            >
              <SquareIcon className={`h-5 w-5 ${selectedNodeType === 'square' ? 'fill-node-default' : ''}`} />
              <span>Square</span>
            </Toggle>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Edge Type</h3>
          <div className="flex gap-2">
            <Toggle 
              variant="outline"
              pressed={selectedEdgeType === 'directed'}
              onPressedChange={() => onCreateEdge('directed')}
              disabled={disabled}
              className="flex items-center gap-1 border-dashed"
              aria-label="Create Directed Edge"
            >
              <ArrowRightIcon className={`h-5 w-5 ${selectedEdgeType === 'directed' ? 'stroke-edge-default' : ''}`} />
              <span>Directed</span>
            </Toggle>
            
            <Toggle 
              variant="outline"
              pressed={selectedEdgeType === 'undirected'}
              onPressedChange={() => onCreateEdge('undirected')}
              disabled={disabled}
              className="flex items-center gap-1 border-dashed"
              aria-label="Create Undirected Edge"
            >
              <ServerIcon className={`h-5 w-5 ${selectedEdgeType === 'undirected' ? 'stroke-edge-default' : ''}`} />
              <span>Undirected</span>
            </Toggle>
          </div>
        </div>
        
        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearGraph}
            disabled={disabled}
            className="w-full flex items-center gap-1 border-dashed border-destructive/30 hover:border-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
            Clear Graph
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={disabled || !canUndo}
            className="w-full flex items-center gap-1 border-dashed"
          >
            <Undo2Icon className="h-4 w-4" />
            Undo
          </Button>
        </div>

        <div className="pt-1">
          <div className="text-xs text-muted-foreground">
            <span className="block">• Click canvas to add a node</span>
            <span className="block">• Click node + node to connect</span>
            <span className="block">• Right-click for more options</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeEdgeCreator;
