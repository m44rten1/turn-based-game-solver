import IAction from "./IAction";

export default interface IPlayer <IState> {
  id: string; // TODO: how to handle this?
  strategy: (state: IState, allowedActions: IAction[]) => IAction;
}