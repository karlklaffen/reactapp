import {type JSX} from 'react'
import type { WordHead } from './CrosswordUtils';

function CrosswordClues({heads}: {heads: Array<WordHead>}): Array<JSX.Element> {

    let clues: Array<JSX.Element> = [];
    for (const head of heads) {
        let displayStr: string = `${head.id} ${head.right ? "RIGHT" : "DOWN"}: ${head.info.clue} (${head.info.word})`
        let element: JSX.Element = <p key={displayStr}>{displayStr}</p>;
        clues.push(element);
    }
    return clues;
}

export default CrosswordClues;