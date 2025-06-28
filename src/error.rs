use core::fmt;
use std::{error::Error, fmt::Display};

#[derive(Debug)]
pub enum FlashError {
    OllamaGenError,
    FromJsonError,
    ToJsonError,
    FileWriteError,
}

impl Error for FlashError {}

impl Display for FlashError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            FlashError::OllamaGenError => {
                write!(f, "Error generating response from the ollama model.")
            }
            FlashError::FromJsonError => {
                write!(f, "Error converting from json.")
            }
            FlashError::ToJsonError => {
                write!(f, "Error converting to json.")
            }
            FlashError::FileWriteError => {
                write!(f, "Error converting to json.")
            }
        }
    }
}
