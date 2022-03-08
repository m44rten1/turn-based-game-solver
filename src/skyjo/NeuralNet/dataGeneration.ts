import { ActionType } from "./../SkyjoGame";
import { mapStateToNNInput, mapActionToNNOutput } from "./SkyjoStateMappings";
import {
  randomStrategy,
  generateSpecificActionStrategy,
  playRandomGame,
} from "../util";
import IPlayer from "../../generic/IPlayer";
import ISkyjoState from "../ISkyjoState";
import SkyjoGame from "../SkyjoGame";

export const generateTrainingData = (
  playerCount = 2,
  gameCount = 1
): {
  input: { [key: string]: number };
  output: { [key: string]: number };
}[] => {
  const trainingData: {
    input: { [key: string]: number };
    output: { [key: string]: number };
  }[] = [];

  const players: IPlayer<ISkyjoState, ActionType>[] = Array(playerCount).fill({
    strategy: randomStrategy,
  });

  for (let gameIndex = 0; gameIndex < gameCount; gameIndex++) {
    const game = new SkyjoGame(players);

    let hasNextMove = true;
    let flipper = 0;
    while (hasNextMove) {
      const dataPoint = dataPointForState(game.state, 50);
      trainingData.push(dataPoint);
      hasNextMove = game.nextTurn();

      // Fix for doing also some of the after DRAW_CLOSED_DECK_CARD actions
      if (Math.random() > 0.7) {
        const action = game.getActionByType("DRAW_CLOSED_DECK_CARD");
        action.updateState();
      }

      flipper++;
    }
  }

  return trainingData;
};

type DataPoint = {
  input: { [key: string]: number };
  output: { [key: string]: number };
  // debugState: ISkyjoState;
};

const dataPointForState = (
  state: ISkyjoState,
  shuffleCount: number
): DataPoint => {
  const game = prepareGame(state);
  const actionTypes = getAllowedActionTypes(game.state);

  const sumActionScores = actionTypes.map(() => 0);

  for (let i = 0; i < shuffleCount; i++) {
    game.shuffleDeck();
    const actionScores = getActionScoresForShuffledState(game.state);
    actionTypes.forEach((type, index) => {
      sumActionScores[index] += actionScores[type];
    });
  }

  const averageActionScores = sumActionScores.map(
    (score) => score / shuffleCount
  );

  const maxAverageActionScore = Math.max(...averageActionScores);

  const normalizedActionScores = averageActionScores.map((score) => {
    return score / maxAverageActionScore;
  });

  const output: { [key: string]: number } = {};
  actionTypes.forEach((type, index) => {
    output[type] = normalizedActionScores[index];
  });

  return {
    input: mapStateToNNInput(state),
    output,
    // debugState: JSON.parse(JSON.stringify(state)),
  };
};

// Returns a score for each action
const getActionScoresForShuffledState = (
  shuffledState: ISkyjoState
): { [key: string]: number } => {
  const allowedActionTypes = getAllowedActionTypes(shuffledState);

  const actionScores = allowedActionTypes.map((actionType) => {
    return getScoreForAction(shuffledState, actionType, 50);
  });

  const result: { [key: string]: number } = {};
  allowedActionTypes.forEach((type, index) => {
    result[type] = actionScores[index];
  });

  return result;
};

const getScoreForAction = (
  state: ISkyjoState,
  actionType: ActionType,
  simulationCount: number
): number => {
  let sum = 0;

  for (let i = 0; i < simulationCount; i++) {
    sum += getGameScore(state, actionType);
  }

  return sum / simulationCount;
};

const getGameScore = (state: ISkyjoState, actionType: ActionType): number => {
  const game = prepareGame(state);
  const aiPlayerIndex =
    (game.state.round.currentPlayerIndex + 1) % game.players.length;
  const aiPlayer = game.players[aiPlayerIndex];
  const strategy = generateSpecificActionStrategy(actionType);
  aiPlayer.strategy = strategy;

  game.nextTurn();

  const endGameState = playRandomGame(game);
  const playerStates = endGameState.round.playerStates;
  return playerStates[aiPlayerIndex].globalScore ===
    Math.min(...playerStates.map((s) => s.globalScore))
    ? 1
    : 0;
};

const getAllowedActionTypes = (state: ISkyjoState): ActionType[] => {
  const game = prepareGame(state);
  return game.getAllowedActionTypes();
};

const prepareGame = (state: ISkyjoState): SkyjoGame => {
  const players = Array(state.round.playerStates.length).fill({
    strategy: randomStrategy,
  });
  const game = new SkyjoGame(players);
game.setState(state);
  return game;
};
