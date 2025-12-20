import { useState } from "react";

export class CellPos {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    isSameAs(otherPos: CellPos): boolean {
        return otherPos.row == this.row && otherPos.col == this.col;
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
}

export class CellData {
    pos: CellPos;
    letter: string;

    constructor(pos: CellPos, letter: string) {
        this.pos = pos;
        this.letter = letter;
    }
}

export class WordHead {

    startPos: CellPos;
    right: boolean;
    word: string;
    id: number;

    constructor(startPos: CellPos, right: boolean, word: string, id: number) {
        this.startPos = startPos;
        this.right = right;
        this.word = word;
        this.id = id;
    }

    getOffsetPos(offset: number): CellPos {
        if (this.right)
        return new CellPos(this.startPos.row, this.startPos.col + offset);
        return new CellPos(this.startPos.row + offset, this.startPos.col);
    }
}

export function gridClickCallback(pos: CellPos) {

    // const [selectedPos, setSelectedPos] = useState(null);



    console.log('click', pos.toString());

    let id: string = `c${pos.toString()}`;

    let element: HTMLElement | null = document.getElementById(id);

    if (element != null)
        element.style.backgroundColor = 'gold';
}

export function getAllCellPoses(heads: Array<WordHead>): Array<CellPos> {
    let poses: Array<CellPos> = [];

    for (let i = 0; i < heads.length; i++) {
        
        for (let j = 0; j < heads[i].word.length; j++) {

        let thisCellPos: CellPos = heads[i].getOffsetPos(j);

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

    // console.log('returned', poses);
    return poses;
}

export function getAllCellData(heads: Array<WordHead>): Array<CellData> {
    let cellPoses: Array<CellPos> = getAllCellPoses(heads);
    
    let cellDatas: Array<CellData> = [];

    for (let i = 0; i < cellPoses.length; i++)
        cellDatas.push(new CellData(cellPoses[i], ''))

    return cellDatas;
}

export function getCellHeadNumber(heads: Array<WordHead>, cellPos: CellPos): number {
    for (const head of heads) {
      if (head.startPos.isSameAs(cellPos))
        return head.id;
    }
    return 0;
}

export function parseCrosswordInput(inputLines: Array<string>): Array<WordHead> {
  let heads: Array<WordHead> = [];

  let nextId: number = 1;

  for (const line of inputLines) {
    let parts: Array<string> = line.split(' ');

    let row: number = parseInt(parts[0]);
    let col: number = parseInt(parts[1]);
    let right: boolean = parts[2] == 'R'
    let word: string = parts[3];

    let thisCellPos: CellPos = new CellPos(row, col);

    let idToUse = nextId;

    let unique: boolean = true;

    for (const head of heads) {
      if (head.startPos.isSameAs(thisCellPos)) {
        idToUse = head.id;
        unique = false;
        break;
      }
    }

    heads.push(new WordHead(new CellPos(row, col), right, word, idToUse));

    if (unique)
      nextId++;
  }

  return heads;
}

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