import IPlayer from "../generic/IPlayer";
import ISkyjoPlayerState from "./ISkyjoPlayerState"


export default interface ISkyjoState {
  discardPile:number[];
  deck: number[];
  drawnClosedCard: number | null;
  playerStates: Map<IPlayer<ISkyjoState>, ISkyjoPlayerState>;
  currentPlayerIndex: number;
}