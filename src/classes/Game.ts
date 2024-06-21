import { EMPTY, PIECE_ROLE } from "../constants";
import { Board } from "./Board";
import { OFFSETS } from "../constants";
import { calcNumOfCells } from "../utils/calcNumCells";
import { Move } from "./Move";
import { Player } from "./Player";

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
const showBestMoveInput = document.getElementById(
     "best-moves"
) as HTMLInputElement;

let showBestMove = false;
showBestMoveInput.addEventListener("change", () => {
     if (showBestMoveInput.checked) {
          showBestMove = true;
     } else {
          showBestMove = false;
     }
});

let maxDepth = 5;

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
          this.movesArr = this.generateMoves(
               this.board.positions,
               this.currentTurn
          );
     }

     generateMoves(positions: number[], currentTurn: PIECE_ROLE) {
          // calulates possible moves for all pieces
          let movesArr: Move[] = [];
          for (
               let startPosition = 0;
               startPosition < positions.length;
               startPosition++
          ) {
               let currentPiece = positions[startPosition];
               // rules for placing goats
               if (
                    currentTurn === PIECE_ROLE.GOAT &&
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
               else if (currentPiece === currentTurn) {
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
                                   positions[targetPosition];
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
                                   currentTurn === PIECE_ROLE.TIGER &&
                                   numCells[startPosition][i] > 1 &&
                                   targetPositionPiece === PIECE_ROLE.GOAT &&
                                   positions[targetPosition + OFFSETS[i]] === 0
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
          // storing old position in a string
          this.changeTurn();
          this.movesArr = this.generateMoves(
               this.board.positions,
               this.currentTurn
          );
          this.updateNumTigersTrapped();
          this.board.updateBoard();
          this.updateDOM();
          this.checkWinCondition();
          this.evaluate();
          if (this.vsComputer && this.currentTurn === this.player2.piece) {
               this.makeMove();
          }
          if (
               this.vsComputer &&
               this.currentTurn === this.player1.piece &&
               showBestMove
          ) {
               const bestMove = this.findBestMove();
               console.log(bestMove);
               this.board.highlightBestMove(bestMove);
          }
     }

     // move ai piece
     makeMove() {
          // const max = this.movesArr.length;
          // const min = 0;
          // const randomIndex = getRandomInt(min, max);
          // const bestMove = from minmax
          // const computerMove = this.movesArr[randomIndex];
          const computerMove = this.findBestMove();
          this.board.positions = this.updatePosition(
               computerMove,
               this.board.positions,
               this.currentTurn
          );
          this.updateState();
     }

     updatePosition(
          { startPosition, targetPosition, capturedGoat }: Move,
          positions: number[],
          currentTurn: number
     ): number[] {
          const tempPositions = [...positions];
          if (startPosition >= 0) {
               tempPositions[startPosition] = 0;
          }
          if (currentTurn === PIECE_ROLE.GOAT) {
               tempPositions[targetPosition] = PIECE_ROLE.GOAT;
               this.goatsPlaced = Math.min(20, this.goatsPlaced + 1);
          } else {
               if (capturedGoat) {
                    tempPositions[capturedGoat] = EMPTY;
                    this.goatsKilled++;
               }
               tempPositions[targetPosition] = PIECE_ROLE.TIGER;
          }
          return tempPositions;
     }

     // unmake recently made move
     restorePosition(
          { startPosition, targetPosition, capturedGoat }: Move,
          positions: number[],
          currentTurn: number
     ): number[] {
          // this.changeTurn();
          const tempPositions = [...positions];
          if (startPosition >= 0) {
               if (currentTurn === PIECE_ROLE.GOAT) {
                    tempPositions[startPosition] = PIECE_ROLE.GOAT;
               } else {
                    tempPositions[startPosition] = PIECE_ROLE.TIGER;
                    if (capturedGoat) {
                         tempPositions[capturedGoat] = PIECE_ROLE.GOAT;
                         this.goatsKilled--;
                    }
               }
               tempPositions[targetPosition] = EMPTY;
          } else {
               tempPositions[targetPosition] = EMPTY;
               this.goatsPlaced--;
          }
          return tempPositions;
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

     findBestMove(): Move {
          let currPositions = [...this.board.positions];
          let currMovesArr = this.generateMoves(
               currPositions,
               this.currentTurn
          );
          let bestEvaluation = -Infinity;
          let bestMove: Move = {
               startPosition: -1,
               targetPosition: -1,
               capturedGoat: -1,
          };

          for (let i = 0; i < currMovesArr.length; i++) {
               currPositions = this.updatePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
               this.changeTurn();

               let evaluation = -this.minimax(currPositions, maxDepth);
               if (evaluation > bestEvaluation) {
                    bestEvaluation = evaluation;
                    bestMove = currMovesArr[i];
               }

               this.changeTurn();
               currPositions = this.restorePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
          }
          console.log(bestEvaluation);
          return bestMove;
     }

     minimax(positions: number[], depth: number) {
          if (depth === 0) {
               return this.evaluate();
          }
          let currPositions = [...positions];
          let currMovesArr = this.generateMoves(
               currPositions,
               this.currentTurn
          );
          if (currMovesArr.length === 0) {
               return -Infinity;
          }
          let bestEvaluation = -Infinity;
          for (let i = 0; i < currMovesArr.length; i++) {
               currPositions = this.updatePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
               this.changeTurn();

               let evaluation = -this.minimax(currPositions, depth - 1);
               bestEvaluation = Math.max(evaluation, bestEvaluation);

               this.changeTurn();
               currPositions = this.restorePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
          }
          return bestEvaluation;
     }
}
