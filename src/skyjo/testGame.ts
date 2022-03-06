import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";
import ISkyjoState from "./ISkyjoState";
import SkyjoGame from "./SkyjoGame";

const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const players: IPlayer<ISkyjoState>[] = [];

const chooseRandomActionStrategy = (
  state: ISkyjoState,
  allowedActions: IAction[]
) => {
  const randomAction =
    allowedActions[randomIntFromInterval(0, allowedActions.length - 1)];
  return new Promise<IAction>((resolve) => {
    resolve(randomAction);
  });
};

players.push(
  {
    strategy: chooseRandomActionStrategy,
  },
  {
    strategy: chooseRandomActionStrategy,
  },
  {
    strategy: chooseRandomActionStrategy,
  }
);

const test = async () => {
  const game = new SkyjoGame(players);
  await game.start();
  console.log(game.state);
}

export default test;

