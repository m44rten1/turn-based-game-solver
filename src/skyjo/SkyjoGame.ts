import Game from "../generic/Game";
import IAction from "../generic/IAction";
import IPlayer from "../generic/IPlayer";
import ISkyjoPlayerState from "./ISkyjoPlayerState";
import ISkyjoState from "./ISkyjoState";

export type actionType = 
| "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD"
| "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD"
| "DRAW_CLOSED_DECK_CARD"
| "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD"
| "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD"
| "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD"

class SkyjoGame extends Game<ISkyjoState> {

  // TODO: game settings object
  handSize: number = 12;
  initialOpenCards: number = 2;

  constructor(players: IPlayer<ISkyjoState>[]) {

    const skyjoState: ISkyjoState = {
      discardPile: [],
      deck: [],
      drawnClosedCard: null,
      playerStates: new Map(players.map(player => { return [player, {openCards: [], closedCards: [], globalScore: 0}]})),
      currentPlayerIndex: 0
    }

    super(skyjoState, players);
    this.initState();
  }

  initState(): void {
    this.initDeck();
    this.dealCards();
    this.initOpenCard();
    this.initPlayersOpenCards();
  }

  initDeck(): void {
    this.addCardsToDeck([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10);
    this.addCardsToDeck([0], 15);
    this.addCardsToDeck([-2], 5);

    this.shuffle();
  }

  allActions(): IAction[] {
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


          this.state.drawnClosedCard = null;
        },
        endsTurn: true
      }
    ];
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
    this.state.discardPile.push(this.drawCardFromDeck());
  }

  initPlayersOpenCards(): void {
    this.players.forEach(player => {
      const playerState = this.getPlayersState(player);
      for (let i = 0; i < this.initialOpenCards; i++) {
        const card = playerState.closedCards.pop();
        card && playerState.openCards.push(card);
      }
    });
  }

  drawCardFromDeck(): number {
    const card = this.state.deck.pop();
    if (card === undefined) throw new Error('Illegal action: No cards left in the deck');
    return card;
  }

  drawCardFromDiscardPile(): number {
    const card = this.state.discardPile.pop();
    if (card === undefined) throw new Error('Illegal action: No cards available on the discard pile');
    return card;
  }

  drawCardFromClosedPlayerCards(playerState: ISkyjoPlayerState): number {
    const card = playerState.closedCards.pop();
    if (card === undefined) throw new Error("Illegal action: no cards available in closed cards");
    return card;
  }

  drawCardFromOpenPlayerCards(playerState: ISkyjoPlayerState): number {
    const card = playerState.openCards.pop();
    if (card === undefined) throw new Error("Illegal action: no cards available in open cards");
    return card;
  }

  drawHighestOpenHandCard(playerState: ISkyjoPlayerState): number {
    const highestCard = Math.max(...playerState.openCards);
    const indexOfHighestCard = playerState.openCards.indexOf(highestCard);
    return playerState.openCards.splice(indexOfHighestCard, 1)[0];
  }

  determineNextPlayer(): IPlayer<ISkyjoState> {
    const player = this.players[this.state.currentPlayerIndex];
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.players.length;
    return player;
  }

  getCurrentPlayer(): IPlayer<ISkyjoState> {
    return this.players[this.state.currentPlayerIndex];
  }

  getPlayersState(player?: IPlayer<ISkyjoState>): ISkyjoPlayerState {
    return this.state.playerStates.get(player || this.getCurrentPlayer())!;
  }

  isGameFinished(): boolean {
    return false; //TODO: check score?? OR check all open cards of every player
    // Check score - deze ftie moet enkel de eindconditie van het spel checken
  };

  getAllowedActions(): IAction[] {
    return []; 
    
    // TODO: check state for current player...
    // Is deze functie nodig? Je kan altijd alle acties meegeven, de actie die de speler kiest hangt volledig van z'n state af?
    // Je kan bij het executen van de actie checken of de actie valid is en zo niet een nieuwe actie vragen (kan wel inf loop veroorzaken)
  }
}