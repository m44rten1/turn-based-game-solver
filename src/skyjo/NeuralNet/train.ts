import { readObjectFromFile } from './../../util';
const brain = require("brain.js")
const fs = require('fs');

const data = readObjectFromFile("data.json");

const config = {
  binaryThresh: 0.5,
  hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  log: true,
  errorThresh: 0.0005,
  logPeriod: 10,
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

const net = new brain.NeuralNetwork(config);

net.train(data);

const fileName = "model.json";
fs.writeFileSync(fileName, JSON.stringify(net));

// const net2 = new brain.NeuralNetwork();
// net2.fromJSON(fs.readFileSync(fileName))

// console.log()
// const output = net.run([1, 0]); // [0.987]