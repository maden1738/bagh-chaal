import "./style.css";
import { Game } from "./classes/Game";
import { PIECE_ROLE } from "./constants";

type ClickedPiece = {
     piece: PIECE_ROLE | null;
     position: number | null;
};

let clickedPiece: ClickedPiece = {
     piece: null,
     position: null,
};

export function handleBoardClick(event: MouseEvent) {
     const targetPosition = parseInt(
          (event.currentTarget as HTMLDivElement).dataset.id || "0"
     );
     // clicking on empty cell and no piece clicked on last move
     if (game.board.positions[targetPosition] === 0 && !clickedPiece.piece) {
          if (game.currentTurn === PIECE_ROLE.GOAT && game.goatsPlaced < 20) {
               game.board.positions[targetPosition] = PIECE_ROLE.GOAT;
               game.goatsPlaced++;
               game.currentTurn = PIECE_ROLE.TIGER;
               game.generateMoves();
               game.findNumTigersTrapped();
               game.board.updateBoard();
               game.updateDOM();
               game.checkWinCondition();
          }
     }
     // clicking a piece
     else if (game.board.positions[targetPosition] === game.currentTurn) {
          if (game.currentTurn === PIECE_ROLE.GOAT && game.goatsPlaced < 20) {
               return;
          }
          clickedPiece = {
               piece: game.board.positions[targetPosition],
               position: targetPosition,
          };
     }
     // a piece was clicked on last move and an empty cell is clicked now
     else if (
          clickedPiece.piece === game.currentTurn &&
          clickedPiece.position != null &&
          game.board.positions[targetPosition] === 0
     ) {
          // cannot move goat before all 20 goats have been placed
          if (game.currentTurn === PIECE_ROLE.GOAT && game.goatsPlaced < 20) {
               return;
          }
          let startPosition = clickedPiece.position;
          const foundMove = game.movesArr.find(
               (move) =>
                    move.startPosition === startPosition &&
                    move.targetPosition === targetPosition
          );
          if (foundMove) {
               game.board.positions[startPosition] = 0;
               game.board.positions[targetPosition] = clickedPiece.piece;
               if (foundMove.capturedGoat) {
                    game.board.positions[foundMove.capturedGoat] = 0;
                    game.goatsKilled++;
               }
               clickedPiece = { piece: null, position: null };
               game.currentTurn =
                    game.currentTurn === PIECE_ROLE.GOAT
                         ? PIECE_ROLE.TIGER
                         : PIECE_ROLE.GOAT;
               game.generateMoves();
               game.findNumTigersTrapped();
               game.board.updateBoard();
               game.updateDOM();
               game.checkWinCondition();
          }
     }
}

const game = new Game();

game.board.drawBoard();
game.board.updateBoard();
