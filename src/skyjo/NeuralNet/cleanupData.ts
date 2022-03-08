import { readObjectFromFile, writeObjectToFile } from './../../util';
const data: [] = readObjectFromFile("validation.json");

const newData = data.map(x => {
  for (let i = 1; i < 150; i++) {
    delete x["discardPile" + i];
  };
  return x;
});

writeObjectToFile("validation.json", newData);