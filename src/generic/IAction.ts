export default interface IAction {
  type: string;
  updateState: () => void;
  endsTurn: boolean;
}