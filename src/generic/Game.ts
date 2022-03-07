import IAction from "./IAction";
import IPlayer from "./IPlayer";

//TODO: only pass copies of state, never state!!

export default abstract class Game<IState> {
  state: IState;
  players: IPlayer<IState>[];

  constructor(state: IState, players: IPlayer<IState>[]) {
    this.state = state;
    this.players = players;
  }

  public start() {
    while (!this.isGameFinished()) {
      this.beforeTurn();
      const player = this.setNextPlayer();
      this.executeTurn(player);
      this.afterTurn();
    }
  }

  private executeTurn(player: IPlayer<IState>) {
    const action = player.strategy(this.state, this.getAllowedActions());
    action.updateState();
    if (!action.endsTurn) {
      this.executeTurn(player);
    }
  }

  abstract beforeTurn(): void;

  abstract afterTurn(): void;

  abstract setNextPlayer(): IPlayer<IState>;

  abstract isGameFinished(): boolean;

  abstract getAllowedActions(): IAction[];

  abstract getWinnerIndex(): number;
}