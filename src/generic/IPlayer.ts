import IAction from "./IAction";

export default interface IPlayer <IState> {
  strategy: (state: IState, allowedActions: IAction[]) => Promise<IAction>;
}