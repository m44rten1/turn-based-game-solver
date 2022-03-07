import ISkyjoState from "./ISkyjoState";
import IAction from "../generic/IAction";


const normalizeCard = (card: number): number =>{
    return (card + 2) / 14;
}

const mapStateToNNInput = (state: ISkyjoState) => {
  let mappedState: { [key: string]: number } = {};

  for (
    let discardPileIndex = 0;
    discardPileIndex < state.discardPile.length;
    discardPileIndex++
  ) {
    mappedState["discardPile" + discardPileIndex] = normalizeCard(
      state.discardPile[discardPileIndex]
    );
  }

  if (state.drawnClosedCard !== null) {
    mappedState["drawnClosedCard"] = normalizeCard(state.drawnClosedCard);
  }

  for (
    let playerStateIndex = 0;
    playerStateIndex < state.playerStates.length;
    playerStateIndex++
  ) {
    let playerState = state.playerStates[playerStateIndex];
    for (
      let playerOpenCardIndex = 0;
      playerOpenCardIndex < playerState.openCards.length;
      playerOpenCardIndex++
    ) {
      mappedState[
        "player" + playerStateIndex + "OpenCard" + playerOpenCardIndex
      ] = normalizeCard(playerState.openCards[playerOpenCardIndex]);
    }
    mappedState["player" + playerStateIndex + "NumberOfClosedCards"] =
      playerState.closedCards.length / 12;
  }
  return mappedState;
}

const mapActionToNNOutput = (action: IAction) =>{
  let mappedAction: { [key: string]: number } = {};
  mappedAction[action.type] = 1;
  return mappedAction;
}