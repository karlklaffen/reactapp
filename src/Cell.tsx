import {CellData} from "./CrosswordUtils"

import {type JSX} from "react"

function Cell({letter, idStr, headNum, selected, inSameWord, func, width}: {letter: string, idStr: string, headNum: number, selected: boolean, inSameWord: boolean, func: () => void, width: number}): JSX.Element {

    const cellStyle = {
        gridArea: idStr,
        backgroundColor: selected ? 'gold' : (inSameWord ? 'lightblue' : 'white')
    };

    const letterStyle = {
        fontSize: `${width}px`
    }

    const padding: number = width / 30;

    const numStyle = {
        fontSize: `${width / 3}px`,
        top: `${padding}px`,
        left: `${padding}px`
    }

    let numHTML: JSX.Element = headNum === 0 ? 
        <></> : <div className='bold' style={numStyle}>{headNum}</div>;

    return (
    <div className='cell' id={idStr} style={cellStyle} onClick={func}>
        {numHTML}
        <div style={letterStyle}>{letter}</div>
    </div>
    )
}

export default Cell;