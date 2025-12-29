import {useState, useEffect, type JSX} from 'react'
import Cell from "./Cell.tsx"
import {isLetterKey} from "./Utils.tsx"
import {WordHead, CellPos, CellData, WordCollection, getCellPosesFromData, getAllCellData, getAllCellPoses, getTotalRowsCols, gridClickCallback, SelectedCellInfo, cellPosIsSameAsSelectedCell, getPriorityCellInfoForCellPos, getIncrementedOrDecrementedSelectedCell} from "./CrosswordUtils"

function CrosswordCells({heads}: {heads: Array<WordHead>}): JSX.Element {

    const [selectedCellInfo, setSelectedCellInfo] = useState<SelectedCellInfo>(new SelectedCellInfo(0, 0));

    const [cellDatas, setCellDatas] = useState<Array<CellData>>([]);

    useEffect(() => {
        setSelectedCellInfo(new SelectedCellInfo(0, 0));
        setCellDatas(getAllCellData(heads))
    
    }, [heads]);

    console.log('these heads', heads);
    let wordCollection: WordCollection = new WordCollection(heads);
    
    useEffect(() => {
        const keyCallback = (e: any) => {

            console.log(e.key);

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
                    const newCellDatas: Array<CellData> = curDatas.map((c, i) => {

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
        }

        document.addEventListener("keydown", keyCallback)

        return () => {
            document.removeEventListener("keydown", keyCallback);
        }
        
    }, [selectedCellInfo]);



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

    for (let i = 0; i < cellDatas.length; i++) {
        let cellPos = cellDatas[i].pos;
        let idStr: string = cellPos.getCellId();

        // let headNum: number = getCellHeadNumber(wordCollection.heads, cellPos);
        let headNum: number = wordCollection.getCellHeadNumber(cellPos);

        const gridClickFunc = () => {
            
            setSelectedCellInfo(getPriorityCellInfoForCellPos(cellPos, wordCollection.heads, selectedCellInfo));
            
        }

        let selected = cellPosIsSameAsSelectedCell(cellPos, wordCollection.heads, selectedCellInfo);
        let inSameWord = wordCollection.heads[selectedCellInfo.headIndex].getOffsetNum(cellPos) != null;

        let thisElement: JSX.Element = 
          <Cell letter={cellDatas[i].letter} idStr={idStr} headNum={headNum} selected={selected} inSameWord={inSameWord} func={gridClickFunc} key={idStr}/>;
        
        elements.push(thisElement);

        gridTemplateAreas[cellPos.row][cellPos.col] = idStr;
    }


    let gridTemplateAreaStrs: Array<string> = []
    for (const row of gridTemplateAreas) {
      gridTemplateAreaStrs.push(`"${row.join(' ')}"`);
    }


    const parentStyle = {
      gridTemplateAreas: gridTemplateAreaStrs.join(' '),
    };

    return (<div id='cross-parent' style={parentStyle}>
      {elements}
    </div>);

}

export default CrosswordCells;