
import { AlgorithmResult } from '@/lib/algorithms';
import { Award, Clock, Hash, Navigation } from 'lucide-react';

interface PerformanceMetricsProps {
  result: AlgorithmResult;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ result }) => {
  const { path, pathCost, nodesVisited, executionTime } = result;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <Navigation size={16} className="text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Path Length</p>
          <p className="font-medium">{path.length > 0 ? path.length - 1 : 'No path found'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Award size={16} className="text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Path Cost</p>
          <p className="font-medium">{path.length > 0 ? pathCost.toFixed(2) : 'N/A'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Hash size={16} className="text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Nodes Explored</p>
          <p className="font-medium">{nodesVisited}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Time Elapsed</p>
          <p className="font-medium">{executionTime.toFixed(2)} ms</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
