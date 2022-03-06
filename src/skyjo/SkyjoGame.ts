import Game from "../generic/Game";
import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";
import ISkyjoState from "./ISkyjoState";

class SkyjoGame extends Game<ISkyjoState> {

  handSize: number = 12;

  constructor(players: IPlayer<ISkyjoState>[]) {

    const skyjoState: ISkyjoState = {
      openCard: null,
      deck: [],
      drawnClosedCard: null,
      playerStates: new Map(players.map(player => { return [player, {openCards: [], closedCards: []}]})),
      currentPlayerIndex: 0
    }

    const actions: IAction<ISkyjoState>[] = []; // TODO: create all possible actions

    super(skyjoState, actions, players);
    this.initState();

  }

  initState(): void {
    this.initDeck();
    this.dealCards();
    this.initOpenCard();
  }

  initDeck(): void {
    this.addCardsToDeck([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10);
    this.addCardsToDeck([0], 15);
    this.addCardsToDeck([-2], 5);

    this.shuffle();
  }

  addCardsToDeck(cards: number[], repeat: number = 1): void {
    Array(repeat).fill(null).forEach(() => {
      this.state.deck.push(...cards);
    })
  }

  shuffle(): void {
    this.state.deck = this.state.deck
      .map(card => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }

  dealCards(): void {
    this.players.forEach(player => {
      const playerState = this.state.playerStates.get(player);

      for (let i = 0; i < this.handSize; i++)
        playerState?.closedCards.push(this.drawCardFromDeck());
    })
  }

  initOpenCard(): void {
    this.state.openCard = this.drawCardFromDeck();
  }

  drawCardFromDeck(): number {
    const topCard = this.state.deck.pop();
    if (topCard === undefined) throw new Error('No cards left in the deck');
    return topCard;
  }

  determineNextPlayer(): IPlayer<ISkyjoState> {
    const player = this.players[this.state.currentPlayerIndex];
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.players.length;
    return player;
  }

  isGameFinished(): boolean {
    return false; //TODO: check score?? OR check all open cards of every player
  };

  getAllowedActions(state: ISkyjoState): IAction<ISkyjoState>[] {
    return []; // TODO: check state for current player...
  }
}