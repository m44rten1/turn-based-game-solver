import {ActionType} from "./SkyjoGame"
import ISkyjoState from "./ISkyjoState"
import IAction from "../generic/IAction";

const initialPopulationSize = 10

const stateCompression = (skyjoState: ISkyjoState): number => {
    const highestCardFromDiscardPile = skyjoState.discardPile[skyjoState.discardPile.length - 1];
    const highestOpenHandCard = Math.max(...skyjoState.playerStates[skyjoState.currentPlayerIndex].openCards);
    if(skyjoState.drawnClosedCard === null){
        if(highestCardFromDiscardPile < highestOpenHandCard){
            return 0
        }
        else{
            return 1
        }
    }
    else
    {
        if(skyjoState.drawnClosedCard < highestOpenHandCard){
            return 2
        }
        else{
            return 3
        }
    }

}

const generateRandomChromosome = ():  IAction[]  =>{
    
    return [];
}


const createPopulation = (): IAction[][]  =>{
    const chromosomes: IAction[][] = [];
    for(let i = 0; i = initialPopulationSize; i++){
        chromosomes.push(generateRandomChromosome())
    }
    return chromosomes;
}



var config = {
    mutationFunction: (aMutationFunctionYouSupply),
    crossoverFunction: yourCrossoverFunction,
    doesABeatBFunction: yourCompetitionFunction,
    population: [ /* one or more phenotypes */ ],
    populationSize: aDecimalNumberGreaterThanZero 	// defaults to 100
}

var GeneticAlgorithmConstructor = require('geneticalgorithm')
var geneticalgorithm = GeneticAlgorithmConstructor( config )