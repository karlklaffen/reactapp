import './Crossword.css'

import CrosswordCells from "./CrosswordCells"
import CrosswordClues from "./CrosswordClues"

import { setLinesFromFile } from './Utils'
import {WordHead, CellPos, parseCrosswordInput} from "./CrosswordUtils"
import {useState, useEffect, type JSX} from "react"

function Crossword({inputFileName}: {inputFileName: string}) {

    const [textLines, setTextLines] = useState(Array<string>());

    useEffect(() => {
        setLinesFromFile(inputFileName, setTextLines);
    }, []);

    let wordHeads: Array<WordHead> = parseCrosswordInput(textLines);

    console.log('rerender main');

    return (textLines.length == 0 ?
    <p>Loading!</p> :
    <div>
      <CrosswordCells heads={wordHeads} />
      <CrosswordClues heads={wordHeads} />
    </div>
    );
}

export default Crossword;