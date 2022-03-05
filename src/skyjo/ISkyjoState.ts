import IPlayer from "../generic/IPlayer";
import ISkyjoPlayerState from "./ISkyjoPlayerState"


export default interface ISkyjoState {
  openCard: number | null;
  deck: number[];
  drawnClosedCard: number | null;
  playerStates: Map<IPlayer<ISkyjoState>, ISkyjoPlayerState>;
  currentPlayerIndex: number;
}