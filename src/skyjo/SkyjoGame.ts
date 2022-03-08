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
  | "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD";

export default class SkyjoGame extends Game<ISkyjoState, ActionType> {
  // Game settings
  settings = {
    handSize: 12,
    initialOpenCards: 2,
    maxGlobalScore: 100,
  };

  roundIndex = 0;
  turnIndex = 0;

  constructor(players: IPlayer<ISkyjoState, ActionType>[]) {
    const skyjoState: ISkyjoState = {
      round: {
        discardPile: [],
        deck: [],
        drawnClosedCard: null,
        playerStates: players.map(() => {
          return { openCards: [], closedCards: [], globalScore: 0 };
        }),
        currentPlayerIndex: 0,
      },
      global: {
        isRoundStarted: false,
        roundEndedPlayerIndex: -1,
      }
    };

    super(skyjoState, players);
    this.beforeTurn();
  }

  public clone(): SkyjoGame {
    const clonedPlayers = this.players.map((player) => {
      return { strategy: player.strategy };
    });

    const game = new SkyjoGame(clonedPlayers);
    game.settings = this.deepClone(this.settings);
    game.state = this.deepClone(this.state);

    return game;
  }

  public setState(state: ISkyjoState): void {
    this.state = this.deepClone(state);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  public getWinnerIndex(): number {
    const playerGlobalScores = this.state.round.playerStates.map(
      (playerState) => playerState.globalScore
    );
    const minGlobalScore = Math.min(...playerGlobalScores);
    const indexOfMax = playerGlobalScores.indexOf(minGlobalScore);
    return this.isGameFinished() ? indexOfMax : -1;
  }

  public beforeTurn(): void {
    if (!this.state.global.isRoundStarted) {
      this.initState();
      this.state.global.isRoundStarted = true;
    }
  }

  public afterTurn(): void {
    this.turnIndex++;
    const lastMoveMade = this.getPlayersState().closedCards.length === 0;

    if (this.state.global.roundEndedPlayerIndex === -1 && lastMoveMade) {
      this.state.global.roundEndedPlayerIndex =
        this.state.round.currentPlayerIndex;
    }

    if (
      this.getNextPlayerIndex() === this.state.global.roundEndedPlayerIndex
    ) {
      this.openAllClosedCards();
      this.roundEnded();
    }
  }

  private openAllClosedCards() {
    this.state.round.playerStates.forEach((playerState) => {
      playerState.openCards.push(...playerState.closedCards);
      playerState.closedCards = [];
    });
  }

  private roundEnded() {
    this.state.global.isRoundStarted = false;
    this.tallyRoundScores();
    this.state.global.roundEndedPlayerIndex = -1;
  }

  private tallyRoundScores(): void {
    const playerScores = this.state.round.playerStates.map((playerState) =>
      playerState.openCards.reduce((a, b) => a + b)
    );

    this.state.round.playerStates.forEach((playerState, index) => {
      const score = playerScores[index];

      if (
        index === this.state.global.roundEndedPlayerIndex &&
        playerScores.some((s) => s < score)
      ) {
        playerState.globalScore += 3 * score;
      } else {
        playerState.globalScore += score;
      }
    });
  }

  public isGameFinished(): boolean {
    return this.state.round.playerStates.some(
      (playerState) => playerState.globalScore >= this.settings.maxGlobalScore
    );
  }

  public getAllowedActionTypes(): ActionType[] {
    const actionsTypes: ActionType[] = [];

    const playerState = this.getPlayersState();

    if (!this.state.round.drawnClosedCard) {
      if (
        playerState.openCards.length > 0 &&
        this.state.round.discardPile.length > 0
      ) {
        actionsTypes.push("SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD");
      }

      if (
        playerState.closedCards.length > 0 &&
        this.state.round.discardPile.length > 0
      ) {
        actionsTypes.push("SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD");
      }

      if (this.state.round.deck.length > 0) {
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

    return actionsTypes;
  }

  public getActionByType(type: ActionType): IAction<ActionType> {
    const allActions = this.allActions();
    const action = allActions.find(action => action.type === type);
    if (!action) throw new Error("No action exists for the given type");
    return action;
  }

  public nextPlayersTurn(): IPlayer<ISkyjoState, ActionType> {
    this.state.round.currentPlayerIndex =
      (this.state.round.currentPlayerIndex + 1) % this.players.length;
    return this.players[this.state.round.currentPlayerIndex];
  }

  private initState(): void {
    this.initDeck();
    this.dealCards();
    this.initOpenCard();
    this.initPlayersOpenCards();
    this.state.round.drawnClosedCard = null;
    this.roundIndex ++;
  }

  private initDeck(): void {
    this.state.round.deck = [];
    this.state.round.discardPile = [];
    this.addCardsToDeck([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10);
    this.addCardsToDeck([0], 15);
    this.addCardsToDeck([-2], 5);

    this.shuffleDeck();
  }

  private allActions(): IAction<ActionType>[] {
    return [
      {
        type: "SWITCH_OPEN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
        updateState: () => {
          const playerState = this.getPlayersState();
          const openDeckCard = this.drawCardFromDiscardPile();
          this.state.round.discardPile.push(
            this.drawHighestOpenHandCard(playerState)
          );
          playerState.openCards.push(openDeckCard);
        },
        endsTurn: true,
      },
      {
        type: "SWITCH_OPEN_DECK_CARD_WITH_CLOSED_HAND_CARD",
        updateState: () => {
          const playerState = this.getPlayersState();
          const closedPlayerCard =
            this.drawCardFromClosedPlayerCards(playerState);
          const openDeckCard = this.drawCardFromDiscardPile();
          playerState.openCards.push(openDeckCard);
          this.state.round.discardPile.push(closedPlayerCard);
        },
        endsTurn: true,
      },
      {
        type: "DRAW_CLOSED_DECK_CARD",
        updateState: () => {
          this.state.round.drawnClosedCard = this.drawCardFromDeck();
        },
        endsTurn: false,
      },
      {
        type: "DISCARD_DRAWN_DECK_CARD_AND_OPEN_CLOSED_HAND_CARD",
        updateState: () => {
          if (!this.state.round.drawnClosedCard)
            throw new Error("Illegal action: No card was drawn");
          this.state.round.discardPile.push(this.state.round.drawnClosedCard);
          this.state.round.drawnClosedCard = null;
          const playerState = this.getPlayersState();
          const closedCard = this.drawCardFromClosedPlayerCards(playerState);
          playerState.openCards.push(closedCard);
        },
        endsTurn: true,
      },
      {
        type: "SWITCH_DRAWN_DECK_CARD_WITH_HIGHEST_OPEN_HAND_CARD",
        updateState: () => {
          if (!this.state.round.drawnClosedCard)
            throw new Error("Illegal action: No card was drawn");
          const playerState = this.getPlayersState();
          this.state.round.discardPile.push(
            this.drawHighestOpenHandCard(playerState)
          );
          playerState.openCards.push(this.state.round.drawnClosedCard);
          this.state.round.drawnClosedCard = null;
        },
        endsTurn: true,
      },
      {
        type: "SWITCH_DRAWN_DECK_CARD_WITH_CLOSED_HAND_CARD",
        updateState: () => {
          if (!this.state.round.drawnClosedCard)
            throw new Error("Illegal action: No card was drawn");
          const playerState = this.getPlayersState();
          const closedHandCard =
            this.drawCardFromClosedPlayerCards(playerState);
          this.state.round.discardPile.push(closedHandCard);
          playerState.openCards.push(this.state.round.drawnClosedCard);
          this.state.round.drawnClosedCard = null;
        },
        endsTurn: true,
      },
    ];
  }

  private addCardsToDeck(cards: number[], repeat: number = 1): void {
    Array(repeat)
      .fill(null)
      .forEach(() => {
        this.state.round.deck.push(...cards);
      });
  }

  public shuffleDeck(): void {
    this.state.round.deck = this.state.round.deck
      .map((card) => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }

  private dealCards(): void {
    this.state.round.playerStates.forEach((playerState) => {
      if (!playerState) throw new Error("Can't deal cards to this player");
      playerState.closedCards = [];

      for (let i = 0; i < this.settings.handSize; i++)
        playerState.closedCards.push(this.drawCardFromDeck());
    });
  }

  private initOpenCard(): void {
    this.state.round.discardPile.push(this.drawCardFromDeck());
  }

  private initPlayersOpenCards(): void {
    this.state.round.playerStates.forEach((playerState) => {
      playerState.openCards = [];
      for (let i = 0; i < this.settings.initialOpenCards; i++) {
        playerState.openCards.push(
          this.drawCardFromClosedPlayerCards(playerState)
        );
      }
    });
  }

  private drawCardFromDeck(): number {
    const card = this.state.round.deck.pop();
    if (card === undefined)
      throw new Error("Illegal action: No cards left in the deck");
    return card;
  }

  private drawCardFromDiscardPile(): number {
    const card = this.state.round.discardPile.pop();
    if (card === undefined)
      throw new Error("Illegal action: No cards available on the discard pile");
    return card;
  }

  private drawCardFromClosedPlayerCards(
    playerState: ISkyjoPlayerState
  ): number {
    const card = playerState.closedCards.pop();
    if (card === undefined)
      throw new Error("Illegal action: no cards available in closed cards");
    return card;
  }

  private drawHighestOpenHandCard(playerState: ISkyjoPlayerState): number {
    const highestCard = Math.max(...playerState.openCards);
    const indexOfHighestCard = playerState.openCards.indexOf(highestCard);
    return playerState.openCards.splice(indexOfHighestCard, 1)[0];
  }

  private getNextPlayerIndex(): number {
    return (this.state.round.currentPlayerIndex + 1) % this.players.length;
  }

  private getPlayersState(): ISkyjoPlayerState {
    return this.state.round.playerStates[this.state.round.currentPlayerIndex];
  }
}
