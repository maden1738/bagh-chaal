let numCells: number[][] = [];

/**
 * The function calculates the number of moves to reach the edge from each cell in a 5x5 grid.
 * @returns The function `calcNumOfCells` is returning an array `numCells` that contains the number of
 * moves to reach the edge from each cell in a 5x5 grid. The array is populated with values calculated
 * based on the row and column indices of each cell, considering the number of moves needed to reach
 * the north, south, east,west, north-east, south-west, north-west, south-east edges respectively
 */
export function calcNumOfCells() {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      let cellIndex = row * 5 + col;
      let numNorth = Math.min(row, 2);
      let numSouth = Math.min(4 - row, 2);
      let numEast = Math.min(4 - col, 2);
      let numWest = Math.min(col, 2);

      // piece can only move in north, south, east and west direction from odd cell
      if (cellIndex % 2 === 0) {
        numCells[cellIndex] = [
          numNorth,
          numSouth,
          numEast,
          numWest,
          Math.min(numNorth, numEast),
          Math.min(numSouth, numWest),
          Math.min(numNorth, numWest),
          Math.min(numSouth, numEast),
        ];
      } else {
        numCells[cellIndex] = [
          numNorth,
          numSouth,
          numEast,
          numWest,
          0,
          0,
          0,
          0,
        ];
      }
    }
  }
  return numCells;
}

//      [N, S, E, W,NE,SW,NW,SE]
// [
//      [0, 2, 2, 0, 0, 0, 0, 2],
//      [0, 2, 2, 1, 0, 0, 0, 0],
//      [0, 2, 2, 2, 0, 2, 0, 2],
//      [0, 2, 1, 2, 0, 0, 0, 0],
//      [0, 2, 0, 2, 0, 2, 0, 0],
//      [1, 2, 2, 0, 0, 0, 0, 0],
//      [1, 2, 2, 1, 1, 1, 1, 2],
//      [1, 2, 2, 2, 0, 0, 0, 0],
//      [1, 2, 1, 2, 1, 2, 1, 1],
//      [1, 2, 0, 2, 0, 0, 0, 0],
//      [2, 2, 2, 0, 2, 0, 0, 2],
//      [2, 2, 2, 1, 0, 0, 0, 0],
//      [2, 2, 2, 2, 2, 2, 2, 2],
//      [2, 2, 1, 2, 0, 0, 0, 0],
//      [2, 2, 0, 2, 0, 2, 2, 0],
//      [2, 1, 2, 0, 0, 0, 0, 0],
//      [2, 1, 2, 1, 2, 1, 1, 1],
//      [2, 1, 2, 2, 0, 0, 0, 0],
//      [2, 1, 1, 2, 1, 1, 2, 1],
//      [2, 1, 0, 2, 0, 0, 0, 0],
//      [2, 0, 2, 0, 2, 0, 0, 0],
//      [2, 0, 2, 1, 0, 0, 0, 0],
//      [2, 0, 2, 2, 2, 0, 2, 0],
//      [2, 0, 1, 2, 0, 0, 0, 0],
//      [2, 0, 0, 2, 0, 0, 2, 0],
// ];
