export const randomInt = (range: number) => {
  return Math.floor(Math.random() * range);
};

const fs = require('fs');

const defaultFileName = 'data.json';

export const readObjectFromFile = (fileName: string = defaultFileName): any => {
  let rawdata = fs.readFileSync(fileName);
  return JSON.parse(rawdata);
}

export const writeObjectToFile = (fileName: string = defaultFileName, data: any): void => {
  fs.writeFileSync(fileName, JSON.stringify(data));
}

export const addDataToFile = (fileName: string = defaultFileName, data: any): void => {
  const fileData = readObjectFromFile(fileName);
  const newData = [...fileData, ...data];
  writeObjectToFile(fileName, newData);
}