import IAction from "./IAction";

export default interface IPlayer <IState> {
  id: string;
  strategy: (state: IState, allowedActions: IAction<IState>[]) => IAction<IState>;
}