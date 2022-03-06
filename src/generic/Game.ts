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

  public async start() {
    while (!this.isGameFinished()) {
      const player = this.determineNextPlayer();
      this.beforeNewTurn();
      await this.executeTurn(player);
    }
  }

  private async executeTurn(player: IPlayer<IState>) {
    const action = await player.strategy(this.state, this.getAllowedActions());
    action.updateState();
    if (!action.endsTurn) {
      this.executeTurn(player);
    }
  }

  abstract beforeNewTurn(): void;

  abstract determineNextPlayer(): IPlayer<IState>;

  abstract isGameFinished(): boolean;

  abstract getAllowedActions(): IAction[];

}