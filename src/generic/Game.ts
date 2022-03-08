import IAction from "./IAction";
import IPlayer from "./IPlayer";

//TODO: only pass copies of state, never state!!

export default abstract class Game<IState, ActionType> {
  state: IState;
  players: IPlayer<IState, ActionType>[];

  constructor(state: IState, players: IPlayer<IState, ActionType>[]) {
    this.state = state;
    this.players = players;
  }

  public nextTurn(): boolean {
    if (!this.isGameFinished()) {
      this.beforeTurn();
      const player = this.nextPlayersTurn();
      this.executeTurn(player);
      this.afterTurn();
      return true;
    }
    return false;
  }

  private executeTurn(player: IPlayer<IState, ActionType>) {
    const actionType = player.strategy(this.state, this.getAllowedActionTypes());
    const action = this.getActionByType(actionType);
    action.updateState();
    if (!action.endsTurn) {
      this.executeTurn(player);
    }
  }

  abstract beforeTurn(): void;

  abstract afterTurn(): void;

  abstract nextPlayersTurn(): IPlayer<IState, ActionType>;

  abstract isGameFinished(): boolean;

  abstract getAllowedActionTypes(): ActionType[];

  abstract getWinnerIndex(): number;

  abstract clone(): Game<IState, ActionType>;

  abstract getActionByType(type: ActionType): IAction<ActionType>;
}