import IAction from "./IAction";
import IPlayer from "./IPlayer";

export default abstract class Game<IState> {
  state: IState;
  actions: IAction<IState>[];
  players: IPlayer<IState>[];

  constructor(state: IState, actions: IAction<IState>[], players: IPlayer<IState>[]) {
    this.state = state;
    this.actions = actions;
    this.players = players;
  }

  start() {
    while (!this.isGameFinished()) {
      const player = this.determineNextPlayer();
      this.executeTurn(player);
    }
  }

  executeTurn(player: IPlayer<IState>) {
    const action = player.strategy(this.state, this.getAllowedActions(this.state));
    action.updateState(this.state);
    if (!action.endsTurn) {
      this.executeTurn(player);
    }
  }

  abstract determineNextPlayer(): IPlayer<IState>;

  abstract isGameFinished(): boolean;

  abstract getAllowedActions(state: IState): IAction<IState>[];

}