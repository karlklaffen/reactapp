import './Crossword.css'

import CrosswordCells from "./CrosswordCells"
import CrosswordClues from "./CrosswordClues"

import { setLinesFromFile } from './Utils'
import {WordHead} from "./CrosswordUtils"
import {useState, useEffect, type JSX} from "react"

function Crossword({wordHeads}: {wordHeads: Array<WordHead>}) {

    return (
    <div>
      <CrosswordCells heads={wordHeads} />
      <CrosswordClues heads={wordHeads} />
    </div>
    );
}

export default Crossword;