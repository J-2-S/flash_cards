// Should include tools to load decks and management of cards

use crate::error::FlashError;
use crate::ollama_backend;
use rand::random_range;
use serde::{Deserialize, Serialize};
use serde_json;
use std::{collections::HashMap, fs, io, path::PathBuf};

fn input(prompt: &String) -> String {
    println!("Question: {}", prompt);
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    input.trim().to_owned()
}

#[derive(Clone, Deserialize, Serialize, Debug)]
struct CardInfo {
    answer: String,
    score: u8,
    history: Vec<u8>,
    last_reviewed: u32, // The last time the card was reviewed
}

impl CardInfo {
    fn last_reviewed(&mut self, count: u32) {
        self.last_reviewed = count;
    }
}

#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct Card {
    pub question: String,
    pub answer: String,
    pub score: u8,
    pub history: Vec<u8>,
    pub last_reviewed: u32, // The last time the card was reviewed
}

impl Card {
    pub fn new(front: &String, card_info: &CardInfo) -> Self {
        Self {
            question: front.clone(),
            answer: card_info.answer.clone(),
            score: card_info.score.clone(),
            history: card_info.history.clone(),
            last_reviewed: card_info.last_reviewed.clone(),
        }
    }
    pub fn to_card_info(self) -> (String, CardInfo) {
        let retval = (
            self.question.to_owned(),
            CardInfo {
                answer: self.answer.to_owned(),
                score: self.score,
                history: self.history.to_owned(),
                last_reviewed: self.last_reviewed,
            },
        );
        retval
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Deck {
    pub cards: HashMap<String, CardInfo>, // HashMap< CardFront, CardInfo >
    pub count: u32, // The number of times a card has been reviewed in this deck
}

impl Deck {
    /// Pulls a random card
    pub async fn pull_random(&mut self) -> Result<(bool, String), FlashError> {
        self.count += 1;
        let len = self.cards.len();
        let random_index = random_range(0..len);

        let question = self
            .cards
            .keys()
            .skip(random_index)
            .take(1)
            .collect::<Vec<&String>>()[random_index]
            .to_owned();

        let card_info: &mut CardInfo = self.cards.get_mut(&question).unwrap();
        card_info.last_reviewed(self.count);
        let mut card = Card::new(&question, &card_info);

        let user_input = input(&card.question);
        let response = ollama_backend::compare(&card.question, &card.answer, &user_input).await?;

        let mut in_ = response.score;
        for i in 0..9 {
            let out = card.history[i];
            card.history[i] = in_;
            in_ = out;
        }

        drop(in_);
        card.score = card.history.iter().sum::<u8>() / 10;

        let (question, card_info) = card.to_card_info();
        self.cards.insert(question, card_info);

        Ok((response.correct, response.feedback))
    }

    /// Function to pull the most optimised card at the given moment
    pub async fn pull_best_card(&mut self) -> Result<(bool, String), FlashError> {
        self.count += 1;

        let mut lowest: u32 = std::u32::MAX;
        let mut lowest_question: &String = &"".to_string();

        for key in self.cards.keys() {
            let card_info = self.cards.get(key).unwrap();
            let card_total_score: u32 =
                card_info.last_reviewed + card_info.score as u32 * (self.cards.len() as u32 / 5);
            if card_total_score < lowest {
                lowest = card_total_score;
                lowest_question = key;
            } else if card_total_score == lowest {
                if random_range(0..=1) == 1 {
                    lowest = card_total_score;
                    lowest_question = key;
                }
            }
        }

        let lowest_question: String = lowest_question.clone();
        let mut card_info = self.cards.get_mut(&lowest_question).unwrap().clone();
        card_info.last_reviewed(self.count);
        let mut card: Card = Card::new(&lowest_question, &card_info);

        let user_input = input(&card.question);
        let response = ollama_backend::compare(&card.question, &card.answer, &user_input).await?;

        if card.history.len() < 10 {
            card.history.push(response.score)
        } else if card.history.len() == 10 {
            let mut in_ = response.score;
            for i in 0..9 {
                let out = card.history[i];
                card.history[i] = in_;
                in_ = out;
            }
        } else {
            let _ = card.history.pop();
        }

        card.score = card.history.iter().sum::<u8>() / card.history.len() as u8; // len should be max 10

        let (question, card_info) = card.to_card_info();
        self.cards.insert(question, card_info);
        Ok((response.correct, response.feedback))
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Decks {
    pub decks: HashMap<String, Deck>, // HashMap< DeckName, Deck >
}

impl Decks {
    /// Autoloads all of the decks from the decks.json file
    pub fn new() -> Result<Self, FlashError> {
        let file_path = PathBuf::from("./decks.json");
        let file_content = fs::read_to_string(file_path.as_path()).unwrap();
        Ok(serde_json::from_str(&file_content).map_err(|_| FlashError::FromJsonError)?)
    }

    /// Writes everything to the decks.json file
    pub fn write(&self) -> Result<(), FlashError> {
        let file_path = PathBuf::from("./decks.json");
        fs::write(
            file_path,
            serde_json::to_string(self).map_err(|_| FlashError::ToJsonError)?,
        )
        .map_err(|_| FlashError::FileWriteError)?;
        Ok(())
    }
}
