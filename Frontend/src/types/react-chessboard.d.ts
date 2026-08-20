declare module "react-chessboard" {
  import React from "react";

  export interface ChessboardProps {
    position?: string;
    onPieceDrop?: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
    boardWidth?: number;
    boardOrientation?: "white" | "black";
    arePiecesDraggable?: boolean;
    customBoardStyle?: React.CSSProperties;
    [key: string]: any;
  }

  export const Chessboard: React.FC<ChessboardProps>;
  export default Chessboard;
}
