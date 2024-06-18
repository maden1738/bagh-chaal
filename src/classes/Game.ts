import { EMPTY, PIECE_ROLE } from "../constants";
import { Board } from "./Board";
import { OFFSETS } from "../constants";
import { calcNumOfCells } from "../utils/calcNumCells";
import { Move } from "./Move";
import { Player } from "./Player";
import { getRandomInt } from "../utils/getRandomInt";

const numCells = calcNumOfCells();
const currentTurnSpan = document.getElementById(
     "current-turn"
) as HTMLSpanElement;
const goatsPlacedSpan = document.getElementById(
     "goats-placed"
) as HTMLSpanElement;
const goatsKilled = document.getElementById("goats-killed") as HTMLSpanElement;
const tigersTrapped = document.getElementById(
     "tigers-trapped"
) as HTMLSpanElement;

interface IGame {
     currentTurn: PIECE_ROLE;
     goatsPlaced: number;
     tigersTrapped: number;
     totalGoats: number;
     totalTigers: number;
}

type GameProps = {
     player1: Player;
     player2: Player;
     vsComputer: boolean;
};

export class Game implements IGame {
     currentTurn: PIECE_ROLE;
     goatsPlaced: number;
     tigersTrapped: number;
     totalGoats: number;
     totalTigers: number;
     goatsKilled: number;
     board: Board;
     movesArr: Move[];
     player1: Player;
     player2: Player;
     vsComputer: boolean;

     constructor({ player1, player2, vsComputer = false }: GameProps) {
          this.player1 = player1;
          this.player2 = player2;
          this.vsComputer = vsComputer;

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
          this.currentTurn = PIECE_ROLE.GOAT;
          this.movesArr = this.generateMoves();
     }

