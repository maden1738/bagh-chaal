// import { PIECE_ROLE } from "../constants";
import tigerIcon from "../assets/tiger.png";
import goatIcon from "../assets/goat.png";
import { EMPTY, PIECE_ROLE } from "../constants";
import { handleBoardClick } from "../main";
import { Move } from "./Move";
import { ClickedPiece } from "../main";

interface IBoard {
     positions: number[];
}

const boardElement = document.getElementById("board") as HTMLDivElement;

export class Board implements IBoard {
     positions: number[];
     constructor() {
          this.positions = Array(25).fill(EMPTY);
     }

     emptyCell(position: number) {
          this.positions[position] = 0;
     }

     addTiger(position: number) {
          this.positions[position] = PIECE_ROLE.TIGER;
     }

     addGoat(position: number) {
          this.positions[position] = PIECE_ROLE.GOAT;
     }

     /**
      * The `drawBoard` function creates a grid of 25 cells with event listeners for handling clicks.
      */
     drawBoard() {
          for (let i = 0; i < 25; i++) {
               const cell = document.createElement("div");
               cell.classList.add("cell");
               cell.dataset.id = String(i);
               cell.addEventListener("click", (event) => {
                    handleBoardClick(event);
               });
               boardElement.appendChild(cell);
          }
     }
     updateBoard() {
          // displayin correct image for each cell
          const cells = document.querySelectorAll<HTMLDivElement>(".cell");

          for (let i = 0; i < this.positions.length; i++) {
               let cell = cells[i];
               cell.style.border = "0px";
               cell.style.backgroundColor = "transparent";
               if (this.positions[i] === PIECE_ROLE.TIGER) {
                    cell.innerHTML = `<img src=${tigerIcon} alt='Tiger'>`;
               } else if (this.positions[i] === PIECE_ROLE.GOAT) {
                    cell.innerHTML = `<img src=${goatIcon} alt='Goat'>`;
               } else {
                    cell.innerHTML = "";
               }
          }
     }

     // highlightGoatPlaceableCell() {
     //      const cells = document.querySelectorAll<HTMLDivElement>(".cell");
     //      for (let i = 0; i < this.positions.length; i++) {
     //           const cell = cells[i];
     //      }
     // }

     highlightBestMove(bestMove: Move) {
          const cells = document.querySelectorAll<HTMLDivElement>(".cell");
          for (let i = 0; i < this.positions.length; i++) {
               const cell = cells[i];
               if (i === bestMove.startPosition) {
                    cell.style.backgroundColor = "#ccd5ae";
               } else if (i === bestMove.targetPosition) {
                    cell.style.backgroundColor = "#a2d2ff";
               } else if (i === bestMove.capturedGoat) {
                    cell.style.backgroundColor = "#ffafcc";
               }
          }
     }

     highlightPossibleMoves(clickedPiece: ClickedPiece, possibleMoves: Move[]) {
          const cells = document.querySelectorAll<HTMLDivElement>(".cell");
          cells.forEach((cell) => {
               cell.style.border = "0px";
          });
          for (let i = 0; i < possibleMoves.length; i++) {
               let possibleMove = possibleMoves[i];
               if (possibleMove.startPosition === clickedPiece.position) {
                    let possibleCell = cells[possibleMove.targetPosition];
                    possibleCell.style.border = "1.5px solid #dbc251";
               }
          }
     }
}
