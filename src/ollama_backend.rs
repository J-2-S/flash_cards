// This file should use ollama to check the imput the user gives and compare it to the correct
// answer as a means of validation

use crate::error::FlashError;
use ollama_rs::{Ollama, generation::completion::request::GenerationRequest};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Response {
    pub correct: bool,
    pub feedback: String,
    pub score: u8,
}

/** Compares the input from the user and the correct answer
 * @param correct: the correct answer
 * @param given: the user's answer
 * @returns ( correct : bool, Explanation : String ( if incorrect ), score : number ( 0-10 ))
 **/
pub async fn compare(question: &str, correct: &str, given: &str) -> Result<Response, FlashError> {
    let model = "llama3:latest".to_string();
    // If the answer is mostly correct but missing some detail or partially phrased incorrectly, mark "correct": false, provide constructive feedback in "Response", and give a score from 6–9. If the answer shows partial understanding but contains major errors or lacks key information, "score" should be 3–5. If the answer is mostly wrong, irrelevant, or completely incorrect, give a "score" from 0–2
    let base_prompt = r#"You are an answer evaluator for a flashcard-based learning app. Your task is to fairly and objectively assess a learner's answer based on a given correct answer. You will receive a JSON object containing: question: the question asked correct_answer: the expected correct answer given_answer: the user's answer Your response must be a JSON object with the following format: { "correct": bool,                 // true if the given answer is fully correct, false otherwise "feedback": string,              // a short explanation or improvement tip (empty if fully correct) "score": number                  // a score from 0 to 10 rating the accuracy of the given answer } Guidelines: If the answer fully matches the correct idea and is phrased correctly, set "correct": true, "Response": "", and "score": 10. A score can be between 0 and 10 and it will control the next time the user should repeat the question. a score of 0 forces imediate repitition. The formula for when the card should occur next is score * deck.len() / 5 cards. Keep "Response" short (1–3 sentences). Be clear, helpful, and never vague or overly harsh. Respond with only the JSON object, nothing else. Note that the given_answer can be empty or mostly empty which should recieve a 0. You should initaily judge if the information is correct or not only using the correct_answer and none or your knowladge. If the answer is incorrect, then use your knowladge to explain why."#.to_string();
    let given = format!("`{}`", given);
    let prompt = format!(
        "{}, json: [ \"question\" : {}, \"correct_answer\" : {}, \"given_answer\" : {}]",
        base_prompt, question, correct, given
    );

    println!("prompt {}", prompt);
    let instance = Ollama::new("http://localhost".to_string(), 11434);
    let response = instance
        .generate(GenerationRequest::new(model, prompt))
        .await;

    let response = response.map_err(|err| {
        eprintln!("Error: {}", err);
        FlashError::OllamaGenError
    })?;

    while !response.done {}
    let response = response.response;
    // println!("response: {}", &response);

    let response_json: Response = serde_json::from_str(&response).unwrap();

    Ok(response_json)
}
