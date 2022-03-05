export default interface IAction <IState> {
  updateState: (state: IState) => void;
  endsTurn: boolean;
}