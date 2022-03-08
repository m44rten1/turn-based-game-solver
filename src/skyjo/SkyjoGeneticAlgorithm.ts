import SkyjoGame, { ActionType } from "./SkyjoGame";
import ISkyjoState from "./ISkyjoState";
import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";

export type Chromosome = ActionType[];

const initialPopulationSize = 200;

const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandomActionType = (): ActionType => {
  return actionTypes[randomIntFromInterval(0, actionTypes.length - 1)];
};

const actionTypes: ActionType[] = [
  "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
  "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD",
  "DRAW_CLOSED_DECK_CARD",
  "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD",
  "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
  "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD",
];

const stateCompressionOld = (skyjoState: ISkyjoState): number => {
  const topCardFromDiscardPile =
    skyjoState.round.discardPile[skyjoState.round.discardPile.length - 1];
  const highestOpenHandCard = Math.max(
    ...skyjoState.round.playerStates[skyjoState.round.currentPlayerIndex]
      .openCards
  );
  if (skyjoState.round.drawnClosedCard === null) {
    if (topCardFromDiscardPile < highestOpenHandCard) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (skyjoState.round.drawnClosedCard < highestOpenHandCard) {
      return 2;
    } else {
      return 3;
    }
  }
};

const stateCompression = (skyjoState: ISkyjoState): number => {
  let result = 0;

  const currentPlayerState =
    skyjoState.round.playerStates[skyjoState.round.currentPlayerIndex];

  const topCardFromDiscardPile =
    skyjoState.round.discardPile[skyjoState.round.discardPile.length - 1];
  const highestOpenHandCard = Math.max(...currentPlayerState.openCards);

  if (currentPlayerState.closedCards.length === 1) {
    const allScores = skyjoState.round.playerStates.map(
      (ps) => ps.openCards.reduce((a, b) => a + b) + ps.closedCards.length * 5
    );
    const bestScore = Math.min(...allScores);
    if (
      currentPlayerState.openCards.reduce((a, b) => a + b) +
        currentPlayerState.closedCards.length * 5 ===
      bestScore
    ) {
      result += 4;
    } else {
      result += 8;
    }
  }
  if (skyjoState.round.drawnClosedCard === null) {
    if (topCardFromDiscardPile < highestOpenHandCard) {
      result += 0;
    } else {
      result += 1;
    }
  } else {
    if (skyjoState.round.drawnClosedCard < highestOpenHandCard) {
      result += 2;
    } else {
      result += 3;
    }
  }

  return result;
};

const generateRandomChromosome = (length: number = 4): Chromosome => {
  return Array(length)
    .fill(null)
    .map(() => getRandomActionType());
};

const createPopulation = (): Chromosome[] => {
  const chromosomes: Chromosome[] = [];
  for (let i = 0; i < initialPopulationSize; i++) {
    chromosomes.push(generateRandomChromosome(12));
  }
  return chromosomes;
};

const mutationFunction = (chromosome: Chromosome) => {
  return chromosome.map((gen) => {
    return Math.random() > 0.9 ? getRandomActionType() : gen;
  });
};

const crossoverFunction = (
  chromosomeA: Chromosome,
  chromosomeB: Chromosome
): Chromosome[] => {
  const result: Chromosome[] = [[], []];

  chromosomeA.forEach((_, index) => {
    const randomBit = Math.random() > 0.5;
    result[0].push(randomBit ? chromosomeA[index] : chromosomeB[index]);
    result[1].push(randomBit ? chromosomeB[index] : chromosomeA[index]);
  });
  return result;
};

const strategyGenerator = (
  chromosome: Chromosome
): ((state: ISkyjoState, allowedActions: ActionType[]) => ActionType) => {
  return (state: ISkyjoState, allowedActions: ActionType[]) => {
    const stateIndex = stateCompression(state);

    let actionType = chromosome[stateIndex];

    let action = allowedActions.find((action) => action === actionType);
    if (!action) {
      action =
        allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
    }

    return action;
  };
};

const strategyGeneratorOld = (
  chromosome: Chromosome
): ((state: ISkyjoState, allowedActions: ActionType[]) => ActionType) => {
  return (state: ISkyjoState, allowedActions: ActionType[]) => {
    const stateIndex = stateCompressionOld(state);

    let actionType = chromosome[stateIndex];

    let action = allowedActions.find((action) => actionType === action);
    if (!action) {
      action =
        allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
    }

    return action;
  };
};

