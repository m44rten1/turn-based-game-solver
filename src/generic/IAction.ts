export default interface IAction<ActionType> {
  type: ActionType;
  updateState: () => void;
  endsTurn: boolean;
}