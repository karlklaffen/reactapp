import './Crossword.css'

import CrosswordCells from "./CrosswordCells"
import CrosswordClues from "./CrosswordClues"

import {WordHead, WordCollection} from "./CrosswordUtils"
import {useState, useEffect, type JSX} from "react"

function Crossword({wordHeads}: {wordHeads: Array<WordHead>}) {

  let wordCollection: WordCollection = new WordCollection(wordHeads);

    return (
    <div>
      <CrosswordCells wordCollection={wordCollection} />
      <CrosswordClues wordCollection={wordCollection} />
    </div>
    );
}

export default Crossword;