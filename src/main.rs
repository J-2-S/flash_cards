mod cards;
mod error;
mod feeder;
mod ollama_backend;
mod ui;

use cards::{Card, Deck, Decks};
use ollama_backend::{Response, compare};

#[tokio::main]
async fn main() {
    let mut decks = Decks::new().unwrap();
    let key = decks.decks.keys().take(1).collect::<Vec<&String>>()[0];
    let mut deck = decks.decks.get(key).unwrap().to_owned();

    let (correct, response) = deck.pull_best_card().await.unwrap();
    println!("Question correct? : {}, Reponse: {}", correct, response);

    decks.decks.insert(key.to_owned(), deck);

    decks.write().unwrap();
}
