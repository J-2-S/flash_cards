import { Ollama } from "ollama";
import { Card, Response } from "./cards";
import { GenerateResponse } from "ollama/src/interfaces.js";

export async function ollama_compare( card: Card, user_response: String ): Promise<Response> {
   const prompt = "You are an answer evaluator for a flashcard-based learning app. Your task is to fairly and objectively assess a learner's answer based on a given correct answer. You will receive a JSON object containing: question: the question asked correct_answer: the expected correct answer given_answer: the user's answer Your response must be a JSON object with the following format: { \"correct\": bool,                 // true if the given answer is fully correct, false otherwise \"feedback\": string,              // a short explanation or improvement tip (empty if fully correct) \"score\": number                  // a score from 0 to 10 rating the accuracy of the given answer } Guidelines: If the answer fully matches the correct idea and is phrased correctly, set \"correct\": true, \"Response\": \"\", and \"score\": 10. A score can be between 0 and 10 and it will control the next time the user should repeat the question. a score of 0 forces imediate repitition. The formula for when the card should occur next is score * deck.len() / 5 cards. Keep \"Response\" short (1–3 sentences). Be clear, helpful, and never vague or overly harsh. Respond with only the JSON object, nothing else. Note that the given_answer can be empty or mostly empty which should recieve a 0. You should initaily judge if the information is correct or not only using the correct_answer and none or your knowladge. If the answer is incorrect, then use your knowladge to explain why.";
   let final_prompt = '${prompt}, json: ${ JSON.stringify( card.to_json( user_response ) )}';
   const ollama_instance = new Ollama();
   const untyped_response: GenerateResponse = await ollama_instance.generate({ 
      model: "llama3.2:1b",
      prompt: final_prompt,
   });
   const response_json = JSON.parse( untyped_response.response );
   const response: Response = {
      correct: response_json.correct,
      score: response_json.score,
      feedback: response_json.feedback,
   };

   return response

}