     generateMoves() {
          // calulates possible moves for all pieces
          let movesArr = [];
          for (
               let startPosition = 0;
               startPosition < this.board.positions.length;
               startPosition++
          ) {
               let currentPiece = this.board.positions[startPosition];
               // rules for placing goats
               if (
                    this.currentTurn === PIECE_ROLE.GOAT &&
                    currentPiece === EMPTY &&
                    this.goatsPlaced < 20
               ) {
                    movesArr.push(
                         new Move({
                              startPosition: -1,
                              targetPosition: startPosition,
                         })
                    );
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
                                   movesArr.push(
                                        new Move({
                                             startPosition,
                                             targetPosition,
                                        })
                                   );
                              } else if (
                                   // if the cell next to goat is empty tiger can jump over the goat
                                   this.currentTurn === PIECE_ROLE.TIGER &&
                                   numCells[startPosition][i] > 1 &&
                                   targetPositionPiece === PIECE_ROLE.GOAT &&
                                   this.board.positions[
                                        targetPosition + OFFSETS[i]
                                   ] === 0
                              ) {
                                   movesArr.push(
                                        new Move({
                                             startPosition,
                                             targetPosition:
                                                  targetPosition + OFFSETS[i],
                                             capturedGoat: targetPosition,
                                        })
                                   );
                              }
                         }
                    }
               }
          }
          return movesArr;
     }

     updateNumTigersTrapped() {
          let tempMovesArr = [];
          if (this.currentTurn === PIECE_ROLE.TIGER) {
               tempMovesArr = [...this.movesArr];
          } else {
               // generating moves for tiger even though its goat turn to check trapped goat
               for (
                    let startPosition = 0;
                    startPosition < this.board.positions.length;
                    startPosition++
               ) {
                    let currentPiece = this.board.positions[startPosition];
                    if (currentPiece === PIECE_ROLE.TIGER) {
                         for (let i = 0; i < OFFSETS.length; i++) {
                              if (numCells[startPosition][i] > 0) {
                                   let targetPosition =
                                        startPosition + OFFSETS[i];
                                   let targetPositionPiece =
                                        this.board.positions[targetPosition];
                                   // empty cell
                                   if (targetPositionPiece === 0) {
                                        tempMovesArr.push(
                                             new Move({
                                                  startPosition,
                                                  targetPosition,
                                             })
                                        );
                                   } else if (
                                        // if the cell next to goat is empty tiger can jump over the goat
                                        numCells[startPosition][i] > 1 &&
                                        targetPositionPiece ===
                                             PIECE_ROLE.GOAT &&
                                        this.board.positions[
                                             targetPosition + OFFSETS[i]
                                        ] === 0
                                   ) {
                                        tempMovesArr.push(
                                             new Move({
                                                  startPosition,
                                                  targetPosition:
                                                       targetPosition +
                                                       OFFSETS[i],
                                             })
                                        );
                                   }
                              }
                         }
                    }
               }
          }
          const uniqueTiger = new Set(
               tempMovesArr.map((move) => move.startPosition)
          );
          this.tigersTrapped = 4 - uniqueTiger.size;
     }

     updateDOM() {
          const currentTurn = this.currentTurn === 1 ? "Tiger" : "Goat";
          currentTurnSpan.innerHTML = currentTurn;
          goatsPlacedSpan.innerHTML = String(this.goatsPlaced);
          goatsKilled.innerHTML = String(this.goatsKilled);
          tigersTrapped.innerHTML = String(this.tigersTrapped);
     }

     checkWinCondition() {
          if (this.movesArr.length === 0) {
               if (this.currentTurn == PIECE_ROLE.TIGER) {
                    console.warn("goat won");
               } else {
                    console.warn("tiger won");
               }
          } else if (this.goatsKilled >= 5) {
               console.warn("tiger won");
          }
     }

     changeTurn() {
          this.currentTurn =
               this.currentTurn === PIECE_ROLE.GOAT
                    ? PIECE_ROLE.TIGER
                    : PIECE_ROLE.GOAT;
     }

     updateState() {
          console.log(this.board.positions);

          this.changeTurn();
          this.movesArr = this.generateMoves();
          this.updateNumTigersTrapped();
          this.board.updateBoard();
          this.updateDOM();
          this.checkWinCondition();
          this.evaluate();
          if (this.vsComputer && this.currentTurn === this.player2.piece) {
               this.makeMove();
          }
     }

     // move ai piece
     makeMove() {
          const max = this.movesArr.length;
          const min = 0;
          const randomIndex = getRandomInt(min, max);
          // const bestMove = from minmax
          const computerMove = this.movesArr[randomIndex];
          this.updatePosition(computerMove);
          this.updateState();
     }

     updatePosition({ startPosition, targetPosition, capturedGoat }: Move) {
          if (startPosition >= 0) {
               this.board.emptyCell(startPosition);
          }
          if (this.currentTurn === PIECE_ROLE.GOAT) {
               this.board.addGoat(targetPosition);
               this.goatsPlaced = Math.min(20, this.goatsPlaced + 1);
          } else {
               if (capturedGoat) {
                    this.board.emptyCell(capturedGoat);
                    this.goatsKilled++;
               }
               this.board.addTiger(targetPosition);
          }
     }

     // unmake recently made move
     restorePosition({ startPosition, targetPosition, capturedGoat }: Move) {
          this.changeTurn();
          if (startPosition >= 0) {
               if (this.currentTurn === PIECE_ROLE.GOAT) {
                    this.board.addGoat(startPosition);
               } else {
                    this.board.addTiger(startPosition);
                    if (capturedGoat) {
                         this.board.addGoat(capturedGoat);
                         this.goatsKilled--;
                    }
               }
               this.board.emptyCell(targetPosition);
          } else {
               this.board.emptyCell(targetPosition);
               this.goatsPlaced--;
          }
     }

     evaluate(): number {
          const tigersTrapped = this.tigersTrapped;
          const goatsKilled = this.goatsKilled;

          const evaluation = tigersTrapped * 0.25 - goatsKilled * 0.2;

          if (this.currentTurn === PIECE_ROLE.GOAT) {
               return evaluation;
          } else {
               return evaluation * -1;
          }
     }

     minimax(depth: number): number {
          if (depth === 0) {
               return this.evaluate();
          }
          let movesArr = this.generateMoves();
          if (movesArr.length === 0 || this.goatsKilled >= 5) {
               return -Infinity;
          }
          let bestEvaluation = -Infinity;
          for (let i = 0; i < movesArr.length; i++) {
               this.updatePosition(movesArr[i]);
               this.changeTurn();
               let evaluation = -this.minimax(depth - 1);
               this.restorePosition(movesArr[i]);
               evaluation = evaluation * -1;
               bestEvaluation = Math.max(evaluation, bestEvaluation);
          }
          return bestEvaluation;
     }
}
