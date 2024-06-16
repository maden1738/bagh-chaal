// calculates the number of moves to edge from each cell

let numCells: number[][] = [];

export function calcNumOfCells() {
     for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
               let cellIndex = row * 5 + col;
               let numNorth = row;
               let numSouth = Math.min(4 - row, 2);
               let numEast = Math.min(4 - col, 2);
               let numWest = col;

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

// north south east west north-east south-west north-west south-east

// [     N, S, E, W,NE,SW,NW,SE
// [
//      [0, 2, 2, 0, 0, 0, 0, 2],
//      [0, 2, 2, 1, 0, 0, 0, 0],
//      [0, 2, 2, 2, 0, 2, 0, 2],
//      [0, 2, 1, 3, 0, 0, 0, 0],
//      [0, 2, 0, 4, 0, 2, 0, 0],
//      [1, 2, 2, 0, 0, 0, 0, 0],
//      [1, 2, 2, 1, 1, 1, 1, 2],
//      [1, 2, 2, 2, 0, 0, 0, 0],
//      [1, 2, 1, 3, 1, 2, 1, 1],
//      [1, 2, 0, 4, 0, 0, 0, 0],
//      [2, 2, 2, 0, 2, 0, 0, 2],
//      [2, 2, 2, 1, 0, 0, 0, 0],
//      [2, 2, 2, 2, 2, 2, 2, 2],
//      [2, 2, 1, 3, 0, 0, 0, 0],
//      [2, 2, 0, 4, 0, 2, 2, 0],
//      [3, 1, 2, 0, 0, 0, 0, 0],
//      [3, 1, 2, 1, 2, 1, 1, 1],
//      [3, 1, 2, 2, 0, 0, 0, 0],
//      [3, 1, 1, 3, 1, 1, 3, 1],
//      [3, 1, 0, 4, 0, 0, 0, 0],
//      [4, 0, 2, 0, 2, 0, 0, 0],
//      [4, 0, 2, 1, 0, 0, 0, 0],
//      [4, 0, 2, 2, 2, 0, 2, 0],
//      [4, 0, 1, 3, 0, 0, 0, 0],
//      [4, 0, 0, 4, 0, 0, 4, 0],
// ];
