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
const winnerElement = document.querySelector(".winner") as HTMLDivElement;
const undoBtn = document.querySelector(".undo-btn") as HTMLButtonElement;
const showBestMoveElement = document.querySelector(
     ".best-moves"
) as HTMLDivElement;
const cellsElements = document.querySelectorAll(
     ".cell"
) as NodeListOf<HTMLDivElement>;

gameModeInput.addEventListener("change", () => {
     roleWrapper.classList.toggle("hidden");
});

undoBtn.addEventListener("click", () => {
     if (game.stateArr.length <= 0) {
          return;
     }
     undoMove();
});

startBtn.addEventListener("click", () => {
     startGame();
});

function startGame() {
     gameSettings.style.display = "none";
     startBtn.style.display = "none";
     gameElement.style.display = "flex";
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
          setTimeout(() => {
               const bestMove = game.findBestMove();
               if (player2.piece === PIECE_ROLE.GOAT) {
                    game.makeMove(bestMove);
               }
          }, 0);
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
     showBestMoveElement.style.display = "flex";
}

function undoMove() {
     let lastState;
     lastState = game.stateArr.pop();
     if (lastState) {
          game.board.positions = [...lastState.positions];
          game.goatsKilled = lastState.goatsKilled;
          game.goatsPlaced = lastState.goatsPlaced;
     }
     if (!game.vsComputer) {
          game.updateState();
     } else {
          // jumping back two turns so need to change turn
          game.changeTurn();
          game.updateState();
     }
}

export function displayWinner(winnerPiece: number, winCondition: string) {
     winnerElement.innerHTML = `${
          winnerPiece === PIECE_ROLE.GOAT ? "Goat" : "Tiger"
     } won by ${winCondition}`;

     cellsElements.forEach((cell) => {
          cell.removeEventListener("click", handleBoardClick);
     });
}

export function handleBoardClick(event: MouseEvent) {
     if (game.isCalculating) {
          return;
     }
     if (game.vsComputer && game.currentTurn !== player1.piece) {
          return;
     }
     const targetPosition = parseInt(
          (event.currentTarget as HTMLDivElement).dataset.id || "0"
     );

     // clicking on empty cell and no piece clicked on last move
     if (game.board.positions[targetPosition] === 0 && !clickedPiece.piece) {
          if (game.currentTurn === PIECE_ROLE.GOAT && game.goatsPlaced < 20) {
               game.storeCurrentState();
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
               game.storeCurrentState();
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
