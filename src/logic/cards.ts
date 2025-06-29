export type CardJson =  {
   question: String;
   answer: String;
   score: number;
   history: number[];
   last_used: number;
}

export class Card {
   question: String;
   answer: String;
   score: number;
   private history: number[];
   last_used: number;

   constructor( card : CardJson ) {
      this.question = card.question;
      this.answer = card.answer;
      this.score = card.score;
      this.history = card.history;
      this.last_used = card.last_used;
   }

   /** 
   * @param score the score the user recived
   * @param count the deck's count variable at the time of use
   */
   use( score: number, count: number ) {
      this.history.shift();
      this.history.push(score);
      this.last_used = count
   }
   

}

export type DeckJson = {
   name: String;
   cards: CardJson[];
   count: number;
}
