import { useEffect, useRef, useState } from 'react';
import { PixiBoard, BoardCallbacks, BoardState } from '@/lib/pixi/PixiBoard';

interface PixiGameBoardProps {
  playerBoard: any[];
  aiBoard: any[];
  playerHand: any[];
  aiHandCount: number;
  onCardPlay: (cardIndex: number) => void;
  onMinionClick: (minionId: string, isPlayer: boolean) => void;
  onTargetClick: (targetId: string) => void;
  onAIFaceClick: () => void;
  onEndTurn: () => void;
  selectedMinion: string | null;
  currentTurn: 'player' | 'ai';
  playerMana: number;
  playerMaxMana: number;
  playerHealth: number;
  aiMana: number;
  aiMaxMana: number;
  aiHealth: number;
  gameOver: boolean;
  winner?: 'player' | 'ai';
  combatLog: string[];
  turnNumber: number;
  aiAction?: string;
}

export function PixiGameBoard(props: PixiGameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiBoardRef = useRef<PixiBoard | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize PixiJS once
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!canvasRef.current) {
        setInitError('Canvas not available');
        return;
      }

      try {
        // Define callbacks to pass to PixiBoard
        // These will call the props functions
        // to communicate user actions back to the battle page
        const callbacks: BoardCallbacks = {
          onCardPlay: props.onCardPlay,
          onMinionClick: props.onMinionClick,
          onTargetClick: props.onTargetClick,
          onAIFaceClick: props.onAIFaceClick,
          onEndTurn: props.onEndTurn,
        };

        const board = new PixiBoard(callbacks);
        await board.init(canvasRef.current);

        if (!isMounted) {
          board.destroy();
          return;
        }

        pixiBoardRef.current = board;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize PixiJS:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Small delay to ensure canvas is ready
    const timeoutId = setTimeout(init, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (pixiBoardRef.current) {
        pixiBoardRef.current.destroy();
        pixiBoardRef.current = null;
      }
      setIsInitialized(false);
    };
  }, []); // Only run once on mount

  // Update board state whenever props change
  // This keeps the PixiJS rendering in sync with React state
  // any time any of the props in here change, useEffect will run to update the PixiBoard
  useEffect(() => {
    if (!isInitialized || !pixiBoardRef.current) return;

    const boardState: BoardState = {
      playerBoard: props.playerBoard,
      aiBoard: props.aiBoard,
      playerHand: props.playerHand,
      aiHandCount: props.aiHandCount,
      selectedMinion: props.selectedMinion,
      currentTurn: props.currentTurn,
      playerMana: props.playerMana,
      playerMaxMana: props.playerMaxMana,
      playerHealth: props.playerHealth,
      aiMana: props.aiMana,
      aiMaxMana: props.aiMaxMana,
      aiHealth: props.aiHealth,
      gameOver: props.gameOver,
      winner: props.winner,
      combatLog: props.combatLog,
      turnNumber: props.turnNumber,
      aiAction: props.aiAction,
    };

    pixiBoardRef.current.update(boardState);
  }, [
    props.playerBoard,
    props.aiBoard,
    props.playerHand,
    props.aiHandCount,
    props.selectedMinion,
    props.currentTurn,
    props.playerMana,
    props.playerMaxMana,
    props.playerHealth,
    props.aiMana,
    props.aiMaxMana,
    props.aiHealth,
    props.gameOver,
    props.winner,
    props.combatLog,
    props.turnNumber,
    props.aiAction,
    isInitialized,
  ]);

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