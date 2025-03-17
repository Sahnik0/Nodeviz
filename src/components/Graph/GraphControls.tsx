
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Info } from 'lucide-react';
import { AlgorithmResult, AlgorithmType, HeuristicType } from '@/lib/algorithms';
import AlgorithmSelector from './AlgorithmSelector';
import PerformanceMetrics from './PerformanceMetrics';

interface GraphControlsProps {
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onClearGraph: () => void;
  onLoadSample: () => void;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onHeuristicChange: (heuristic: HeuristicType) => void;
  onSpeedChange: (speed: number) => void;
  algorithmType: AlgorithmType;
  heuristicType: HeuristicType;
  algorithmResult: AlgorithmResult | null;
  isRunning: boolean;
  isPaused: boolean;
  hasStartAndGoal: boolean;
  isMobile: boolean;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onRun,
  onPause,
  onResume,
  onStop,
  onReset,
  onClearGraph,
  onLoadSample,
  onAlgorithmChange,
  onHeuristicChange,
  onSpeedChange,
  algorithmType,
  heuristicType,
  algorithmResult,
  isRunning,
  isPaused,
  hasStartAndGoal,
  isMobile
}) => {
  return (
    <>
      <AlgorithmSelector
        onRun={onRun}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
        onReset={onReset}
        algorithmType={algorithmType}
        heuristicType={heuristicType}
        onAlgorithmChange={onAlgorithmChange}
        onHeuristicChange={onHeuristicChange}
        onSpeedChange={onSpeedChange}
        algorithmResult={algorithmResult}
        isRunning={isRunning}
        isPaused={isPaused}
        hasStartAndGoal={hasStartAndGoal}
      />
      
      <Card className="border-dashed shadow-sm border-[#38a169]/30 bg-white animate-scale-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-hand">Graph Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={onLoadSample}
            disabled={isRunning}
          >
            Load Sample Graph
          </Button>
          
          {!isMobile && (
            <div className="text-xs text-muted-foreground p-2 flex items-start gap-2 bg-muted/30 rounded-md border border-dashed border-muted">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Graph visualization demonstrates pathfinding algorithms in computer science. Create nodes (vertices) and edges to represent connections.</p>
              </div>
            </div>
          )}
          
          {algorithmResult && !isRunning && (
            <PerformanceMetrics result={algorithmResult} />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default GraphControls;
