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

  start() {
    while (!this.isGameFinished()) {
      const player = this.determineNextPlayer();
      this.executeTurn(player);
    }
  }

  executeTurn(player: IPlayer<IState>) {
    const action = player.strategy(this.state, this.getAllowedActions());
    action.updateState();
    if (!action.endsTurn) {
      this.executeTurn(player);
    }
  }

  abstract determineNextPlayer(): IPlayer<IState>;

  abstract isGameFinished(): boolean;

  abstract getAllowedActions(): IAction[];

}