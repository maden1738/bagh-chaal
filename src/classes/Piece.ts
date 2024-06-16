import { PIECE_ROLE } from "../constants";

interface IPiece {
     position: number;
     role: PIECE_ROLE;
}

export interface PieceProps {
     position: number;
     role: PIECE_ROLE;
}

export class Piece implements IPiece {
     position: number;
     role: 1 | 2;
     constructor(props: PieceProps) {
          this.position = props.position;
          this.role = props.role;
     }
}
