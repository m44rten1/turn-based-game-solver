import { readObjectFromFile, writeObjectToFile } from './../../util';
const data: {input: {[key: string]: number}}[] = readObjectFromFile("data.json");

const mapper = (x: number): number => ((x / 2) + 0.5)

const newData = data.map(a => {
  const x = a.input;
  x["drawnClosedCard"] = mapper(x["drawnClosedCard"]);
  x["discardPile0"] = mapper(x["discardPile0"]);

  for(let i=0; i < 20; i++) {
    if (x["player_0_OpenCard" + i]) {
      x["player_0_OpenCard" + i] = mapper(x["player_0_OpenCard" + i]);
    }

    if (x["player_AI_OpenCard" + i]) {
      x["player_AI_OpenCard" + i] = mapper(x["player_AI_OpenCard" + i]);
    }
  }
  a.input = x;

  return a;

});


writeObjectToFile("data.json", newData);