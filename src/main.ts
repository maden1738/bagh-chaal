import "./style.css";
import { Game } from "./classes/Game";
import { PIECE_ROLE } from "./constants";
const game = new Game();

game.board.drawBoard();
game.board.updateBoard();

type ClickedPiece = {
     piece: PIECE_ROLE | null;
     position: number | null;
};

let clickedPiece: ClickedPiece = {
     piece: null,
     position: null,
};

export function handleBoardClick(event: MouseEvent) {
     const cellId = parseInt(
          (event.currentTarget as HTMLDivElement).dataset.id || "0"
     );
     // clicking on empty cell and no piece clicked on last move
     if (!game.board.positions[cellId] && !clickedPiece) {
          return;
     }
     // clicking a piece
     if (game.board.positions[cellId]) {
          clickedPiece = {
               piece: game.board.positions[cellId],
               position: cellId,
          };
     }
     // a piece was clicked on last move and an empty cell is clicked now
     if (
          clickedPiece.piece != null &&
          clickedPiece.position != null &&
          game.board.positions[cellId] === 0
     ) {
          let startPosition = clickedPiece.position;
          game.board.positions[startPosition] = 0;
          game.board.positions[cellId] = clickedPiece.piece;
          clickedPiece = { piece: null, position: null };
          game.board.updateBoard();
     }
}

console.log(game.board.positions);
