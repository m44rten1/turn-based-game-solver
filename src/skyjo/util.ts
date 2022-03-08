import ISkyjoState from "./ISkyjoState";
import { randomInt } from "../util";
import SkyjoGame, { ActionType } from "./SkyjoGame";

export const generateSpecificActionStrategy = (actionType: ActionType, followUpActionType?: ActionType) => (state: ISkyjoState, allowedActionTypes: ActionType[]) => {
  const randomIndex = Math.floor(Math.random() * 3);

  const randomFollowUpActionTypes: ActionType[] = [
    "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
    "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD",
    "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD"
  ];

  if (state.round.drawnClosedCard) {
    return followUpActionType || randomFollowUpActionTypes[randomIndex];
  }

  return actionType;
};

export const randomStrategy = (state: ISkyjoState, allowedActionTypes: ActionType[]) => {
  return allowedActionTypes[randomInt(allowedActionTypes.length)];
}

export const playRandomGame = (game: SkyjoGame, shuffle = true): ISkyjoState => {
  const players = Array(game.players.length).fill(null).map(() => { return { strategy: randomStrategy }});
  game.players = players;

  if (shuffle) {
    game.shuffleDeck();
  }

  let hasNext = true;
  while (hasNext) {
    hasNext = game.nextTurn();
  }

  return game.state;
}