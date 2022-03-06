import ISkyjoPlayerState from "./ISkyjoPlayerState"

export default interface ISkyjoState {
  discardPile:number[];
  deck: number[];
  drawnClosedCard: number | null;
  playerStates: ISkyjoPlayerState[];
  currentPlayerIndex: number;
}