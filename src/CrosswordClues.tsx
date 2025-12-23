import {type JSX} from 'react'
import type { WordHead } from './CrosswordUtils';

function CrosswordClues({heads}: {heads: Array<WordHead>}): JSX.Element {

    let downs: Array<JSX.Element> = [];
    let rights: Array<JSX.Element> = [];

    for (const head of heads) {
        let arrayToAppend = head.right ? rights : downs;

        let displayStr: string = `${head.id}. ${head.info.clue}`;
        arrayToAppend.push(<p key={displayStr}>{displayStr}</p>);
    }

    return (
    <div>
        <p>ACROSS</p>
        {rights}
        <p>DOWN</p>
        {downs}
    </div>
    )
}

export default CrosswordClues;