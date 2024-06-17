import { PIECE_ROLE } from "../constants";

type PlayerProps = {
     name: string;
     piece: PIECE_ROLE;
     isComputer: boolean;
};

export class Player {
     name: string;
     piece: PIECE_ROLE;
     isComputer: boolean;

     constructor({ name, piece, isComputer = false }: PlayerProps) {
          this.name = name;
          this.piece = piece;
          this.isComputer = isComputer;
     }
}
