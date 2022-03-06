import Game from "../generic/Game";
import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";
import ISkyjoPlayerState from "./ISkyjoPlayerState";
import ISkyjoState from "./ISkyjoState";

export type ActionType = 
| "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD"
| "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD"
| "DRAW_CLOSED_DECK_CARD"
| "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD"
| "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD"
| "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD"

export default class SkyjoGame extends Game<ISkyjoState> {

  // Game settings
  handSize: number = 12;
  initialOpenCards: number = 2;
  maxGlobalScore: number = 100;

  // Global game state
  isRoundStarted = false;

  constructor(players: IPlayer<ISkyjoState>[]) {

    const skyjoState: ISkyjoState = {
      discardPile: [],
      deck: [],
      drawnClosedCard: null,
      playerStates: players.map(() => { return {openCards: [], closedCards: [], globalScore: 0}}),
      currentPlayerIndex: 0
    }

    super(skyjoState, players);
  }

  public beforeTurn(): void {
    if (!this.isRoundStarted) {
      this.initState();
      this.isRoundStarted = true;
    }
  }

  public afterTurn(): void {
    if (this.state.playerStates.every(playerState => playerState.closedCards.length === 0)) {
      this.roundEnded();
    }
  }

  private roundEnded() {
    this.isRoundStarted = false;
    this.tallyRoundScores();
  }

  private tallyRoundScores(): void {
    const playerScores = this.state.playerStates.map(playerState => playerState.openCards.reduce((a,b) => a + b));

    this.state.playerStates.forEach((playerState, index) => {
      const score = playerScores[index];

      if (index === this.getNextPlayerIndex() && playerScores.some(s => s >= score)) {
        playerState.globalScore += 3 * score;
      } else {
        playerState.globalScore += score;
      }
    })
  }

  public isGameFinished(): boolean {
    return this.state.playerStates.some(playerState => playerState.globalScore >= this.maxGlobalScore);
  }

  public getAllowedActions(): IAction[] {
    const actionsTypes: ActionType[] = [];

    const playerState = this.getPlayersState();

    if (!this.state.drawnClosedCard) {
      if (playerState.openCards.length > 0 && this.state.discardPile.length > 0) {
        actionsTypes.push("SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD");
      }

      if (playerState.closedCards.length > 0 && this.state.discardPile.length > 0) {
        actionsTypes.push("SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD");
      }

      if (this.state.deck.length > 0) {
        actionsTypes.push("DRAW_CLOSED_DECK_CARD");
      }
    } else {
      if (playerState.closedCards.length > 0) {
        actionsTypes.push("DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD");
        actionsTypes.push("SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD");
      }

      if (playerState.openCards.length > 0) {
        actionsTypes.push("SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD");
      }
    }

    return actionsTypes.map(actionType => this.allActions().find(action => action.type === actionType)!);
  }

  public determineNextPlayer(): IPlayer<ISkyjoState> {
    const player = this.players[this.state.currentPlayerIndex];
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.players.length;
    return player;
  }

  private initState(): void {
    this.initDeck();
    this.dealCards();
    this.initOpenCard();
    this.initPlayersOpenCards();
  }

  private initDeck(): void {
    this.addCardsToDeck([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10);
    this.addCardsToDeck([0], 15);
    this.addCardsToDeck([-2], 5);

    this.shuffle();
  }

  private allActions(): IAction[] {
    return [
      {
        type: "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
        updateState: () => {
          const playerState = this.getPlayersState();
          const openDeckCard = this.drawCardFromDiscardPile();
          playerState.openCards.push(openDeckCard)
          this.state.discardPile.push(this.drawHighestOpenHandCard(playerState));
        },
        endsTurn: true
      },
      {
        type: "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD",
        updateState: () => {
          const playerState = this.getPlayersState();
          const closedPlayerCard = this.drawCardFromClosedPlayerCards(playerState);
          const openDeckCard = this.drawCardFromDiscardPile();
          playerState.openCards.push(openDeckCard)
          this.state.discardPile.push(closedPlayerCard);
        },
        endsTurn: true
      },
      {
        type: "DRAW_CLOSED_DECK_CARD",
        updateState: () => {
          this.state.drawnClosedCard = this.drawCardFromDeck();
        },
        endsTurn: false
      },
      {
        type: "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD",
        updateState: () => {
          if (!this.state.drawnClosedCard) throw new Error("Illegal action: No card was drawn");
          this.state.discardPile.push(this.state.drawnClosedCard);
          this.state.drawnClosedCard = null;
          const playerState = this.getPlayersState();
          const closedCard = this.drawCardFromClosedPlayerCards(playerState);
          playerState.openCards.push(closedCard);
        },
        endsTurn: true
      },
      {
        type: "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
        updateState: () => {
          if (!this.state.drawnClosedCard) throw new Error("Illegal action: No card was drawn");
          const playerState = this.getPlayersState();
          this.state.discardPile.push(this.drawHighestOpenHandCard(playerState))
          playerState.openCards.push(this.state.drawnClosedCard);
          this.state.drawnClosedCard = null;
        },
        endsTurn: true
      },
      {
        type: "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD",
        updateState: () => {
          if (!this.state.drawnClosedCard) throw new Error("Illegal action: No card was drawn");
          const playerState = this.getPlayersState();
          const closedHandCard = this.drawCardFromClosedPlayerCards(playerState);
          this.state.discardPile.push(closedHandCard);
          playerState.openCards.push(this.state.drawnClosedCard);
          this.state.drawnClosedCard = null;
        },
        endsTurn: true
      }
    ];
  }

  private addCardsToDeck(cards: number[], repeat: number = 1): void {
    Array(repeat).fill(null).forEach(() => {
      this.state.deck.push(...cards);
    })
  }

  private shuffle(): void {
    this.state.deck = this.state.deck
      .map(card => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }

  private dealCards(): void {
    this.state.playerStates.forEach((playerState) => {
      if (!playerState) throw new Error("Can't deal cards to this player")
      playerState.closedCards = [];

      for (let i = 0; i < this.handSize; i++)
        playerState.closedCards.push(this.drawCardFromDeck());
    })
  }

  private initOpenCard(): void {
    this.state.discardPile.push(this.drawCardFromDeck());
  }

  private initPlayersOpenCards(): void {
    this.state.playerStates.forEach(playerState => {
      playerState.openCards = [];
      for (let i = 0; i < this.initialOpenCards; i++) {
        playerState.openCards.push(this.drawCardFromClosedPlayerCards(playerState));
      }
    });
  }

  private drawCardFromDeck(): number {
    const card = this.state.deck.pop();
    if (card === undefined) throw new Error('Illegal action: No cards left in the deck');
    return card;
  }

  private drawCardFromDiscardPile(): number {
    const card = this.state.discardPile.pop();
    if (card === undefined) throw new Error('Illegal action: No cards available on the discard pile');
    return card;
  }

  private drawCardFromClosedPlayerCards(playerState: ISkyjoPlayerState): number {
    const card = playerState.closedCards.pop();
    if (card === undefined) throw new Error("Illegal action: no cards available in closed cards");
    return card;
  }

  private drawHighestOpenHandCard(playerState: ISkyjoPlayerState): number {
    const highestCard = Math.max(...playerState.openCards);
    const indexOfHighestCard = playerState.openCards.indexOf(highestCard);
    return playerState.openCards.splice(indexOfHighestCard, 1)[0];
  }

  private getNextPlayerIndex(): number {
    return (this.state.currentPlayerIndex + 1) % this.players.length;
  }

  private getPlayersState(): ISkyjoPlayerState {
    return this.state.playerStates[this.state.currentPlayerIndex];
  }
}