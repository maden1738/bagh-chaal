import { PIECE_ROLE } from "../constants";
import { Board } from "./Board";
import { OFFSETS } from "../constants";
import { calcNumOfCells } from "../utils/calcNumCells";

const numCells = calcNumOfCells();

type move = {
     startPosition: number;
     targetPosition: number;
};
const movesArr: move[] = [];

interface IGame {
     currentTurn: PIECE_ROLE;
     goatsPlaced: number;
     tigersTrapped: number;
     totalGoats: number;
     totalTigers: number;
}

export class Game implements IGame {
     currentTurn: PIECE_ROLE;
     goatsPlaced: number;
     tigersTrapped: number;
     totalGoats: number;
     totalTigers: number;
     goatsKilled: number;
     board: Board;
     constructor() {
          this.currentTurn = PIECE_ROLE.GOAT;
          this.goatsPlaced = 0;
          this.tigersTrapped = 0;
          this.goatsKilled = 0;
          this.totalGoats = 20;
          this.totalTigers = 4;

          this.board = new Board();
          // initial 4 tigers
          this.board.addTiger(0);
          this.board.addTiger(4);
          this.board.addTiger(20);
          this.board.addTiger(24);
          this.board.addGoat(3);
     }

     generateMoves() {
          // calulates possible moves for all pieces

          for (
               let startPosition = 0;
               startPosition < this.board.positions.length;
               startPosition++
          ) {
               let currentPiece = this.board.positions[startPosition];
               // rules for placing goats
               if (
                    this.currentTurn === PIECE_ROLE.GOAT &&
                    currentPiece === 0 &&
                    this.goatsPlaced < 20
               ) {
                    movesArr.push({
                         startPosition: -1,
                         targetPosition: startPosition,
                    });
               }
               // moving goat / tiger
               else if (currentPiece === this.currentTurn) {
                    // cant move goat without placing all 20 goats first
                    if (
                         currentPiece === PIECE_ROLE.GOAT &&
                         this.goatsPlaced < 20
                    ) {
                         continue;
                    }
                    for (let i = 0; i < OFFSETS.length; i++) {
                         if (numCells[startPosition][i] > 0) {
                              let targetPosition = startPosition + OFFSETS[i];
                              let targetPositionPiece =
                                   this.board.positions[targetPosition];
                              // empty cell
                              if (targetPositionPiece === 0) {
                                   movesArr.push({
                                        startPosition,
                                        targetPosition,
                                   });
                              } else if (
                                   // if the cell next to goat is empty tiger can jump over the goat
                                   this.currentTurn === PIECE_ROLE.TIGER &&
                                   numCells[startPosition][i] > 1 &&
                                   targetPositionPiece === PIECE_ROLE.GOAT &&
                                   this.board.positions[
                                        targetPosition + OFFSETS[i]
                                   ] === 0
                              ) {
                                   movesArr.push({
                                        startPosition,
                                        targetPosition:
                                             targetPosition + OFFSETS[i],
                                   });
                              }
                         }
                    }
               }
          }
     }
}
