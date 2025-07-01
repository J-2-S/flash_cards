import { readFile, writeFile } from "fs/promises";
import { Card, CardJson, DeckJson, Response } from "./cards";
import { ollama_compare } from "./ollama";


export class Deck {
   readonly name: String;
   private cards: Map<String, Card>;
   private count: number;

   constructor(deck: DeckJson) {
      this.name = deck.name;
      this.count = deck.count;
      this.cards = new Map<String, Card>();
      deck.cards.forEach((card: CardJson) => {
         this.cards.set(card.question, new Card(card));
      });
   }

   /**
   * Pulls a random card from the deck
   * @param evaluation_callback A function that should handle what's done with the card, presents it to the user, and returns a response
   * @returns a random card from the deck
   */
   public pull_random(): Card | undefined {
      const random_number: number = Math.floor(Math.random() * this.cards.size);
      const card = this.cards.get(
         this.cards.keys()
            .toArray()[random_number]
      );
      return card;
   }

   /**
   * Pulls the best possible card from the deck
   * @param evaluation_callback A function that should handle what's done with the card, presents it to the user, and returns a response
   * @returns [ correct: boolean, feedback: String ] */
   public pull_best(): Card | undefined {
      let lowest = Number.MAX_VALUE;
      let lowest_key: String = "";

      this.cards.forEach((card: Card, key: String) => {
         const temp = card.last_used + card.score * this.cards.size / 5;
         if (temp < lowest) {
            lowest = temp;
            lowest_key = key
         }
      })
      return this.cards.get(lowest_key)
   }

   public length(): number {
      return this.cards.size;
   }

   public to_json(): DeckJson {
      const deck_json: DeckJson = {
         name: this.name,
         count: this.count,
         cards: Array.from(this.cards.values()).map((card: Card) => card.to_json()),
      };
      return deck_json;
   }

   public async add_card(question: String, answer: String): Promise<void> {
      const card = new Card({
         question: question,
         answer: answer,
         score: 0,
         history: [],
         last_used: 0,
      });
      this.cards.set(question, card);
      this.count++;
   }
}

