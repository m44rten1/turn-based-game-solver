import { readObjectFromFile } from "./../../util";
import { Chromosome } from "./../SkyjoGeneticAlgorithm";
import { ActionType } from "./../SkyjoGame";
import ISkyjoState from "../ISkyjoState";

let data: ISkyjoState[] = readObjectFromFile("ga-validation.json");
let answers: {
  input: { [key: string]: number };
  output: { [key: string]: number };
}[] = readObjectFromFile("validation.json");

const actionTypes: ActionType[] = [
  "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
  "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD",
  "DRAW_CLOSED_DECK_CARD",
  "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD",
  "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
  "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD",
];

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

const total = answers.length;
let sum = 0;

data.forEach((x, index) => {
  const stateIndex = stateCompression(x);

  if(answers[index].output[possibleChromomes[21][stateIndex]] === 1) {
    sum++
  }
});

const error = 1 - (sum / total);
console.log(error);
