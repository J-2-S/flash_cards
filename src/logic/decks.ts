import { readFile } from "fs/promises";
import { Card, CardJson, DeckJson, Response } from "./cards";
import { ollama_compare } from "./ollama";


class Deck {
   name: String;
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
   * @returns [ correct: boolean, feedback: String ]
   */
   async pull_random( evaluation_callback: ( card: Card ) => Promise<Response> ): Promise<[ correct: boolean, feedback: String ] | undefined> {
      const random_number: number = Math.floor(Math.random() * this.cards.size );
      const card = this.cards.get( 
         this.cards.keys()
         .toArray()[random_number] 
      );

      if ( card !== undefined ) {
         const response = await evaluation_callback( card );
         card.use( response.score, this.count );
         return [ response.correct, response.feedback ]
      }

      return undefined

   }

   /**
   * Pulls the best possible card from the deck
   * @param evaluation_callback A function that should handle what's done with the card, presents it to the user, and returns a response
   * @returns [ correct: boolean, feedback: String ] */
   async pull_best( evaluation_callback: ( card: Card ) => Promise<Response> ): Promise<[ correct: boolean, feedback: String ] | undefined> {
      let lowest = Number.MAX_VALUE;
      let lowest_key: String = "";

      this.cards.forEach(( card: Card, key: String ) => {
         const temp = card.last_used + card.score * this.cards.size;
         if ( temp < lowest ) {
            lowest = temp;
            lowest_key = key
         }
      })

      const card = this.cards.get( lowest_key );

      if ( card !== undefined ) {
         const response = await evaluation_callback( card );
         card.use( response.score, this.count );
         return [ response.correct, response.feedback ]
      }

      return undefined
   }

}

class Decks {
   private decks: Map<String, Deck>;

   constructor(file_content: string) {
      const parsed = JSON.parse(file_content);
      this.decks = new Map<String, Deck>();
      const decks: DeckJson[] = parsed.decks;
      decks.forEach((deck) => {
         this.decks.set(deck.name, new Deck(deck));
      });

   }

   /**
   * Decks factory builder
   */
   static async create(): Promise<Decks> {
      const file_content = await readFile("./cards.json", "utf8");
      return new Decks(file_content);
   }

   list_decks(): String[] {
      return this.decks.keys().toArray();
   }

   get_deck( deck_name: String ): Deck | undefined {
      return this.decks.get( deck_name );
   }

}

/**
* A simple function to make input sources and comparison functions more interchangable
* @param input_source a function that returns the user input ( takes a card for display purposes )
* @param comparison_callback a function ( likely using ollama ) that compares a card and user input
*/
function input_callback_builder( 
      input_source: ( card: Card ) => String, 
      comparison_callback: ( card: Card, input: String ) => Promise<Response>
   ): ( card: Card ) => Promise<Response>
{
   return ( card: Card ) => { return comparison_callback( card, input_source( card ) ) };
}

// An example of drawing a single card from a deck
async function example() {
  const decks = await Decks.create();
  const deck = decks.get_deck( decks.list_decks()[1] );
  const dummy_input = ( card: Card ) => { return "Input"; }
  const best_card = await deck?.pull_best( input_callback_builder( dummy_input, ollama_compare ) )

}
