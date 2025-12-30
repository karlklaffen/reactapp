import {type JSX} from 'react'
import type { WordHead, WordCollection } from './CrosswordUtils';
import "./Crossword.css"

function CrosswordClues({wordCollection}: {wordCollection: WordCollection}): JSX.Element {

    let downs: Array<JSX.Element> = [];
    let rights: Array<JSX.Element> = [];

    for (let i = 0; i < wordCollection.heads.length; i++) {
        let arrayToAppend = wordCollection.heads[i].loc.right ? rights : downs;

        let displayStr: string = `${wordCollection.ids[i]}. ${wordCollection.heads[i].info.clue}`;
        arrayToAppend.push(<p key={displayStr}>{displayStr}</p>);
    }

    return (
    <div id="clues">
        <div>
            <p className="header">ACROSS</p>
            {rights}
        </div>
        <div>
            <p className="header">DOWN</p>
            {downs}
        </div>
    </div>
    )
}

export default CrosswordClues;