import {CellPos, WordInfo, WordLoc, WordHead} from "./CrosswordUtils"
import {getAllUppercaseLetters, getRandomInt, getRandomUniqueElements, getRandomUniqueElement, getMatrix, flipCoin, getArrayWithRemovedIndices, getArrayWithRemovedOneOfElems, addSetsToSet, getAddedSets, getIndicesOfCharInString, range} from "./Utils"

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

// class WordLettersInfo {
//     wordIndex: number;
//     letterIndices: Array<number>

//     constructor(wordIndex: number, letterIndices: Array<number>) {
//         this.wordIndex = wordIndex;
//         this.letterIndices = letterIndices;
//     }
// }

// function getLetterIndexMapFromString(str: string) {

// }

// function getLetterMap(infos: Array<WordInfo>): Map<string, Array<number>> {
//     let uppercaseLetters: string = getAllUppercaseLetters();

//     let letterMap: Map<string, Array<WordLettersInfo>> = new Map<string, Array<WordLettersInfo>>();
    
//     for (const letter of uppercaseLetters) {
//         letterMap.set(letter, []);
//     }

//     for (let i = 0; i < infos.length; i++) {
//         const word = infos[i].word;

//         let wordLetMap: Map<string, Array<number>> = new Map<string, Array<number>>();

//         for (const letter of word) {
//             if (wordLetMap.con)
//             letterMap.get(letter)?.push(WordLettersInfo(i, ));
//         }
//     }

//     return letterMap;
// }

// function getInitialCombo(infos: Array<WordInfo>, map: Map<string, Array<number>>): WordConnectionInfo { // length 2
//     let validLetters: Array<string> = [];

//     for (const pair of map) {
//         if (pair[1].length >= 2)
//             validLetters.push(pair[0]);
//     }

//     let randomLetter: string = getRandomUniqueElements(validLetters, 1)[0];

//     let randomTwoWords: Array<WordInfo> = getRandomUniqueElements(infos, 2);

//     return [infos[0], infos[1]];
// }

// function getBoard(words: Array<string>, connections: Array<WordConnectionInfo>) {
//     for (const connection of connections) {
        
//     }
// }

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
            console.log(this.getBoardLines());
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

        console.log('set word', placement, this.words[placement.wordIndex]);

        this.wordPlacements.push(placement);
        this.availableWordIndices.delete(placement.wordIndex);
    }

    #getCellsToCheck(placement: WordPlacement, connectionPos: CellPos): Set<CellPos> {
        const word: string = this.words[placement.wordIndex];

        let poses: Set<CellPos> = new Set([]);

        if (placement.right) {
            poses.add(placement.startPos.left());
            poses.add(placement.startPos.right(word.length));

            for (let i = 0; i < word.length; i++) {
                let thisPos: CellPos = placement.startPos.right(i);
                if (!thisPos.isSameAs(connectionPos)) {
                    poses.add(thisPos);
                    poses.add(thisPos.up());
                    poses.add(thisPos.down());
                }
            }
        }
        else {
            poses.add(placement.startPos.up());
            poses.add(placement.startPos.down(word.length));

            for (let i = 0; i < word.length; i++) {
                let thisPos: CellPos = placement.startPos.down(i);
                if (!thisPos.isSameAs(connectionPos)) {
                    poses.add(thisPos);
                    poses.add(thisPos.left());
                    poses.add(thisPos.right());
                }
            }
        }

        let validPoses: Set<CellPos> = new Set([]);

        let numRows: number = this.#getNumRows();
        for (const pos of poses)
            if (this.#getActualPos(pos).inRange(numRows, this.numCols))
                validPoses.add(pos);

        return validPoses;
    }

    #allCellsClear(poses: Set<CellPos>): boolean {
        for (const pos of poses) {
            if (this.#getLetter(pos) !== ' ')
                return false;
        }

        return true;
    }

    #placementIsValid(placement: WordPlacement, connectionPos: CellPos): boolean {
        return this.#allCellsClear(this.#getCellsToCheck(placement, connectionPos));
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

        console.log(this.getBoardLines());
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
                console.log(word, letter, letIndices);

                for (const letIndex of letIndices) {
                    let possibleRightPlacement: WordPlacement = new WordPlacement(thisPos.left(letIndex), true, wordIndex);
                    let possibleDownPlacement: WordPlacement = new WordPlacement(thisPos.up(letIndex), false, wordIndex);

                    if (this.#placementIsValid(possibleRightPlacement, thisPos)) {
                        console.log(thisPos, word, letIndex, thisPos.left(letIndex));
                        possiblePlacements.add(possibleRightPlacement);
                    }

                    if (this.#placementIsValid(possibleDownPlacement, thisPos)) {
                        console.log(thisPos, word, letIndex, thisPos.up(letIndex));
                        possiblePlacements.add(possibleDownPlacement);
                    }
                }
            }
        }

        console.log('possible', possiblePlacements);

        return possiblePlacements;
    }

    #getAdditionalRandomConnection() {
        let placements: Set<WordPlacement> = this.#getPossibleAddedRandomConnections();

        return getRandomUniqueElement(Array.from(placements));
    }

    #addWordPlacement(placement: WordPlacement): void {

        console.log('added placement', placement);

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

        console.log(possibles, elem);

        // console.log(typeof(getRandomUniqueElements<WordConnectionInfo>(possibles, 1)));

        if (flipCoin() == "heads")
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
        console.log('added left', num)
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
        console.log('added right', num)

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
        console.log('added up', num)

        this.origin = this.origin.down(num);

        this.letterCells = Array<string>(num * this.numCols).fill(' ').concat(this.letterCells);
    }

    #expandDown(num: number) {
        console.log('added down', num)

        this.letterCells = this.letterCells.concat(Array<string>(num * this.numCols).fill(' '));
    }
}


export function generateCrossword(words: Array<string>): Array<WordLoc> { // return starting positions

    let board: RandomBoard = new RandomBoard(words);

    console.log('final board', board.getBoardLines());

    return board.getLocs();
}