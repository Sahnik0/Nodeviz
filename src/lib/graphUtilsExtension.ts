
import { Graph } from '@/lib/graphUtils';

// Since we can't modify graphUtils.ts directly, we're creating this utility function
// that can be used until graphUtils.ts can be updated
export function moveNode(graph: Graph, nodeId: string, x: number, y: number): Graph {
  return {
    ...graph,
    nodes: graph.nodes.map(node => 
      node.id === nodeId 
        ? { ...node, x, y } 
        : node
    )
  };
}
