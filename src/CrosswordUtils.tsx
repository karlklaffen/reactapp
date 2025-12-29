import { useState } from "react";

export class CellPos {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    isSameAs(otherPos: CellPos): boolean {
        return otherPos.row === this.row && otherPos.col === this.col;
    }

    toString(): string {
        return `${this.row}-${this.col}`
    }

    getOffset(otherCellPos: CellPos): CellPos {
        return new CellPos(this.row - otherCellPos.row, this.col - otherCellPos.col);
    }

    getCellId(): string {
        return `c${this.toString()}`;
    }

    up(num: number = 1): CellPos {
        return new CellPos(this.row - num, this.col);
    }

    down(num: number = 1): CellPos {
        return new CellPos(this.row + num, this.col);
    }

    left(num: number = 1): CellPos {
        return new CellPos(this.row, this.col - num);
    }

    right(num: number = 1): CellPos {
        return new CellPos(this.row, this.col + num);
    }

    getPlusShape(): Set<CellPos> {
        return new Set([this, this.up(), this.down(), this.left(), this.right()]);
    }

    getAddedOffset(added: CellPos) {
        return new CellPos(this.row + added.row, this.col + added.col);
    }

    inRange(numRows: number, numCols: number) {
        return this.row < numRows && this.col < numCols;
    }
}

export class CellData {
    pos: CellPos;
    letter: string;

    constructor(pos: CellPos, letter: string) {
        this.pos = pos;
        this.letter = letter;
    }
}

export class WordLoc {
    startPos: CellPos;
    right: boolean;

    constructor(startPos: CellPos, right: boolean) {
        this.startPos = startPos;
        this.right = right;
    }

    getOffsetPos(offset: number): CellPos {
        if (this.right)
            return new CellPos(this.startPos.row, this.startPos.col + offset);
        return new CellPos(this.startPos.row + offset, this.startPos.col);
    }
}

export class WordInfo {
    word: string;
    clue: string;

    constructor(word: string, clue: string) {
        this.word = word;
        this.clue = clue;
    }
}

export class WordHead {

    loc: WordLoc;
    info: WordInfo;

    constructor(loc: WordLoc, info: WordInfo) {
        this.loc = loc;
        this.info = info;
    }

    getOffsetNum(cellPos: CellPos): number | null {
        let offset: number = -1;
        if (this.loc.right && cellPos.row === this.loc.startPos.row && cellPos.col >= this.loc.startPos.col) {
            offset = cellPos.col - this.loc.startPos.col;
        }
        if (!this.loc.right && cellPos.col === this.loc.startPos.col && cellPos.row >= this.loc.startPos.row) {
            offset = cellPos.row - this.loc.startPos.row;
        }

        if (offset >= 0 && offset < this.info.word.length)
            return offset;
        return null;
    }
}

export class WordCollection {
    heads: Array<WordHead>
    ids: Array<number>

    constructor(heads: Array<WordHead>) {
        this.heads = heads;
        this.ids = [];

        let thisId: number = 1;

        for (let i = 0; i < this.heads.length; i++) {
            let unique: boolean = true;
            for (let j = 0; j < i; j++) {
                if (this.heads[i].loc.startPos.isSameAs(this.heads[j].loc.startPos)) {
                    unique = false;
                    break;
                }
            }
            this.ids.push(thisId);
            if (unique) {
                thisId++;
            }
        }
    }

    getCellHeadNumber(cellPos: CellPos): number {
        for (let i = 0; i < this.heads.length; i++) {
            if (this.heads[i].loc.startPos.isSameAs(cellPos))
                return this.ids[i];
        }
        return 0;
    }
}

export class SelectedCellInfo {

    headIndex: number;
    offset: number;

    constructor(headIndex: number, offset: number) {
        this.headIndex = headIndex;
        this.offset = offset;
    }

    isSameAs(otherInfo: SelectedCellInfo): boolean {
        return this.headIndex === otherInfo.headIndex && this.offset === otherInfo.offset;
    }
}

export function gridClickCallback(pos: CellPos) {
    
    console.log('click', pos.toString());

    let id: string = `c${pos.toString()}`;

    let element: HTMLElement | null = document.getElementById(id);

    if (element != null)
        element.style.backgroundColor = 'gold';
}

export function getAllCellPoses(heads: Array<WordHead>): Array<CellPos> {
    let poses: Array<CellPos> = [];

    for (let i = 0; i < heads.length; i++) {
        
        for (let j = 0; j < heads[i].info.word.length; j++) {

            let thisCellPos: CellPos = heads[i].loc.getOffsetPos(j);

            let unique: boolean = true;

            for (const otherCellPos of poses) {

                if (thisCellPos.isSameAs(otherCellPos)) {
                unique = false;
                break;
                }
            }

            if (unique) {
                poses.push(thisCellPos);
            }
        }
    }

    return poses;
}

