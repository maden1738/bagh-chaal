// import { PIECE_ROLE } from "../constants";
import { EMPTY, PIECE_ROLE } from "../constants";
import { Move } from "./Move";
import { boardElement } from "../elements";
import { handleBoardClick, ClickedPiece } from "../main";

interface IBoard {
     positions: number[];
}

export class Board implements IBoard {
     positions: number[];
     constructor() {
          this.positions = Array(25).fill(EMPTY);
     }

     /**
      * The `emptyCell` function  sets the value at a specified position in an array to 0.
      * @param {number} position - The `position` parameter in the `emptyCell` function represents the
      * index of the cell in an array or grid that you want to empty. By setting the value at that index
      * to 0, you are essentially clearing the cell or making it empty.
      */
     emptyCell(position: number) {
          this.positions[position] = EMPTY;
     }

     /**
      * The addTiger function assigns the role of a tiger to a specific position in an array.
      * @param {number} position - The `position` parameter specifies the location on the board where
      * the tiger piece will be added. It is a number representing the index or position on the game
      * board grid where the tiger piece will be placed.
      */
     addTiger(position: number) {
          this.positions[position] = PIECE_ROLE.TIGER;
     }

     /**
      * The addGoat function assigns the role of a goat to a specific position in an array.
      * @param {number} position - The `position` parameter in the `addGoat` function represents the
      * location where a goat piece will be added in a game board or grid.
      */
     addGoat(position: number) {
          this.positions[position] = PIECE_ROLE.GOAT;
     }

     /**
      * The `drawBoard` function creates a grid of 25 cells with event listeners for handling clicks.
      */
     draw() {
          for (let i = 0; i < 25; i++) {
               const cell = document.createElement("div");
               cell.classList.add("cell");
               cell.dataset.id = String(i);
               cell.addEventListener("click", handleBoardClick);
               boardElement.appendChild(cell);
          }
     }

     highlightBestMove(bestMove: Move) {
          const cells = document.querySelectorAll<HTMLDivElement>(".cell");
          for (
               let cellIndex = 0;
               cellIndex < this.positions.length;
               cellIndex++
          ) {
               const cell = cells[cellIndex];
               if (cellIndex === bestMove.startPosition) {
                    cell.style.backgroundColor = "#ccd5ae";
               } else if (cellIndex === bestMove.targetPosition) {
                    cell.style.backgroundColor = "#a2d2ff";
               } else if (cellIndex === bestMove.capturedGoat) {
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
               const possibleMove = possibleMoves[i];

               if (possibleMove.startPosition === clickedPiece.position) {
                    const possibleCell = cells[possibleMove.targetPosition];
                    possibleCell.style.border = "1.5px solid #dbc251";
               }
          }
     }
}
