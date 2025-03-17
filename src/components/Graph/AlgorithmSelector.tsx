
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Slider } from "@/components/UI/slider";
import { Play, Pause, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';
import { AlgorithmResult, AlgorithmType, HeuristicType } from '@/lib/algorithms';

export interface AlgorithmSelectorProps {
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  algorithmType: AlgorithmType;
  heuristicType: HeuristicType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onHeuristicChange: (heuristic: HeuristicType) => void;
  onSpeedChange: (speed: number) => void;
  algorithmResult: AlgorithmResult | null;
  isRunning: boolean;
  isPaused: boolean;
  hasStartAndGoal: boolean;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  onRun,
  onPause,
  onResume,
  onStop,
  onReset,
  algorithmType,
  heuristicType,
  onAlgorithmChange,
  onHeuristicChange,
  onSpeedChange,
  algorithmResult,
  isRunning,
  isPaused,
  hasStartAndGoal
}) => {
  const isAStarSelected = algorithmType === 'astar';
  
  return (
    <Card className="border-dashed shadow-sm border-[#38a169]/30 bg-white animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-hand">Algorithm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="algorithm-select" className="text-sm font-medium block mb-2">
            Select Algorithm
          </label>
          <Select
            value={algorithmType}
            onValueChange={(value) => onAlgorithmChange(value as AlgorithmType)}
            disabled={isRunning}
          >
            <SelectTrigger id="algorithm-select" className="w-full border-dashed">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
              <SelectItem value="dfs">Depth-First Search (DFS)</SelectItem>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="astar">A* Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isAStarSelected && (
          <div>
            <label htmlFor="heuristic-select" className="text-sm font-medium block mb-2">
              Heuristic Function
            </label>
            <Select
              value={heuristicType}
              onValueChange={(value) => onHeuristicChange(value as HeuristicType)}
              disabled={isRunning}
            >
              <SelectTrigger id="heuristic-select" className="w-full border-dashed">
                <SelectValue placeholder="Select heuristic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manhattan">Manhattan Distance</SelectItem>
                <SelectItem value="euclidean">Euclidean Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <label htmlFor="speed-slider" className="text-sm font-medium block mb-2">
            Animation Speed
          </label>
          <Slider
            id="speed-slider"
            min={50}
            max={1000}
            step={50}
            defaultValue={[500]}
            onValueChange={([value]) => onSpeedChange(value)}
            disabled={isRunning && !isPaused}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
        
        <div className="pt-2 flex gap-2">
          {!isRunning ? (
            <Button
              variant="default"
              className="w-full flex items-center gap-1"
              onClick={onRun}
              disabled={!hasStartAndGoal}
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="default"
                  className="w-full flex items-center gap-1"
                  onClick={onResume}
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-1"
                  onClick={onPause}
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex items-center gap-1"
                onClick={onStop}
              >
                <RotateCcw className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>
        
        {isRunning && (
          <div className="text-center animate-pulse">
            <Badge
              variant="outline" 
              className="bg-muted font-hand text-muted-foreground flex items-center gap-1 py-1 w-full justify-center"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              {isPaused ? "Paused..." : "Running..."}
            </Badge>
          </div>
        )}
        
        {algorithmResult && !isRunning && (
          <div className="text-sm border border-dashed border-[#38a169]/30 rounded-md p-2 animate-fade-in">
            <h4 className="font-medium text-xs mb-1 flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Results
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex justify-between">
                <span>Path Length:</span>
                <span className="font-medium">{algorithmResult.pathLength}</span>
              </li>
              <li className="flex justify-between">
                <span>Nodes Visited:</span>
                <span className="font-medium">{algorithmResult.nodesVisited}</span>
              </li>
              <li className="flex justify-between">
                <span>Path Cost:</span>
                <span className="font-medium">{algorithmResult.pathCost}</span>
              </li>
              <li className="flex justify-between">
                <span>Time (ms):</span>
                <span className="font-medium">{algorithmResult.executionTime}</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlgorithmSelector;
