import {useState, useEffect, type JSX} from 'react'
import Cell from "./Cell.tsx"
import {isLetterKey} from "./Utils.tsx"
import {WordHead, CellPos, CellData, getCellPosesFromData, getAllCellData, getAllCellPoses, getTotalRowsCols, getCellHeadNumber, gridClickCallback} from "./CrosswordUtils"

function CrosswordCells({heads} : {heads: Array<WordHead>}): JSX.Element {
    const [selectedCellDataIndex, setSelectedCellDataIndex] = useState<number | null>(0);

    let cellPoses: Array<CellPos> = getAllCellPoses(heads);
    
    let defaultVals = Array<string>(cellPoses.length).fill('');
    const [cellLetters, setCellLetters] = useState<Array<string>>(defaultVals);
    
    useEffect(() => {
        const keyCallback = (e: any) => {

            if (!isLetterKey(e.key))
                return;

            const letter: string = e.key.toUpperCase();

            if (selectedCellDataIndex != null) {

                const newCellLetters: Array<string> = cellLetters.map((c, i) => {
                    if (i == selectedCellDataIndex) {
                        console.log(letter);
                        return letter;
                    }
                    return c;
                });

                setCellLetters(newCellLetters);
                
            }
        }

        document.addEventListener("keypress", keyCallback)

        return () => {
            document.removeEventListener("keypress", keyCallback);
        }
    }, [selectedCellDataIndex]);

    let elements: Array<JSX.Element> = []

    let gridTemplateAreas: Array<Array<string>> = [];

    let totalRowsCols: CellPos = getTotalRowsCols(cellPoses);

    for (let i = 0; i < totalRowsCols.row; i++) {
      let newRow: Array<string> = []
      for (let j = 0; j < totalRowsCols.col; j++) {
        newRow.push('.');
      }
      gridTemplateAreas.push(newRow);
    }

    for (let i = 0; i < cellPoses.length; i++) {
        let cellPos = cellPoses[i];
        let idStr: string = cellPos.getCellId();

        let headNum: number = getCellHeadNumber(heads, cellPos);

        // console.log(headNum);

        const gridClickFunc = () => {

            setSelectedCellDataIndex(i);
            // console.log(i);
            // console.log(selectedCellDataIndex);
            // gridClickCallback(cellPos);
        }

        let selected = (selectedCellDataIndex == i);

        let thisElement: JSX.Element = 
          <Cell letter={cellLetters[i]} idStr={idStr} headNum={headNum} selected={selected} func={gridClickFunc} key={idStr}/>;
        
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