export function getAllCellData(heads: Array<WordHead>): Array<CellData> {
    let cellPoses: Array<CellPos> = getAllCellPoses(heads);
    
    let cellDatas: Array<CellData> = [];

    for (let i = 0; i < cellPoses.length; i++)
        cellDatas.push(new CellData(cellPoses[i], ''))

    return cellDatas;
}

// export function parseCrosswordInput(inputLines: Array<string>): Array<WordHead> {
//   let heads: Array<WordHead> = [];

//   let nextId: number = 1;

//   for (const line of inputLines) {
//     let parts: Array<string> = line.split(' ');

//     let row: number = parseInt(parts[0]);
//     let col: number = parseInt(parts[1]);
//     let right: boolean = parts[2] == 'R'
//     let word: string = parts[3];

//     let thisCellPos: CellPos = new CellPos(row, col);

//     let idToUse = nextId;

//     let unique: boolean = true;

//     for (const head of heads) {
//       if (head.startPos.isSameAs(thisCellPos)) {
//         idToUse = head.id;
//         unique = false;
//         break;
//       }
//     }

//     heads.push(new WordHead(new CellPos(row, col), right, word, idToUse));

//     if (unique)
//       nextId++;
//   }

//   return heads;
// }

export function getCellPosesFromData(data: Array<CellData>): Array<CellPos> {
    let poses: Array<CellPos> = [];

    for (const datum of data)
        poses.push(datum.pos);

    return poses;
}

export function getTotalRowsCols(poses: Array<CellPos>): CellPos {
    let maxRow: number = -1;
    let maxCol: number = -1;

    for (const cellPos of poses) {
      if (cellPos.row > maxRow)
        maxRow = cellPos.row;
      if (cellPos.col > maxCol)
        maxCol = cellPos.col;
    }

    let numRows = maxRow + 1;
    let numCols = maxCol + 1;

    return new CellPos(numRows, numCols);
}

export function getOtherPossibleSelectedCellInfosForCellPos(heads: Array<WordHead>, cellPos: CellPos, curSelectedCellInfo: SelectedCellInfo): Array<SelectedCellInfo> {
    let infos: Array<SelectedCellInfo> = [];
    for (let i = 0; i < heads.length; i++) {
        let offsetNum: number | null = heads[i].getOffsetNum(cellPos);

        if (offsetNum != null) {
            let thisInfo: SelectedCellInfo = new SelectedCellInfo(i, offsetNum);
            if (!thisInfo.isSameAs(curSelectedCellInfo))
                infos.push(thisInfo);
        }
    }

    return infos;
}

export function cellPosIsSameAsSelectedCell(cellPos: CellPos, heads: Array<WordHead>, selectedCellInfo: SelectedCellInfo): boolean{
    return cellPos.isSameAs(heads[selectedCellInfo.headIndex].loc.getOffsetPos(selectedCellInfo.offset))
}

export function getPriorityCellInfoForCellPos(cellPos: CellPos, heads: Array<WordHead>, curSelected: SelectedCellInfo): SelectedCellInfo {

    let otherInfos: Array<SelectedCellInfo> = getOtherPossibleSelectedCellInfosForCellPos(heads, cellPos, curSelected);

    // If there are no other possibilities, just use current selection
    if (otherInfos.length === 0)
        return curSelected;

    // Prioritize this word if is same word as previous
    for (const otherInfo of otherInfos) {
        if (otherInfo.headIndex === curSelected.headIndex)
            return otherInfo;
    }

    // Then, prioritize this word if word head is clicked
    for (const otherInfo of otherInfos) {
        if (otherInfo.offset === 0)
            return otherInfo;
    }
    
    // Otherwise, just return anything 
    return otherInfos[0];
}

export function getIncrementedOrDecrementedSelectedCell(increment: boolean, selectedCellInfo: SelectedCellInfo, heads: Array<WordHead>) {
    
    if (increment) {
        if (selectedCellInfo.offset === heads[selectedCellInfo.headIndex].info.word.length - 1) {
            let nextHeadIndex = (selectedCellInfo.headIndex + 1) % heads.length;
            return new SelectedCellInfo(nextHeadIndex, 0);
        }
        else {
            return new SelectedCellInfo(selectedCellInfo.headIndex, selectedCellInfo.offset + 1);
        }
    }
    else {
        if (selectedCellInfo.offset === 0) {
            let nextHeadIndex = selectedCellInfo.headIndex === 0 ? heads.length - 1 : selectedCellInfo.headIndex - 1;
            return new SelectedCellInfo(nextHeadIndex, heads[nextHeadIndex].info.word.length - 1);
        }
        else {
            return new SelectedCellInfo(selectedCellInfo.headIndex, selectedCellInfo.offset - 1);
        }
    }
}