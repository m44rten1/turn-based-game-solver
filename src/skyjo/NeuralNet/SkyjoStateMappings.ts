import ISkyjoState from "../ISkyjoState";
import IAction from "../../generic/IAction";
import { ActionType } from "../SkyjoGame";

const round = (x: number, precision = 2): number => {
  const precisionFactor = Math.pow(10, precision);
  return Math.round(precisionFactor * x) / precisionFactor;
}

const normalizeCard = (card: number): number =>{
    return round(((card + 2) / 28) + 0.5);
}

export const mapStateToNNInput = (state: ISkyjoState): {[key: string]: number} => {
  let mappedState: { [key: string]: number } = {};

  mappedState["discardPile0"] = normalizeCard(
    state.round.discardPile[state.round.discardPile.length - 1]
  );

  if (state.round.drawnClosedCard !== null) {
    mappedState["drawnClosedCard"] = normalizeCard(state.round.drawnClosedCard);
  }

  const aiPlayerStateIndex = state.round.currentPlayerIndex;

  const playerNames: string[] = [];
  let index = 0;

  for (let i = 0; i < state.round.playerStates.length; i++) {
    if (i === aiPlayerStateIndex) {
      playerNames.push("_AI_");
    } else {
      playerNames.push(`_${index++}_`)
    }
  }

  const getPlayerName = (index: number): string => {
    return playerNames[index];
  }

  for (
    let playerStateIndex = 0;
    playerStateIndex < state.round.playerStates.length;
    playerStateIndex++
  ) {
    let playerState = state.round.playerStates[playerStateIndex];
    for (
      let playerOpenCardIndex = 0;
      playerOpenCardIndex < playerState.openCards.length;
      playerOpenCardIndex++
    ) {
      mappedState[
        "player" + getPlayerName(playerStateIndex) + "OpenCard" + playerOpenCardIndex
      ] = normalizeCard(playerState.openCards[playerOpenCardIndex]);
    }
    mappedState["player" + getPlayerName(playerStateIndex) + "NumberOfClosedCards"] =
      round(playerState.closedCards.length / 12);
  }
  return mappedState;
}

export const mapActionToNNOutput = (action: IAction<ActionType>): {[key: string]: number}  =>{
  const mappedAction: { [key: string]: number } = {};
  mappedAction[action.type] = 1;
  return mappedAction;
}