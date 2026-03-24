import { useKeyListener } from '../Utils/Hooks'
import { isLetterKey } from '../Utils/Utils'
import Cell from './private/Cell'
import './private/Crossword.css'

import {WordHead, WordCollection, SelectedCellInfo, CellData, getAllCellData, cellPosIsSameAsSelectedCell, getPriorityCellInfoForCellPos, getTotalRowsCols, getCellPosesFromData, CellPos, getIncrementedOrDecrementedSelectedCell} from "./private/CrosswordUtils"
import {useState, useEffect, type JSX} from "react"

function Crossword({wordHeads}: {wordHeads: Array<WordHead>}) {

  // selected cell
  const [selectedCellInfo, setSelectedCellInfo] = useState<SelectedCellInfo>(new SelectedCellInfo(0, 0));
  
  // cell data
  const [cellDatas, setCellDatas] = useState<Array<CellData>>([]);

  // update cell data when word collection changes
  useEffect(() => {
      setSelectedCellInfo(new SelectedCellInfo(0, 0));
      setCellDatas(getAllCellData(wordCollection.heads))
  
  }, [wordHeads]);

  let wordCollection: WordCollection = new WordCollection(wordHeads);

    useKeyListener((e: KeyboardEvent) => {

        if (e.key === 'Enter') {
            setSelectedCellInfo(new SelectedCellInfo((selectedCellInfo.headIndex + 1) % wordCollection.heads.length, 0));
            return;
        }

        let newLetter: string | null = null;

        if (e.key === 'Backspace')
            newLetter = '';
        else if (isLetterKey(e.key))
            newLetter = e.key.toUpperCase();

        if (newLetter !== null) {
            setCellDatas((curDatas: Array<CellData>) => {
                const newCellDatas: Array<CellData> = curDatas.map((c) => {

                    // If this cell is selected
                    if (cellPosIsSameAsSelectedCell(c.pos, wordCollection.heads, selectedCellInfo)) {
                        return new CellData(c.pos, newLetter);
                    }
                    return c;
                });
                return newCellDatas;
            });

            setSelectedCellInfo(getIncrementedOrDecrementedSelectedCell(newLetter !== '', selectedCellInfo, wordCollection.heads));
        }

    }, [selectedCellInfo])



    let elements: Array<JSX.Element> = []

    let gridTemplateAreas: Array<Array<string>> = [];

    let totalRowsCols: CellPos = getTotalRowsCols(getCellPosesFromData(cellDatas));

    for (let i = 0; i < totalRowsCols.row; i++) {
      let newRow: Array<string> = []
      for (let j = 0; j < totalRowsCols.col; j++) {
        newRow.push('.');
      }
      gridTemplateAreas.push(newRow);
    }

    const screenWidth: number = window.innerWidth - 50;
    const screenHeight: number = window.innerHeight - 25;

    const cellWidthAccordingToWidth: number = screenWidth / totalRowsCols.col;
    const cellWidthAccordingToHeight: number = screenHeight / totalRowsCols.row;

    const cellWidth: number = Math.min(cellWidthAccordingToWidth, cellWidthAccordingToHeight);

    // TODO: Fix screen width/height getting
    // console.log('other screen width', screen.width);
    // console.log('other avail width', screen.availWidth);
    // console.log('other other', window.innerWidth);
    // console.log('screen width', screenWidth);
    // console.log('cell width', cellWidth);
    // console.log('multiplied', cellWidth * totalRowsCols.col);

    for (let i = 0; i < cellDatas.length; i++) {
        let cellPos = cellDatas[i].pos;
        let idStr: string = cellPos.getCellId();

        let headNum: number = wordCollection.getCellHeadNumber(cellPos);

        const gridClickFunc = () => {
            let newSelectedCellInfo = getPriorityCellInfoForCellPos(cellPos, wordCollection.heads, selectedCellInfo);
            setSelectedCellInfo(newSelectedCellInfo);
        }

        let selected = cellPosIsSameAsSelectedCell(cellPos, wordCollection.heads, selectedCellInfo);
        let inSameWord = wordCollection.heads[selectedCellInfo.headIndex].getOffsetNum(cellPos) != null;

        let thisElement: JSX.Element = 
          <Cell letter={cellDatas[i].letter} idStr={idStr} headNum={headNum} selected={selected} inSameWord={inSameWord} func={gridClickFunc} width = {cellWidth} key={idStr}/>;
        
        elements.push(thisElement);

        gridTemplateAreas[cellPos.row][cellPos.col] = idStr;
    }


    let gridTemplateAreaStrs: Array<string> = []
    for (const row of gridTemplateAreas) {
      gridTemplateAreaStrs.push(`"${row.join(' ')}"`);
    }

    const parentStyle = {
        // position: 'relative' as any,
        width: `calc(${cellWidth * totalRowsCols.col}px)`,
        height: `calc(${cellWidth * totalRowsCols.row}px)`,
        gridTemplateAreas: gridTemplateAreaStrs.join(' '),
    };

    let crosswordCells = <div id='cross-parent' style={parentStyle}>
      {elements}
    </div>

    let downs: Array<JSX.Element> = [];
    let rights: Array<JSX.Element> = [];

    for (let i = 0; i < wordCollection.heads.length; i++) {
        let arrayToAppend = wordCollection.heads[i].loc.right ? rights : downs;

        let displayStr: string = `${wordCollection.ids[i]}. ${wordCollection.heads[i].info.clue}`;
        arrayToAppend.push(<p key={displayStr} className={selectedCellInfo.headIndex == i ? "highlighted-clue" : ""}>{displayStr}</p>);
    }

    let crosswordClues = <div id="clues">
        <div>
            <p className="bold">ACROSS</p>
            {rights}
        </div>
        <div>
            <p className="bold">DOWN</p>
            {downs}
        </div>
    </div>

    return <div>
      {crosswordCells}
      {crosswordClues}
    </div>
}

export default Crossword;
