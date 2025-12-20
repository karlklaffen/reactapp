import {CellData} from "./CrosswordUtils"

import {type JSX} from "react"

function Cell({letter, idStr, headNum, selected, func}: {letter: string, idStr: string, headNum: number, selected: boolean, func: () => void}): JSX.Element {

    const cellStyle = {
        gridArea: idStr,
        backgroundColor: selected ? 'gold' : 'white'
    };

    if (headNum == 0)
        return (
        <div className='cell' id={idStr} style={cellStyle} onClick={func}>
            <div className='letter'>{letter}</div>
        </div>
        )

    return (
    <div className='cell' id={idStr} style={cellStyle} onClick={func}>
        <div className='num'>{headNum}</div>
        <div className='letter'>{letter}</div>
    </div>
    )
}

export default Cell;