interface IMove {
     startPosition: number;
     targetPosition: number;
}

type MoveProps = {
     startPosition: number;
     targetPosition: number;
     capturedGoat?: number | null;
};

export class Move implements IMove {
     startPosition: number;
     targetPosition: number;
     capturedGoat: number | null;

     constructor({
          startPosition,
          targetPosition,
          capturedGoat = null,
     }: MoveProps) {
          this.startPosition = startPosition;
          this.targetPosition = targetPosition;
          this.capturedGoat = capturedGoat;
     }
}
