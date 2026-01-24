import { useEffect, useRef, useState } from 'react';
import { PixiBoard, BoardCallbacks, BoardState } from '@/lib/pixi/PixiBoard';

// Props for the PixiGameBoard component, need to pass in game state and callbacks
// Saves having to re-instantiate PixiBoard on every render
interface BoardProps {
  state: BoardState;
  callbacks: BoardCallbacks;
}

export function PixiGameBoard({ state, callbacks }: BoardProps) {

  // using refs for PixiBoard instance and canvas element so they persist across renders (init and errors use state):
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiBoardRef = useRef<PixiBoard | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Keep callbacks ref updated to latest props
  // without this, PixiBoard would have stale references to callback functions from the initial render
  const callbacksRef = useRef<BoardCallbacks>(callbacks);

  // This ensures PixiBoard always calls the most recent functions:
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Initialize PixiBoard on mount, only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setInitError('Canvas not available');
      return;
    }

    let board: PixiBoard | null = null;

    const init = async () => {
      try {
        // Wrap callbacks to always use the latest from callbacksRef
        const wrappedCallbacks: BoardCallbacks = {
          onCardPlay: (index) => callbacksRef.current.onCardPlay(index),
          onMinionClick: (id, isPlayer) => callbacksRef.current.onMinionClick(id, isPlayer),
          onTargetClick: (id) => callbacksRef.current.onTargetClick(id),
          onAIFaceClick: () => callbacksRef.current.onAIFaceClick(),
          onEndTurn: () => callbacksRef.current.onEndTurn(),
        };

        // Create and initialize PixiBoard. This is async; loads assets and sets up Pixi canvas
        board = new PixiBoard(wrappedCallbacks);
        await board.init(canvas);

        pixiBoardRef.current = board;
        setIsInitialized(true);
      } catch (error) {
        setInitError(`Failed to initialize PixiBoard: ${error}`);
      }
    };

    init();

    // Cleanup on unmount
    // Dependency array is empty, so effect runs only once
    return () => {
      board?.destroy();
      pixiBoardRef.current = null;
      setIsInitialized(false);
    };
  }, []);

  // Sync state to PixiBoard on state prop changes
  useEffect(() => {
    if (!isInitialized || !pixiBoardRef.current) return;
    pixiBoardRef.current.update(state);
  }, [isInitialized, state]);

  return (
    <div className="relative w-screen h-screen bg-slate-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {!isInitialized && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {initError ? `Error: ${initError}` : 'Loading Five Realms...'}
          </span>
        </div>
      )}
    </div>
  );
}