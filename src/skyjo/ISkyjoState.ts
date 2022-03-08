import ISkyjoPlayerState from "./ISkyjoPlayerState"

export default interface ISkyjoState {
  round: {
    discardPile: number[];
    deck: number[];
    drawnClosedCard: number | null;
    playerStates: ISkyjoPlayerState[];
    currentPlayerIndex: number;
  },
  global: {
    isRoundStarted: boolean,
    roundEndedPlayerIndex: number,
  }
}