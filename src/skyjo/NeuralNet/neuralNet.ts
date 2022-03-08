import { generateTrainingData } from './dataGeneration';
const brain = require("brain.js")

const data = generateTrainingData();

const config = {
  binaryThresh: 0.5,
  hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  log: true,
  logPeriod: 10,
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

const net = new brain.NeuralNetwork(config);

net.train(data);

// const output = net.run([1, 0]); // [0.987]