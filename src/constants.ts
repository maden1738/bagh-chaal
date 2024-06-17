// export const PIECE_ROLE = {
//      NONE: 0,
//      TIGER: 1,
//      GOAT: 2,
// };

export const EMPTY = 0;

export enum PIECE_ROLE {
     TIGER = 1,
     GOAT = 2,
}

export const OFFSETS = [-5, 5, 1, -1, -4, 4, -6, 6]; // north south east west north-east south-west north-west south-east

export const GAME_MODE = {
     TWO_PLAYER: "2-player",
     VS_COMPUTER: "vs-computer",
};

export const PLAYER_ROLE = {
     GOAT: "Goat",
     TIGER: "Tiger",
};
