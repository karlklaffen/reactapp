import {CellPos, WordInfo, WordLoc, WordHead} from "../../Crossword/private/CrosswordUtils"
import {getAllUppercaseLetters, getRandomInt, getRandomUniqueElement, getMatrix, flipCoin, getArrayWithRemovedIndices, addSetsToSet, getAddedSets, getIndicesOfCharInString, range} from "../../Utils/Utils"

class ConnectionPartInfo {
    wordIndex: number;
    letterIndex: number;

    constructor(wordIndex: number, letterIndex: number) {
        this.wordIndex = wordIndex;
        this.letterIndex = letterIndex;
    }
}

class WordConnectionInfo {

    downInfo: ConnectionPartInfo;
    rightInfo: ConnectionPartInfo;

    constructor(downInfo: ConnectionPartInfo, rightInfo: ConnectionPartInfo) {
        this.downInfo = downInfo;
        this.rightInfo = rightInfo;
    }

    getSwapped(): WordConnectionInfo {
        return new WordConnectionInfo(this.rightInfo, this.downInfo);
    }

    getWordIndices(): Set<number> {
        return new Set([this.downInfo.wordIndex, this.rightInfo.letterIndex]);
    }
}

class WordPlacement {
    startPos: CellPos;
    right: boolean;
    wordIndex: number;

    constructor(startPos: CellPos, right: boolean, wordIndex: number) {
        this.startPos = startPos;
        this.right = right;
        this.wordIndex = wordIndex;
    }
}

class CellsToCheck {
    forWord: Array<CellPos>;
    shouldBeEmpty: Set<CellPos>;

    constructor(forWord: Array<CellPos>, shouldBeEmpty: Set<CellPos>) {
        this.forWord = forWord;
        this.shouldBeEmpty = shouldBeEmpty;
    }
}

class RandomBoard {
    words: Array<string>;
    availableWordIndices: Set<number>;
    letterCells: Array<string>;
    numCols: number;

    wordPlacements: Array<WordPlacement>

    // position of cell that is considered (0, 0) in relation to other cell poses
    origin: CellPos;

    constructor(words: Array<string>) {
        this.words = words;
        this.availableWordIndices = new Set<number>(range(words.length));

        this.letterCells = Array<string>(0);
        this.numCols = 0;
        this.origin = new CellPos(0, 0);

        this.wordPlacements = [];

        let initialConnection: WordConnectionInfo = this.#getInitialRandomConnection();
        this.#constructFromInitialConnection(initialConnection);

        while (this.availableWordIndices.size > 0) {
            this.#addAddedRandomConnection();
        }
    }

    getLocs(): Array<WordLoc> {
        let actualLocs: Array<WordLoc> = Array<WordLoc>(this.wordPlacements.length);

        for (const placement of this.wordPlacements) {
            actualLocs[placement.wordIndex] = new WordLoc(this.#getActualPos(placement.startPos), placement.right);
        }

        return actualLocs;
    }

    getBoardLines(): Array<string> {
        let strs: Array<string> = [];
        for (let i = 0; i < this.#getNumRows(); i++) {
            let thisStr: string = '';
            for (let j = 0; j < this.numCols; j++) {
                thisStr += this.letterCells[i * this.numCols + j];
            }
            strs.push(thisStr);
        }
        return strs;
    }

    #getNumRows(): number {
        return this.letterCells.length / this.numCols;
    }

