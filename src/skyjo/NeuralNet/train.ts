import { DataPoint } from './dataGeneration';
import { readObjectFromFile } from './../../util';
const brain = require("brain.js")
const fs = require('fs');

let data = readObjectFromFile("data.json");
// data = data.splice(2000)
const config = {
  binaryThresh: 0.5,
  hiddenLayers: [30], // array of ints for the sizes of the hidden layers in the network
  log: true,
  errorThresh: 0.0005,
  iterations: 5, // the maximum times to iterate the training data --> number greater than 0

  logPeriod: 100,
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

// const crossValidate = new brain.CrossValidate(() => new brain.NeuralNetwork(config));
// crossValidate.train(data, config, 10); //note k (or KFolds) is optional
// const json = crossValidate.toJSON(); // all stats in json as well as neural networks
// const net = crossValidate.toNeuralNetwork(); // get top performing net out of `crossValidate`


const net = new brain.NeuralNetwork(config);

net.train(data);

const validationData: DataPoint[] = readObjectFromFile("validation.json");

const bestKeyInObject = (object: {[key: string]: number}) => {
  let bestOutputValue = 0;
  let bestKey = "";

  for (const key in object) {
    if (object[key] > bestOutputValue) {
      bestOutputValue = object[key];
      bestKey = key;
    }
  }
  return bestKey;
}

let correct = 0;
validationData.forEach(item => {
  const pred = net.run(item.input);

  const correctKey = bestKeyInObject(item.output);
  const predictedKey = bestKeyInObject(pred);

  if (correctKey === predictedKey) {
    correct++;
  }
});

const errorRate = 1 - (correct/validationData.length);
console.log("Real validation error: ", errorRate);


// const fileName = "model.json";
// fs.writeFileSync(fileName, JSON.stringify(net.toJSON()));

// const net2 = new brain.NeuralNetwork();
// net2.fromJSON(JSON.parse(fs.readFileSync(fileName)))

// console.log()
//const output = net.run([1, 0]); // [0.987]