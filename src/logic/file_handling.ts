'use server';
import { readFile, writeFile } from "fs/promises";
import { Deck } from "./decks";
import { DeckJson } from "./cards";

export async function save_decks(decks: Deck[]): Promise<void> {
   const deck_json = decks.map((deck: Deck) => deck.to_json());
   await writeFile("./decks.json", JSON.stringify(deck_json, null, 2));
}

export async function load_decks(): Promise<Deck[]> {
   const deck_json = await readFile("./decks.json", "utf8");
   const decks = JSON.parse(deck_json);
   return decks.map((deck: DeckJson) => new Deck(deck));
}