const createPlayer = (chromosome: Chromosome): IPlayer<ISkyjoState, ActionType> => {
  return {
    strategy: strategyGenerator(chromosome),
  };
};

const createPlayerOld = (chromosome: Chromosome): IPlayer<ISkyjoState, ActionType> => {
  return {
    strategy: strategyGeneratorOld(chromosome),
  };
};

const doesABeatBFunction = (
  chromosomeA: Chromosome,
  chromosomeB: Chromosome
) => {
  const player1 = createPlayer(chromosomeA);
  const player2 = createPlayer(chromosomeB);

  const game = new SkyjoGame([player1, player2]);
  let hasNextTurn = true;
  while (hasNextTurn) {
    hasNextTurn = game.nextTurn();
  }
  return game.getWinnerIndex() === 0;
};

const fitnessFunction = (chromosome: Chromosome): number => {
  let totalScore = 0;

  const player = createPlayer(chromosome);

  for (let i = 0; i < 30; i++) {
    const game = new SkyjoGame([player, randomPlayer]);
    let hasNextTurn = true;
    while (hasNextTurn) {
      hasNextTurn = game.nextTurn();
    }
    totalScore += game.state.round.playerStates[0].globalScore;
  }
  return -totalScore;
};

const config = {
  mutationFunction,
  crossoverFunction,
  // doesABeatBFunction,
  fitnessFunction,
  population: createPopulation(),
  populationSize: initialPopulationSize, // defaults to 100
};

const GeneticAlgorithmConstructor = require("geneticalgorithm");
const geneticAlgorithm = GeneticAlgorithmConstructor(config);

const chooseRandomActionStrategy = (
  state: ISkyjoState,
  allowedActions: ActionType[]
) => {
  const randomAction =
    allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
  return randomAction;
};

const randomPlayer: IPlayer<ISkyjoState, ActionType> = {
  strategy: chooseRandomActionStrategy,
};

const playGameAndPrintScore = (
  player1: IPlayer<ISkyjoState, ActionType>,
  player2: IPlayer<ISkyjoState, ActionType>,
  gameIndex: number
) => {
  const game = new SkyjoGame([player1, player2]);
  let hasNextTurn = true;
  while (hasNextTurn) {
    hasNextTurn = game.nextTurn();
  }
  console.log(`--- GAME ${gameIndex} STARTS ---`);
  console.log(`Player1: ${game.state.round.playerStates[0].globalScore}`);
  console.log(`Player2: ${game.state.round.playerStates[1].globalScore}`);
  console.log("");
  return game.getWinnerIndex();
};

const possibleChromomes: Chromosome[] = [];

const actionTypesForFirstTwo: ActionType[] = actionTypes.slice(0, 3);
const actionTypesForLastTwo: ActionType[] = actionTypes.slice(3);

actionTypesForFirstTwo.forEach((type1) => {
  actionTypesForFirstTwo.forEach((type2) => {
    actionTypesForLastTwo.forEach((type3) => {
      actionTypesForLastTwo.forEach((type4) => {
        possibleChromomes.push([type1, type2, type3, type4]);
      });
    });
  });
});

const scores = possibleChromomes.map((chromosome) => {
  let totalScore = 0;

  const player = createPlayerOld(chromosome);

  for (let i = 0; i < 100; i++) {
    const game = new SkyjoGame([player, randomPlayer]);
    let hasNextTurn = true;
    while (hasNextTurn) {
      hasNextTurn = game.nextTurn();
    }
    totalScore += game.state.round.playerStates[0].globalScore;
  }
  return -totalScore;
});

const test = () => {
  const winnerCount = [0, 0];
  const iterationCount = 100;

  for (let i = 0; i < iterationCount; i++) {
    geneticAlgorithm.evolve();
    const best: Chromosome = geneticAlgorithm.best();
    const player = createPlayer(best);
    const goodStrategy = createPlayer(possibleChromomes[21]);
    const winnerIndex = playGameAndPrintScore(player, goodStrategy, i);
    winnerCount[winnerIndex]++;
    console.log("Best: ", best);
  }

  console.log("Win rate GA: ", (100 * winnerCount[0]) / iterationCount);
};

test();

console.log("Done", scores.indexOf(Math.max(...scores)));
console.log("Done");
