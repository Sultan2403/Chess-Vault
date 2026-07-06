import { useState } from "react";
import { Chess } from "chess.js"; // Handles the chess rules & PGN parsing
import { Chessboard } from "react-chessboard"; // Handles the gorgeous visual UI

export default function GameViewer({ pgnFromDatabase }: { pgnFromDatabase: string }) {
  // 1. Initialize the chess logic engine with your saved PGN string
  const [game] = useState(() => {
    const chess = new Chess();
    chess.loadPgn(pgnFromDatabase);
    return chess;
  });

  // 2. Tell the UI component to draw the current state of the board
  return (
    <div className="w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl">
      <Chessboard
        position={game.fen()}
        arePiecesDraggable={false} // Since it's a viewer/vault review mode
        boardWidth={400}
      />
    </div>
  );
}
