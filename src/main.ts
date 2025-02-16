import './style.css';
import { Game } from './classes/Game';
import {
  EMPTY,
  GAME_MODE,
  MAXIMUM,
  PIECE_ROLE,
  PLAYER_ROLE,
} from './constants';
import { Player } from './classes/Player';
import {
  showBestMoveInput,
  gameModeInput,
  roleWrapper,
  undoBtn,
  startBtn,
  gameSettings,
  gameElement,
  role,
  showBestMoveElement,
} from './elements';

export type ClickedPiece = {
  piece: PIECE_ROLE | null;
  position: number | null;
};

let clickedPiece: ClickedPiece = {
  piece: null,
  position: null,
};

showBestMoveInput.addEventListener('change', () => {
  if (showBestMoveInput.checked) {
    game.board.highlightBestMove(game.findBestMove());
  } else {
    game.updateBoard();
  }
});

gameModeInput.addEventListener('change', () => {
  roleWrapper.classList.toggle('hidden');
});

undoBtn.addEventListener('click', () => {
  if (game.stateArr.length <= 0) {
    return;
  }
  game.undoMove();
});

startBtn.addEventListener('click', () => {
  startGame();
});

let player1 = new Player({
  name: 'player1',
  piece: PIECE_ROLE.TIGER,
  isComputer: false,
});
let player2 = new Player({
  name: 'player2',
  piece: PIECE_ROLE.GOAT,
  isComputer: false,
});
let game = new Game({ player1, player2, vsComputer: false });

function startGame() {
  gameSettings.style.display = 'none';
  startBtn.style.display = 'none';
  gameElement.style.display = 'flex';
  if (gameModeInput.value === GAME_MODE.VS_COMPUTER) {
    const humanRole =
      role.value === PLAYER_ROLE.GOAT ? PIECE_ROLE.GOAT : PIECE_ROLE.TIGER;
    const computerRole =
      humanRole === PIECE_ROLE.GOAT ? PIECE_ROLE.TIGER : PIECE_ROLE.GOAT;
    player1 = new Player({
      name: 'Human',
      piece: humanRole,
      isComputer: false,
    });
    player2 = new Player({
      name: 'Ribby',
      piece: computerRole,
      isComputer: true,
    });
    game = new Game({ player1, player2, vsComputer: true });
    game.board.draw();
    game.updateBoard();
    setTimeout(() => {
      const bestMove = game.findBestMove();
      if (player2.piece === PIECE_ROLE.GOAT) {
        game.makeMove(bestMove);
      }
    }, 0);
  } else {
    game.board.draw();
    game.updateBoard();
  }
  showBestMoveElement.style.display = 'flex';
}

/**
 * The function `handleBoardClick`  handles user clicks on a game board, allowing players
 * to place pieces and make moves according to game rules.
 * @param {MouseEvent} event - The `event` parameter in the `handleBoardClick` function is a MouseEvent
 * object that represents an event triggered by a user's interaction with the board. It contains
 * information about the event such as the type of event, the target element that triggered the event,
 * and any additional data related to the event
 * @returns If the function encounters certain conditions, it will return early and not execute the
 * rest of the code block. The conditions that would cause the function to return early are:
 * 1. If `game.isCalculating` is true
 * 2. If `game.vsComputer` is true and it is not player1's(human) turn
 * 3. If a goat is clicked before placing all goats
 */
export function handleBoardClick(event: MouseEvent) {
  const targetPosition = parseInt(
    (event.currentTarget as HTMLDivElement).dataset.id || '0'
  );

  if (game.isCalculating) {
    return;
  }
  if (game.vsComputer && game.currentTurn !== player1.piece) {
    return;
  }

  // clicking on empty cell and no piece clicked on last move
  if (
    game.board.positions[targetPosition] === EMPTY &&
    !clickedPiece.piece &&
    game.currentTurn === PIECE_ROLE.GOAT &&
    game.goatsPlaced < MAXIMUM.GOATS_PLACED
  ) {
    game.storeCurrentState();
    game.board.addGoat(targetPosition);
    game.goatsPlaced++;
    game.updateState();
  }
  // clicking a piece
  else if (game.board.positions[targetPosition] === game.currentTurn) {
    if (
      game.currentTurn === PIECE_ROLE.GOAT &&
      game.goatsPlaced < MAXIMUM.GOATS_PLACED
    ) {
      return;
    }

    clickedPiece = {
      piece: game.board.positions[targetPosition],
      position: targetPosition,
    };
    game.board.highlightPossibleMoves(clickedPiece, game.movesArr);
  }
  // a piece was clicked on last move and an empty cell is clicked now
  else if (
    clickedPiece.piece === game.currentTurn &&
    clickedPiece.position != null &&
    game.board.positions[targetPosition] === EMPTY
  ) {
    // cannot move goat before all 20 goats have been placed
    if (
      game.currentTurn === PIECE_ROLE.GOAT &&
      game.goatsPlaced < MAXIMUM.GOATS_PLACED
    ) {
      return;
    }
    let startPosition = clickedPiece.position;
    const foundMove = game.movesArr.find(
      (move) =>
        move.startPosition === startPosition &&
        move.targetPosition === targetPosition
    );
    if (foundMove) {
      // legal move
      game.storeCurrentState();
      game.board.emptyCell(startPosition);
      game.board.positions[targetPosition] = clickedPiece.piece;
      if (foundMove.capturedGoat) {
        game.board.emptyCell(foundMove.capturedGoat);
        game.goatsKilled++;
      }
      clickedPiece = { piece: null, position: null };
      game.updateState();
    }
  }
}
