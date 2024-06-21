import "./style.css";
import { Game } from "./classes/Game";
import { GAME_MODE, PIECE_ROLE, PLAYER_ROLE } from "./constants";
import { Player } from "./classes/Player";

export type ClickedPiece = {
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

     if (game.vsComputer && game.currentTurn !== player1.piece) {
          return;
     }

     // clicking on empty cell and no piece clicked on last move
     if (game.board.positions[targetPosition] === 0 && !clickedPiece.piece) {
          if (game.currentTurn === PIECE_ROLE.GOAT && game.goatsPlaced < 20) {
               game.board.addGoat(targetPosition);
               game.goatsPlaced++;
               game.updateState();
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
          // game.board.highlightPossibleMoves(clickedPiece, game.movesArr);
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
               game.updateState();
          }
     }
}

let player1 = new Player({
     name: "player1",
     piece: PIECE_ROLE.TIGER,
     isComputer: false,
});
let player2 = new Player({
     name: "player2",
     piece: PIECE_ROLE.GOAT,
     isComputer: false,
});

let game = new Game({ player1, player2, vsComputer: false });

const gameSettings = document.querySelector(".game-settings") as HTMLDivElement;
const gameModeInput = document.getElementById("game-mode") as HTMLSelectElement;
const role = document.getElementById("role") as HTMLSelectElement;
const startBtn = document.querySelector(".start-btn") as HTMLButtonElement;
const gameElement = document.querySelector(".game") as HTMLDivElement;
const roleWrapper = document.querySelector(".role-wrapper") as HTMLDivElement;
const showBestMoveElements = document.querySelectorAll(
     ".best-moves"
) as NodeListOf<HTMLElement>;

gameModeInput.addEventListener("change", () => {
     roleWrapper.classList.toggle("hidden");
});

startBtn.addEventListener("click", () => {
     startGame();
});

function startGame() {
     console.log(gameModeInput.value);
     if (gameModeInput.value === GAME_MODE.VS_COMPUTER) {
          const humanRole =
               role.value === PLAYER_ROLE.GOAT
                    ? PIECE_ROLE.GOAT
                    : PIECE_ROLE.TIGER;
          const computerRole =
               humanRole === PIECE_ROLE.GOAT
                    ? PIECE_ROLE.TIGER
                    : PIECE_ROLE.GOAT;
          player1 = new Player({
               name: "Human",
               piece: humanRole,
               isComputer: false,
          });
          player2 = new Player({
               name: "Ribby",
               piece: computerRole,
               isComputer: true,
          });
          game = new Game({ player1, player2, vsComputer: true });
          game.board.drawBoard();
          game.board.updateBoard();
          if (player2.piece === PIECE_ROLE.GOAT) {
               game.makeMove();
          }
     } else {
          player1 = new Player({
               name: "player1",
               piece: PIECE_ROLE.TIGER,
               isComputer: false,
          });
          player2 = new Player({
               name: "player2",
               piece: PIECE_ROLE.GOAT,
               isComputer: false,
          });
          game.board.drawBoard();
          game.board.updateBoard();
     }
     showBestMoveElements.forEach((el) => {
          el.style.display = "block";
     });
     gameSettings.style.display = "none";
     startBtn.style.display = "none";
     gameElement.style.display = "block";
}
