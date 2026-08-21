declare module "react-chessboard" {
  import type { CSSProperties, FC } from "react";

  export interface ChessboardProps {
    position?: string;
    onPieceDrop?: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
    boardWidth?: number;
    boardOrientation?: "white" | "black";
    arePiecesDraggable?: boolean;
    customBoardStyle?: CSSProperties;
    [key: string]: unknown;
  }

  export const Chessboard: FC<ChessboardProps>;
  export default Chessboard;
}
