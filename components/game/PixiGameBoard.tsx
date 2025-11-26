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
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {!isInitialized && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          {initError ? `Error: ${initError}` : 'Loading Five Realms...'}
        </div>
      )}
    </div>
  );
}