    #getLetterIndex(pos: CellPos): number {
        let actualPos: CellPos = this.#getActualPos(pos);
        return actualPos.row * this.numCols + actualPos.col;
    }

    #getLetter(pos: CellPos): string {
        return this.letterCells[this.#getLetterIndex(pos)];
    }

    #setLetter(pos: CellPos, letter: string): void {
        this.letterCells[this.#getLetterIndex(pos)] = letter;
    }

    #getPosFromIndex(index: number): CellPos {
        return this.#getConventionPos(new CellPos(Math.floor(index / this.numCols), index % this.numCols));
    }

    #setWord(placement: WordPlacement): void {
        const word: string = this.words[placement.wordIndex];
        let cellPoses: Array<CellPos> = this.#getWordCellPoses(placement);

        for (let i = 0; i < word.length; i++) {
            this.#setLetter(cellPoses[i], word[i]);
        }

        this.wordPlacements.push(placement);
        this.availableWordIndices.delete(placement.wordIndex);
    }

    #getCellsToCheck(placement: WordPlacement, connectionPos: CellPos): CellsToCheck {
        const word: string = this.words[placement.wordIndex];

        let shouldBeEmptyPoses: Set<CellPos> = new Set([]);
        let mainPoses: Array<CellPos> = [];

        if (placement.right) {
            shouldBeEmptyPoses.add(placement.startPos.left());
            shouldBeEmptyPoses.add(placement.startPos.right(word.length));

            for (let i = 0; i < word.length; i++) {
                let thisPos: CellPos = placement.startPos.right(i);
                if (!thisPos.isSameAs(connectionPos)) {
                    mainPoses.push(thisPos);
                    shouldBeEmptyPoses.add(thisPos.up());
                    shouldBeEmptyPoses.add(thisPos.down());
                }
            }
        }
        else {
            shouldBeEmptyPoses.add(placement.startPos.up());
            shouldBeEmptyPoses.add(placement.startPos.down(word.length));

            for (let i = 0; i < word.length; i++) {
                let thisPos: CellPos = placement.startPos.down(i);
                if (!thisPos.isSameAs(connectionPos)) {
                    mainPoses.push(thisPos);
                    shouldBeEmptyPoses.add(thisPos.left());
                    shouldBeEmptyPoses.add(thisPos.right());
                }
            }
        }

        let validWordPoses: Array<CellPos> = [];
        let validShouldBeEmptyPoses: Set<CellPos> = new Set([]);

        let numRows: number = this.#getNumRows();
        for (const pos of mainPoses)
            if (this.#getActualPos(pos).inRange(numRows, this.numCols))
                validWordPoses.push(pos);

        for (const pos of shouldBeEmptyPoses)
            if (this.#getActualPos(pos).inRange(numRows, this.numCols))
                validShouldBeEmptyPoses.add(pos);

        return new CellsToCheck(validWordPoses, validShouldBeEmptyPoses);
    }

    #allCellsValidForPlacement(placement: WordPlacement, cellsToCheck: CellsToCheck): boolean {
        for (const pos of cellsToCheck.shouldBeEmpty) {
            if (this.#getLetter(pos) !== ' ')
                return false;
        }

        for (let i = 0; i < cellsToCheck.forWord.length; i++) {
            if (this.#getLetter(cellsToCheck.forWord[i]) !== this.words[placement.wordIndex] && this.#getLetter(cellsToCheck.forWord[i]) !== ' ')
                return false;
        }

        return true;
    }

    #placementIsValid(placement: WordPlacement, connectionPos: CellPos): boolean {
        return this.#allCellsValidForPlacement(placement, this.#getCellsToCheck(placement, connectionPos));
    }

    #getWordCellPoses(placement: WordPlacement): Array<CellPos> {
        const word: string = this.words[placement.wordIndex];

        let cellPoses: Array<CellPos> = [];

        for (let i = 0; i < word.length; i++) {
            if (placement.right)
                cellPoses.push(new CellPos(placement.startPos.row, placement.startPos.col + i));
            else
                cellPoses.push(new CellPos(placement.startPos.row + i, placement.startPos.col));
        }

        return cellPoses;
    }

    #constructFromInitialConnection(initialConnection: WordConnectionInfo) {
        const downWord: string = this.words[initialConnection.downInfo.wordIndex];
        const rightWord: string = this.words[initialConnection.rightInfo.wordIndex];

        this.letterCells = Array<string>(downWord.length * rightWord.length).fill(' ');
        this.numCols = rightWord.length;

        const downWordColIndex = initialConnection.rightInfo.letterIndex;
        const rightWordRowIndex = initialConnection.downInfo.letterIndex;

        this.#setWord(new WordPlacement(new CellPos(0, downWordColIndex), false, initialConnection.downInfo.wordIndex));
        this.#setWord(new WordPlacement(new CellPos(rightWordRowIndex, 0), true, initialConnection.rightInfo.wordIndex));
    }

    #addAddedRandomConnection() {
        this.#addWordPlacement(this.#getAdditionalRandomConnection());
    }

    #getPossibleAddedRandomConnections() {
        let possiblePlacements: Set<WordPlacement> = new Set([]);

        for (let i = 0; i < this.letterCells.length; i++) {
            let thisPos: CellPos = this.#getPosFromIndex(i);
            const letter: string = this.letterCells[i];
            if (letter == ' ')
                continue;

            for (const wordIndex of this.availableWordIndices) {
                const word = this.words[wordIndex];
                let letIndices: Array<number> = getIndicesOfCharInString(word, letter);

                for (const letIndex of letIndices) {
                    let possibleRightPlacement: WordPlacement = new WordPlacement(thisPos.left(letIndex), true, wordIndex);
                    let possibleDownPlacement: WordPlacement = new WordPlacement(thisPos.up(letIndex), false, wordIndex);

                    if (this.#placementIsValid(possibleRightPlacement, thisPos)) {
                        possiblePlacements.add(possibleRightPlacement);
                    }

                    if (this.#placementIsValid(possibleDownPlacement, thisPos)) {
                        possiblePlacements.add(possibleDownPlacement);
                    }
                }
            }
        }

        return possiblePlacements;
    }

    #getAdditionalRandomConnection() {
        let placements: Set<WordPlacement> = this.#getPossibleAddedRandomConnections();

        return getRandomUniqueElement(Array.from(placements));
    }

    #addWordPlacement(placement: WordPlacement): void {

        const word: string = this.words[placement.wordIndex];
        let actualStartPos: CellPos = this.#getActualPos(placement.startPos);
        if (placement.right) {
            if (actualStartPos.col < 0) {
                actualStartPos = this.#getActualPos(placement.startPos);
                this.#expandLeft(-actualStartPos.col);
            }

            if (actualStartPos.col + word.length > this.numCols)
                this.#expandRight(actualStartPos.col + word.length - this.numCols)
        }
        else {
            let numRows: number = this.#getNumRows();

            if (actualStartPos.row < 0) {
                this.#expandUp(-actualStartPos.row)
                actualStartPos = this.#getActualPos(placement.startPos);
                numRows = this.#getNumRows();
            }

            if (actualStartPos.row + word.length > numRows)
                this.#expandDown(actualStartPos.row + word.length - numRows);
        }

        this.#setWord(placement);
    }

    #getInitialRandomConnection() { // get two random words that share a letter
        let possibles: Array<WordConnectionInfo> = this.#getPossibleInitialConnectionPairs();

        let elem: WordConnectionInfo = getRandomUniqueElement<WordConnectionInfo>(possibles);

        if (flipCoin() == "heads") // whimsy
            return elem.getSwapped();

        return elem;
    }

    #getActualPos(pos: CellPos) {
        return this.origin.getAddedOffset(pos);
    }

    #getConventionPos(pos: CellPos) {
        return pos.minus(this.origin);
    }

    #getPossibleInitialConnectionPairs() {
        let possibles: Array<WordConnectionInfo> = [];
        for (const idx1 of this.availableWordIndices) {
            for (const idx2 of this.availableWordIndices) {
                if (idx1 === idx2)
                    continue;

                const word1 = this.words[idx1];
                const word2 = this.words[idx2];
                for (let i = 0; i < word1.length; i++) {
                    for (let j = 0; j < word2.length; j++) {
                        const let1 = word1[i];
                        const let2 = word2[j];
                        if (let1 === let2) {
                            let info1: ConnectionPartInfo = new ConnectionPartInfo(idx1, i);
                            let info2: ConnectionPartInfo = new ConnectionPartInfo(idx2, j);
                            possibles.push(new WordConnectionInfo(info1, info2));
                        }
                    }
                }
            }
        }

        return possibles;
    }

    #expandLeft(num: number) {
        this.origin = this.origin.right(num);

        let newLetterCells: Array<string> = [];
        
        for (let i = 0; i < this.letterCells.length; i++) {
            if (i % this.numCols == 0) {
                newLetterCells.push(...Array<string>(num).fill(' '));
            }
            newLetterCells.push(this.letterCells[i]);
        }

        this.numCols += num;

        this.letterCells = newLetterCells;
    }

    #expandRight(num: number) {

        let newLetterCells: Array<string> = [];
        
        for (let i = 0; i < this.letterCells.length; i++) {
            newLetterCells.push(this.letterCells[i]);
            if (i % this.numCols == (this.numCols - 1)) {
                newLetterCells.push(...Array<string>(num).fill(' '));
            }
        }

        this.numCols += num;

        this.letterCells = newLetterCells;
    }

    #expandUp(num: number) {
        this.origin = this.origin.down(num);

        this.letterCells = Array<string>(num * this.numCols).fill(' ').concat(this.letterCells);
    }

    #expandDown(num: number) {
        this.letterCells = this.letterCells.concat(Array<string>(num * this.numCols).fill(' '));
    }
}


export function generateCrossword(words: Array<string>): Array<WordLoc> { // return starting positions

    let board: RandomBoard = new RandomBoard(words);

    return board.getLocs();
}