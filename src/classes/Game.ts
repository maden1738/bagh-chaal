import { DIMENSIONS, EMPTY, MAXIMUM, PIECE_ROLE } from '../constants';
import { Board } from './Board';
import { OFFSETS } from '../constants';
import { calcNumOfCells } from '../utils/calcNumCells';
import { Move } from './Move';
import { Player } from './Player';
import { handleBoardClick } from '../main';
import tigerIcon from '../assets/tiger.png';
import goatIcon from '../assets/goat.png';
import {
  showBestMoveInput,
  currentTurnSpan,
  goatsPlacedSpan,
  goatsKilled,
  tigersTrapped,
  evaluationScore,
  pieceAudio,
  winnerElement,
} from '../elements';

let showBestMove = false;
showBestMoveInput.addEventListener('change', () => {
  if (showBestMoveInput.checked) {
    showBestMove = true;
  } else {
    showBestMove = false;
  }
});

let maxDepth = 5; // max depth is 5 for instant computation time
const numCells = calcNumOfCells();

interface IGame {
  currentTurn: PIECE_ROLE;
  goatsPlaced: number;
  tigersTrapped: number;
  totalGoats: number;
  totalTigers: number;
  movesArr: Move[];
  player1: Player;
  player2: Player;
  vsComputer: boolean;
  isCalculating: boolean;
  evaluation: number;
  stateArr: State[];
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
    this.movesArr = this.generateMoves(this.board.positions, this.currentTurn);
    this.evaluation = 0;
    this.isCalculating = false;
    this.stateArr = [];
  }

  /**
   * The function generates all possible moves for a given game position based on the current turn
   * and piece placements.
   * @param {number[]} positions - The `positions` parameter in the `generateMoves` function
   * represents the current state of the game board, where each element in the array corresponds to
   * a cell on the board and contains information about the piece occupying that cell (e.g., empty
   * cell, goat, or tiger).
   * @param {PIECE_ROLE} currentTurn - The `currentTurn` parameter in the `generateMoves` function
   * represents the role of the player whose turn it currently is in the game. It can be either
   * `PIECE_ROLE.GOAT` or `PIECE_ROLE.TIGER'
   * @returns The function `generateMoves` returns an array of possible moves represented by
   * instances of the `Move` class.
   */
  generateMoves(positions: number[], currentTurn: PIECE_ROLE) {
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
        this.goatsPlaced < MAXIMUM.GOATS_PLACED
      ) {
        movesArr.push(
          new Move({
            startPosition: -1,
            targetPosition: startPosition,
          })
        );

        continue;
      }

      // moving goat or tiger
      if (currentPiece === currentTurn) {
        // cant move goat without placing all 20 goats first
        if (
          currentPiece === PIECE_ROLE.GOAT &&
          this.goatsPlaced < MAXIMUM.GOATS_PLACED
        ) {
          continue;
        }

        for (let offsetIndex = 0; offsetIndex < OFFSETS.length; offsetIndex++) {
          if (numCells[startPosition][offsetIndex] > 0) {
            let targetPosition = startPosition + OFFSETS[offsetIndex];
            let targetPositionPiece = positions[targetPosition];

            if (targetPositionPiece === EMPTY) {
              movesArr.push(
                new Move({
                  startPosition,
                  targetPosition,
                })
              );
            } else if (
              // if the cell next to goat is empty tiger can jump over the goat
              currentTurn === PIECE_ROLE.TIGER &&
              numCells[startPosition][offsetIndex] > 1 &&
              targetPositionPiece === PIECE_ROLE.GOAT &&
              positions[targetPosition + OFFSETS[offsetIndex]] === EMPTY
            ) {
              movesArr.push(
                new Move({
                  startPosition,
                  targetPosition: targetPosition + OFFSETS[offsetIndex],
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

  /**
   * The function `updateNumTigersTrapped` calculates the number of tigers trapped for a
   * game state
   * @param {Move[]} movesArr - An array of Move objects representing the possible moves in the current state of
   * game.
   * @param {number[]} positions - The `positions` parameter in the `updateNumTigersTrapped`
   * function is an array that contains the current positions of all the pieces on the game board.
   * It is used to determine the possible moves for the tigers and to check for trapped tigers
   * @returns The function `updateNumTigersTrapped` returns the number of tigers that are trapped on
   * the board based on the provided moves array and positions of game pieces.
   */
  updateNumTigersTrapped(movesArr: Move[], positions: number[]) {
    let tempMovesArr = [];
    // when its tiger's turn we can find the numbers of tigers trapped by  looking at possible moves
    if (this.currentTurn === PIECE_ROLE.TIGER) {
      tempMovesArr = [...movesArr];
    } else {
      // generating moves for tiger even though its goat turn to check trapped goat
      tempMovesArr = this.generateMoves(positions, PIECE_ROLE.TIGER);
    }
    const uniqueTiger = new Set(tempMovesArr.map((move) => move.startPosition));
    let tigersTrapped = 4 - uniqueTiger.size;
    return tigersTrapped;
  }

  updateGameInfoInDom() {
    const currentTurn =
      this.currentTurn === PIECE_ROLE.TIGER ? 'Tiger' : 'Goat';
    currentTurnSpan.innerHTML = currentTurn;
    goatsPlacedSpan.innerHTML = String(this.goatsPlaced);
    goatsKilled.innerHTML = String(this.goatsKilled);
    tigersTrapped.innerHTML = String(this.tigersTrapped);
  }

  /**
   * The function `displayWinner` updates the UI to show the winner and win condition, and removes click
   * event listeners from all cells.
   * @param {number} winnerPiece - The `winnerPiece` parameter is a number that represents the winning
   * player's piece in a game. It is used to determine whether the winner is a "Goat" or a "Tiger".
   * @param {string} winCondition - The `winCondition` parameter represents the condition under which the
   * game was won. It could be something like "three in a row" or "corner capture".
   */
  displayWinner(winnerPiece: number, winCondition: string) {
    winnerElement.innerHTML = `${
      winnerPiece === PIECE_ROLE.GOAT ? 'Goat' : 'Tiger'
    } won by ${winCondition}`;

    const cells = document.querySelectorAll<HTMLDivElement>('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('click', handleBoardClick);
    });
  }

  checkWinCondition() {
    if (this.movesArr.length === 0) {
      if (this.currentTurn == PIECE_ROLE.TIGER) {
        this.displayWinner(PIECE_ROLE.GOAT, 'blocking all tiger moves');
      } else {
        this.displayWinner(PIECE_ROLE.TIGER, 'blocking all goat moves');
      }
    } else if (this.goatsKilled >= 5) {
      this.displayWinner(PIECE_ROLE.TIGER, 'capturing 5 goats');
    }
  }

  changeTurn() {
    this.currentTurn =
      this.currentTurn === PIECE_ROLE.GOAT ? PIECE_ROLE.TIGER : PIECE_ROLE.GOAT;
  }

  /**
   * The `updateState` function   updates the game state after each moves (player move or computer move).
   */
  updateState() {
    this.isCalculating = true; // this flag is used to prevent users from spamming moves while computer is calculating moves

    this.changeTurn();
    this.updateBoard();
    this.movesArr = this.generateMoves(this.board.positions, this.currentTurn);

    this.tigersTrapped = this.updateNumTigersTrapped(
      this.movesArr,
      this.board.positions
    );

    this.updateGameInfoInDom();
    this.checkWinCondition();

    // making expensive calculation asynchronous
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
    const evalBar = document.querySelector('.eval-bar') as HTMLDivElement;
    let evaluation = this.evaluation;

    // clamping evaluation value betweeen -1 and 1
    if (evaluation > 1) {
      evaluation = 1;
    } else if (evaluation < -1) {
      evaluation = -1;
    }
    evaluationScore.innerHTML = String(evaluation);

    const evalBarHeight =
      DIMENSIONS.EVAL_HEIGHT - evaluation * DIMENSIONS.EVAL_HEIGHT;

    evalBar.style.height = `${evalBarHeight}px`;
  }

  /**
   * The `makeMove` function updates the game board with the computer's move and then updates the
   * game state.
   * @param {Move} computerMove - The `computerMove` parameter represents the best move calculated
   * for computer. This move is used to update the game board positions
   */
  makeMove(computerMove: Move) {
    this.board.positions = this.updatePosition(
      computerMove,
      this.board.positions,
      this.currentTurn
    );
    this.updateState();
  }

  /**
   * The updatePosition  updates the provided positions array based on the move and current
   * turn information provided
   * @param {Move} move - The move object is the move to be made
   * @param {number[]} positions - The `positions` parameter is an array representing the current
   * positions of the game pieces on the board. The elements in the array correspond to different
   * positions on the board, and the values indicate the type of game piece at that position (e.g.,
   * goat, tiger, or empty).
   * @param {number} currentTurn - The `currentTurn` parameter represents the current turn in the
   * game.
   * @returns The `updatePosition` function returns the updated `tempPositions` array after applying
   * the move based on the input parameters such as `startPosition`, `targetPosition`, `capturedGoat`,
   * `positions`, and `currentTurn`.
   */
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

  /**
   * The restorePosition function   restores  the game board positions  by
   * updating the positions array based on the move to be unmade and current turn.
   * @param {Move}  move - The 'move' object is the move to be unmade
   * @param {number[]} positions - The `positions` parameter is an array that represents the current
   * state of the game board. Each element in the array corresponds to a specific position on the
   * board and contains information about what piece is currently occupying that position.
   * @param {number} currentTurn - The `currentTurn` parameter represents the current turn in the
   * game. It is used to determine whether the player controlling the pieces is playing as a goat or a
   * tiger.
   * @returns The `restorePosition` function returns an array of numbers representing the updated
   * positions after a move has been made.
   */
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

  /**
   * The function evaluates the game state based on the number of tigers trapped and goats killed,
   * adjusting the evaluation based on the current turn role.
   * @param {Move[]} movesArr - An array of Move objects representing the legal moves for the current position.
   * @param {number[]} positions - The `positions` parameter is an array that represents the current
   * state of the game board. Each element in the array corresponds to a specific position on the
   * board and contains information about what piece is currently occupying that position.
   * @returns The `evaluate` function is returning the evaluation score based on the number of tigers
   * trapped and goats killed in the game. If it is the goat's turn, the evaluation score is returned
   * as is. If it is the tiger's turn, the evaluation score is multiplied by -1 before being
   * returned.
   */
  evaluate(movesArr: Move[], positions: number[]): number {
    const tigersTrapped = this.updateNumTigersTrapped(movesArr, positions);
    const goatsKilled = this.goatsKilled;

    let evaluation = tigersTrapped * 0.25 - goatsKilled * 0.24;
    evaluation = parseFloat(evaluation.toPrecision(3));
    if (this.currentTurn === PIECE_ROLE.GOAT) {
      return evaluation;
    } else {
      return evaluation * -1;
    }
  }

  /**
   * The `storeCurrentState` function  stores the current state of the game board,
   * including positions, goats placed, and goats killed, in  stateArr array.
   */
  storeCurrentState() {
    this.stateArr.push({
      positions: [...this.board.positions],
      goatsPlaced: this.goatsPlaced,
      goatsKilled: this.goatsKilled,
    });
  }

  /**
   * The `undoMove` function reverts the game state to the previous state, including positions, goats
   * killed, and goats placed, and updates the game accordingly.
   */
  undoMove() {
    winnerElement.innerHTML = '';
    let lastState;
    lastState = this.stateArr.pop();
    if (lastState) {
      this.board.positions = [...lastState.positions];
      this.goatsKilled = lastState.goatsKilled;
      this.goatsPlaced = lastState.goatsPlaced;
    }
    if (this.vsComputer) {
      // changing turn as we arent saving computer moves in old state since minimax algo can always recreate it
      this.changeTurn();
    }
    this.updateState();
  }

  /**
   * The `findBestMove` function  implements a minimax algorithm with alpha-beta pruning
   * to determine the best move for a player in a board game.
   * @returns The `findBestMove()` function returns the best move (an object of type `Move`) based on
   * the evaluation of possible moves using the minimax algorithm with alpha-beta pruning. The best
   * move is determined by maximizing the evaluation score for the current player's turn.
   */
  findBestMove(): Move {
    let currPositions = [...this.board.positions];
    let currMovesArr = this.generateMoves(currPositions, this.currentTurn);

    let bestMove: Move = {
      startPosition: -1,
      targetPosition: -1,
      capturedGoat: null,
    };
    let bestEvaluation = -Infinity;
    let depth = maxDepth;
    if (this.goatsPlaced >= 15) {
      depth = depth + 2;
    }

    for (let i = 0; i < currMovesArr.length; i++) {
      // makes move
      currPositions = this.updatePosition(
        currMovesArr[i],
        currPositions,
        this.currentTurn
      );
      this.changeTurn();

      let evaluation = -this.minimax(currPositions, depth, -Infinity, Infinity);

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

  /**
   * The minimax function  is used for implementing the minimax algorithm with
   * alpha-beta pruning for game AI decision-making.
   * @param {number[]} positions -   The `positions` parameter is an array that represents the current
   * state of the game board. Each element in the array corresponds to a specific position on the
   * board and contains information about what piece is currently occupying that position.
   * @param {number} depth - The `depth` parameter in the minimax algorithm represents how many
   * levels deep the algorithm should search in the game tree. A higher depth allows for a more
   * thorough search of possible moves and outcomes, but it also increases the computational
   * complexity of the algorithm. Typically, a higher depth results in better decision-making
   * @param {number} alpha - Alpha is the best value that the maximizing player can currently
   * guarantee at any point
   * @param {number} beta - The best value that the minimizing player (the opponent) can guarantee at any point. The
   * algorithm uses beta to determine whether to prune branches during the search.
   * @returns The `minimax` function is returning the alpha value, which represents the best possible
   * score that the maximizing player can achieve.
   */
  minimax(positions: number[], depth: number, alpha: number, beta: number) {
    let currPositions = [...positions];
    let currMovesArr = this.generateMoves(currPositions, this.currentTurn);
    if (depth === 0) {
      return this.evaluate(currMovesArr, currPositions);
    }

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

      // negating evaluation because a position good for opponent is bad for us and vice versa
      let evaluation = -this.minimax(currPositions, depth - 1, -beta, -alpha);

      // unmakes move
      this.changeTurn();
      currPositions = this.restorePosition(
        currMovesArr[i],
        currPositions,
        this.currentTurn
      );

      if (evaluation >= beta) {
        // prune this branch, as opponent will avoid this position. So, there is  no need to futher explore this branch
        return beta;
      }

      alpha = Math.max(alpha, evaluation);
    }
    return alpha;
  }

  /**
   * The `updateBoard` function updates the game board by displaying the correct image for each cell
   * based on the  state of `board.positions` array.
   */
  updateBoard() {
    const cells = document.querySelectorAll<HTMLDivElement>('.cell');

    for (let i = 0; i < this.board.positions.length; i++) {
      let cell = cells[i];
      cell.style.border = '0px';
      cell.style.backgroundColor = 'transparent';
      if (this.board.positions[i] === PIECE_ROLE.TIGER) {
        pieceAudio.play();
        cell.innerHTML = `<img src=${tigerIcon} alt='Tiger'>`;
      } else if (this.board.positions[i] === PIECE_ROLE.GOAT) {
        pieceAudio.play();
        cell.innerHTML = `<img src=${goatIcon} alt='Goat'>`;
      } else if (
        this.board.positions[i] === EMPTY &&
        this.currentTurn == PIECE_ROLE.GOAT &&
        this.goatsPlaced < 20
      ) {
        cell.innerHTML = `<img src=${goatIcon} alt='Goat' style='opacity: 0.3'>`;
      } else {
        cell.innerHTML = '';
      }
    }
  }
}
