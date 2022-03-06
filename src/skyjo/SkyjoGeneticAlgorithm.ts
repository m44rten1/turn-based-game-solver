import SkyjoGame, { ActionType } from "./SkyjoGame";
import ISkyjoState from "./ISkyjoState";
import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";

type Chromosome = ActionType[];

const initialPopulationSize = 10;

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

const stateCompression = (skyjoState: ISkyjoState): number => {
  const highestCardFromDiscardPile =
    skyjoState.discardPile[skyjoState.discardPile.length - 1];
  const highestOpenHandCard = Math.max(
    ...skyjoState.playerStates[skyjoState.currentPlayerIndex].openCards
  );
  if (skyjoState.drawnClosedCard === null) {
    if (highestCardFromDiscardPile < highestOpenHandCard) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (skyjoState.drawnClosedCard < highestOpenHandCard) {
      return 2;
    } else {
      return 3;
    }
  }
};

const generateRandomChromosome = (): Chromosome => {
  return Array(4)
    .fill(null)
    .map(() => getRandomActionType());
};

const createPopulation = (): Chromosome[] => {
  const chromosomes: Chromosome[] = [];
  for (let i = 0; i < initialPopulationSize; i++) {
    chromosomes.push(generateRandomChromosome());
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
): ((state: ISkyjoState, allowedActions: IAction[]) => Promise<IAction>) => {
  return (state: ISkyjoState, allowedActions: IAction[]) => {
    const stateIndex = stateCompression(state);

    let actionType = chromosome[stateIndex];

    let action = allowedActions.find((action) => action.type === actionType);
    if (!action) {
      action =
        allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
    }

    return Promise.resolve(action);
  };
};

const createPlayer = (chromosome: Chromosome): IPlayer<ISkyjoState> => {
  return {
    strategy: strategyGenerator(chromosome)
  }
}

const doesABeatBFunction = async (
  chromosomeA: Chromosome,
  chromosomeB: Chromosome
) => {
  const player1 = createPlayer(chromosomeA);
  const player2 = createPlayer(chromosomeB);

  const game = new SkyjoGame([player1, player2]);
  await game.start();
  return game.getWinnerIndex() === 0;
};

const config = {
  mutationFunction,
  crossoverFunction,
  doesABeatBFunction,
  population: createPopulation(),
  populationSize: 10, // defaults to 100
};

const GeneticAlgorithmConstructor = require("geneticalgorithm");
const geneticAlgorithm = GeneticAlgorithmConstructor(config);

const chooseRandomActionStrategy = (
  state: ISkyjoState,
  allowedActions: IAction[]
) => {
  const randomAction =
    allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
  return Promise.resolve(randomAction);
};

const randomPlayer: IPlayer<ISkyjoState> = {
  strategy: chooseRandomActionStrategy,
};

const playGameAndPrintScore = async (player1: IPlayer<ISkyjoState>, player2: IPlayer<ISkyjoState>, gameIndex: number) => {
  const game = new SkyjoGame([player1, player2]);
  await game.start();
  console.log(`--- GAME ${gameIndex} STARTS ---`);
  console.log(`Player1: ${game.state.playerStates[0].globalScore}`);
  console.log(`Player2: ${game.state.playerStates[1].globalScore}`);
  console.log("");
}

const test = async () => {
  for(let i = 0; i < 10; i++) {
    geneticAlgorithm.evolve();
    const best: Chromosome = geneticAlgorithm.best();
    const player = createPlayer(best);
    await playGameAndPrintScore(player, randomPlayer, i);
  }
}

test();