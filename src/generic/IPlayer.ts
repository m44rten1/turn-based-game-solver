export default interface IPlayer <IState, ActionType> {
  strategy: (state: IState, allowedActions: ActionType[]) => ActionType;
}