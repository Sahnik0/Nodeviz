
import { useState, useCallback } from 'react';
import { 
  AlgorithmType, HeuristicType, AlgorithmResult, AlgorithmStepResult, 
  runAlgorithm 
} from '@/lib/algorithms';
import { Graph } from '@/lib/graphUtils';

interface UseAlgorithmResult {
  algorithmType: AlgorithmType;
  heuristicType: HeuristicType;
  algorithmResult: AlgorithmResult | null;
  isRunning: boolean;
  isPaused: boolean;
  stepDelay: number;
  currentStep: number;
  totalSteps: number;
  setAlgorithmType: (type: AlgorithmType) => void;
  setHeuristicType: (type: HeuristicType) => void;
  setStepDelay: (delay: number) => void;
  runAlgorithm: (graph: Graph, startNodeId: string, goalNodeId: string) => void;
  pauseAlgorithm: () => void;
  resumeAlgorithm: () => void;
  stopAlgorithm: () => void;
  resetAlgorithm: () => void;
}

export const useAlgorithm = (
  onVisitNode?: (nodeId: string) => void,
  onPathNode?: (nodeId: string) => void,
  onPathEdge?: (edgeId: string) => void,
  onReset?: () => void
): UseAlgorithmResult => {
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('bfs');
  const [heuristicType, setHeuristicType] = useState<HeuristicType>('euclidean');
  const [algorithmResult, setAlgorithmResult] = useState<AlgorithmResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stepDelay, setStepDelay] = useState<number>(500); // ms
  const [stepResults, setStepResults] = useState<AlgorithmStepResult[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Reset all algorithm state
  const resetAlgorithm = useCallback(() => {
    setAlgorithmResult(null);
    setIsRunning(false);
    setIsPaused(false);
    setStepResults([]);
    setCurrentStep(0);
    
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  // Run the selected algorithm
  const runSelectedAlgorithm = useCallback((
    graph: Graph, 
    startNodeId: string, 
    goalNodeId: string
  ) => {
    // Reset first
    resetAlgorithm();
    
    setIsRunning(true);
    
    const collectedSteps: AlgorithmStepResult[] = [];
    
    const onStep = (stepResult: AlgorithmStepResult) => {
      collectedSteps.push(stepResult);
    };
    
    const result = runAlgorithm(
      graph,
      startNodeId,
      goalNodeId,
      algorithmType,
      heuristicType,
      onStep
    );
    
    setAlgorithmResult(result);
    setStepResults(collectedSteps);
    setCurrentStep(0);
    
    // Start visualization in the next tick
    setTimeout(() => {
      visualizeNextStep(collectedSteps, 0);
    }, 0);
    
  }, [algorithmType, heuristicType, resetAlgorithm]);

  // Visualize next step with delay
  const visualizeNextStep = useCallback((
    steps: AlgorithmStepResult[],
    currentStepIndex: number
  ) => {
    if (currentStepIndex >= steps.length) {
      setIsRunning(false);
      return;
    }
    
    setCurrentStep(currentStepIndex);
    
    const step = steps[currentStepIndex];
    
    // Update visualization based on current step
    if (step.currentNodeId && onVisitNode) {
      onVisitNode(step.currentNodeId);
    }
    
    // Mark path nodes and edges
    if (currentStepIndex === steps.length - 1) {
      if (onPathNode && step.path.length > 0) {
        step.path.forEach(nodeId => onPathNode(nodeId));
      }
      
      if (onPathEdge && step.pathEdges.length > 0) {
        step.pathEdges.forEach(edgeId => onPathEdge(edgeId));
      }
    }
    
    // Schedule next step if not paused and not the last step
    if (!isPaused && currentStepIndex < steps.length - 1) {
      setTimeout(() => {
        visualizeNextStep(steps, currentStepIndex + 1);
      }, stepDelay);
    }
  }, [isPaused, onVisitNode, onPathNode, onPathEdge, stepDelay]);

  // Pause the algorithm visualization
  const pauseAlgorithm = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume the algorithm visualization
  const resumeAlgorithm = useCallback(() => {
    if (isPaused && currentStep < stepResults.length - 1) {
      setIsPaused(false);
      visualizeNextStep(stepResults, currentStep + 1);
    }
  }, [isPaused, currentStep, stepResults, visualizeNextStep]);

  // Stop the algorithm visualization
  const stopAlgorithm = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  return {
    algorithmType,
    heuristicType,
    algorithmResult,
    isRunning,
    isPaused,
    stepDelay,
    currentStep,
    totalSteps: stepResults.length,
    setAlgorithmType,
    setHeuristicType,
    setStepDelay,
    runAlgorithm: runSelectedAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
    stopAlgorithm,
    resetAlgorithm
  };
};
