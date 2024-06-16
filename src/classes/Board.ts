// import { PIECE_ROLE } from "../constants";
import tigerIcon from "../assets/tiger.png";
import goatIcon from "../assets/goat.png";
import { EMPTY, PIECE_ROLE } from "../constants";
import { handleBoardClick } from "../main";

interface IBoard {
     positions: number[];
}

export class Board implements IBoard {
     positions: number[];
     constructor() {
          this.positions = Array(25).fill(EMPTY);
     }

     addTiger(position: number) {
          this.positions[position] = PIECE_ROLE.TIGER;
     }

     addGoat(position: number) {
          this.positions[position] = PIECE_ROLE.GOAT;
     }

     moveTiger() {}

     moveGoat() {}

     drawBoard() {
          const boardElement = document.getElementById(
               "board"
          ) as HTMLDivElement;

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
          const cells = document.querySelectorAll<HTMLDivElement>(".cell");
          for (let i = 0; i < this.positions.length; i++) {
               let cell = cells[i];
               let icon = new Image();
               icon.src = tigerIcon;
               if (this.positions[i] === PIECE_ROLE.TIGER) {
                    cell.innerHTML = `<img src=${tigerIcon} alt='Tiger'>`;
               } else if (this.positions[i] === PIECE_ROLE.GOAT) {
                    cell.innerHTML = `<img src=${goatIcon} alt='Goat'>`;
               } else {
                    cell.innerHTML = "";
               }
          }
     }
}
