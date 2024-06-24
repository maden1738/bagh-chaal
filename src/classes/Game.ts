import { DIMENSIONS, EMPTY, PIECE_ROLE } from "../constants";
import { Board } from "./Board";
import { OFFSETS } from "../constants";
import { calcNumOfCells } from "../utils/calcNumCells";
import { Move } from "./Move";
import { Player } from "./Player";
import { displayWinner } from "../main";

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
const evaluationScore = document.querySelector(
     ".evaluation-score"
) as HTMLDivElement;

let showBestMove = false;
showBestMoveInput.addEventListener("change", () => {
     if (showBestMoveInput.checked) {
          showBestMove = true;
     } else {
          showBestMove = false;
     }
});

let maxDepth = 5; // max depth is 5 for reasonable computation time

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

export type State = {
     positions: number[];
     goatsPlaced: number;
     goatsKilled: number;
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
     isCalculating: boolean;
     evaluation: number;
     stateArr: State[];

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
          this.evaluation = 0;
          this.isCalculating = false;
          this.stateArr = [];
     }

     generateMoves(positions: number[], currentTurn: PIECE_ROLE) {
          // calulates all possible moves in a position
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
          // when its tiger's turn we can find the numbers of tigers trapped by simply looking at possible moves
          if (this.currentTurn === PIECE_ROLE.TIGER) {
               tempMovesArr = [...this.movesArr];
          } else {
               // generating moves for tiger even though its goat turn to check trapped goat
               tempMovesArr = this.generateMoves(
                    this.board.positions,
                    PIECE_ROLE.TIGER
               );
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
                    displayWinner(PIECE_ROLE.GOAT, "blocking all tiger moves");
               } else {
                    displayWinner(PIECE_ROLE.TIGER, "blocking all goat moves");
               }
          } else if (this.goatsKilled >= 5) {
               displayWinner(PIECE_ROLE.TIGER, "capturing 5 goats");
          }
     }

     changeTurn() {
          this.currentTurn =
               this.currentTurn === PIECE_ROLE.GOAT
                    ? PIECE_ROLE.TIGER
                    : PIECE_ROLE.GOAT;
     }

     updateState() {
          this.isCalculating = true;
          this.board.updateBoard();

          this.changeTurn();
          this.movesArr = this.generateMoves(
               this.board.positions,
               this.currentTurn
          );

          this.updateNumTigersTrapped();

          this.updateDOM();
          this.checkWinCondition();

          setTimeout(() => {
               const bestMove = this.findBestMove();
               this.updateEvalBar();
               if (this.vsComputer && this.currentTurn === this.player2.piece) {
                    this.makeMove(bestMove);
               } else if (showBestMove) {
                    this.board.highlightBestMove(bestMove);
               }
               this.isCalculating = false;
          }, 0);
     }

     updateEvalBar() {
          const evalBar = document.querySelector(".eval-bar") as HTMLDivElement;
          evaluationScore.innerHTML = String(this.evaluation);
          const evalBarHeight =
               DIMENSIONS.EVAL_HEIGHT -
               this.evaluation * DIMENSIONS.EVAL_HEIGHT;
          evalBar.style.height = `${evalBarHeight}px`;
     }

     // move ai piece
     makeMove(computerMove: Move) {
          // this.storeCurrentState();
          this.board.positions = this.updatePosition(
               computerMove,
               this.board.positions,
               this.currentTurn
          );
          this.updateState();
     }

     //make move
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

     // unmake the provided move
     restorePosition(
          { startPosition, targetPosition, capturedGoat }: Move,
          positions: number[],
          currentTurn: number
     ): number[] {
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

          let evaluation = tigersTrapped * 0.25 - goatsKilled * 0.24;
          evaluation = parseFloat(evaluation.toPrecision(3));
          if (this.currentTurn === PIECE_ROLE.GOAT) {
               return evaluation;
          } else {
               return evaluation * -1;
          }
     }

     storeCurrentState() {
          this.stateArr.push({
               positions: [...this.board.positions],
               goatsPlaced: this.goatsPlaced,
               goatsKilled: this.goatsKilled,
          });
     }

     findBestMove(): Move {
          let currPositions = [...this.board.positions];
          let currMovesArr = this.generateMoves(
               currPositions,
               this.currentTurn
          );

          let bestMove: Move = {
               startPosition: -1,
               targetPosition: -1,
               capturedGoat: null,
          };
          let bestEvaluation = -Infinity;

          for (let i = 0; i < currMovesArr.length; i++) {
               // makes move
               currPositions = this.updatePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
               this.changeTurn();

               let evaluation = -this.minimax(
                    currPositions,
                    maxDepth,
                    -Infinity,
                    Infinity
               );

               // unmakes move
               this.changeTurn();
               currPositions = this.restorePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );

               if (evaluation > bestEvaluation) {
                    bestEvaluation = evaluation;
                    bestMove = currMovesArr[i];
               }
          }

          // future eval if both team plays the best move
          if (this.currentTurn === PIECE_ROLE.GOAT) {
               this.evaluation = bestEvaluation;
          } else {
               this.evaluation = bestEvaluation * -1;
          }
          return bestMove;
     }

     minimax(positions: number[], depth: number, alpha: number, beta: number) {
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

          for (let i = 0; i < currMovesArr.length; i++) {
               // makes move
               currPositions = this.updatePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
               this.changeTurn();
               // this.updateNumTigersTrapped();

               let evaluation = -this.minimax(
                    currPositions,
                    depth - 1,
                    -beta,
                    -alpha
               );

               // unmakes move
               this.changeTurn();
               currPositions = this.restorePosition(
                    currMovesArr[i],
                    currPositions,
                    this.currentTurn
               );
               // this.updateNumTigersTrapped();

               if (evaluation >= beta) {
                    // prune this branch
                    return beta;
               }

               alpha = Math.max(alpha, evaluation);
          }
          return alpha;
     }
}
