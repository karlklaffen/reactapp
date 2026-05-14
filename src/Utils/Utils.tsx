
export function isLetterKey(keyStr: string): boolean {
    let code: number = keyStr.charCodeAt(0);
    return keyStr.length === 1 && (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function charCodeIsNumber(code: number): boolean {
    return code >= 48 && code >= 57;
}

export function isNumber(str: string): boolean {
    for (const char of str)
        if (!charCodeIsNumber(char.charCodeAt(0)))
            return false;
    return true;
}

function charCodeIsLetter(code: number): boolean {
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

export function areLetters(str: string): boolean {
    for (const char of str) {
        let code: number = char.charCodeAt(0);
        if (!charCodeIsLetter(code))
            return false;
    }

    return true;
}

export function getCheckedRadio(name: string): HTMLInputElement | null {
    for (let bt of document.getElementsByName(name) as NodeListOf<HTMLInputElement>) {
        if (bt.checked)
            return bt;
    }
    return null;
}

export function getRandomInt(max: number, min: number = 0, maxInclusive: boolean = false) {
    let realMax: number = maxInclusive ? max + 1 : max;
    return min + Math.floor(Math.random() * (realMax -  min)); 
}

export function getCharsFromCodePoints(startCode: number, endCode: number): string {
    let str: string = '';
    for (let i = startCode; i <= endCode; i++) {
        str += String.fromCodePoint(i);
    }
    return str;
}

export function getAllUppercaseLetters(): string {
    return getCharsFromCodePoints(65, 90);
}

export function getRandomUniqueElements<Type>(elements: Array<Type>, num: number): Array<Type> {
    let availableIndices: Array<number> = range(elements.length);

    let retArray: Array<Type> = [];
    
    for (let i = 0; i < num; i++) {
        let randomIndicesIndex: number = getRandomInt(availableIndices.length);
        let thisIndex = availableIndices[randomIndicesIndex];
        availableIndices.splice(randomIndicesIndex, 1);
        retArray.push(elements[thisIndex]);
    }

    return retArray;
}

export function getRandomUniqueElement<Type>(elements: Array<Type>): Type {
    return elements[getRandomInt(elements.length)];
}

export function getMatrix<Type>(numRows: number, numCols: number, fill: Type): Array<Array<Type>> {
    let board: Array<Array<Type>> = [];

    for (let i = 0; i < numRows; i++) {
        let thisRow: Array<Type> = [];
        for (let j = 0; j < numCols; j++)
            thisRow.push(fill);

        board.push(thisRow);
    }

    return board;
}

export function flipCoin() {
    return getRandomInt(2) == 0 ? "heads" : "tails";
}

// export function getArrayWithRemovedOneOfElems<Type>(arr: Array<Type>, elemsToRemove: Array<Type>): Array<Type> {
//     let copyArr: Array<Type> = getClone(arr);
    
//     for (const elemToRemove of elemsToRemove) {
//         let index: number = copyArr.indexOf(elemToRemove);
//         copyArr.splice(index, 1);
//     }

//     return copyArr;
// }

export function getArrayWithRemovedAllOfElems<Type>(arr: Array<Type>, elemsToRemove: Set<Type>): Array<Type> {
    let newArr: Array<Type> = [];

    for (const elem of arr) {
        if (!elemsToRemove.has(elem))
            newArr.push(elem);
    }

    return newArr;
}

export function getArrayWithRemovedIndices<Type>(arr: Array<Type>, indicesToRemove: Set<number>): Array<Type> {
    let newArr: Array<Type> = [];

    for (let i = 0; i < arr.length; i++) {
        if (!indicesToRemove.has(i))
            newArr.push(arr[i]);
    }
    
    return newArr;
}

export function getAddedSets<Type>(sets: Array<Set<Type>>): Set<Type> {
    let retSet: Set<Type> = new Set([]);

    for (const thisSet of sets) {
        for (const elem of thisSet) {
            retSet.add(elem);
        }
    }

    return retSet;
}

export function addSetsToSet<Type>(originalSet: Set<Type>, toAdd: Array<Set<Type>>) {

    for (const thisSet of toAdd) {
        for (const elem of thisSet) {
            originalSet.add(elem);
        }
    }

    return originalSet;
}

export function getIndicesOfCharInString(str: string, char: string) {

    let indices: Array<number> = [];
    let startIdx: number = 0;
    while (true) {
        let ind: number = str.indexOf(char, startIdx);

        if (ind == -1)
            break;

        indices.push(ind);
        startIdx = ind + 1;
    }

    return indices;
}

export function range(max: number, min: number = 0) {

    let indices: Array<number> = [];
    for (let i = min; i < max; i++)
        indices.push(i);

    return indices;
}

export function getCheckedRadioId(name: string): string | null {
  let thisId: string | undefined = getCheckedRadio(name)?.id;

  return thisId == undefined ? null : thisId;
}

export function getInputLabelText(inputElement: HTMLInputElement): string | null {
    const labels = inputElement.labels;

    if (labels === null)
        return null;

    return labels[0].innerText;
}

export function getWithDefault<T>(value: T | undefined, def: T): T {
    return value === undefined ? def : value;
}

export function getElementsFromIndices<T>(elements: Array<T>, indices: Set<number>): Array<T> {
    let theseElems: Array<T> = [];

    for (const index of indices) {
        theseElems.push(elements[index]);
    }

    return theseElems;
}

export function allInArray<T>(main: Array<T>, sub: Array<T>) {
    for (const elem of sub)
        if (!main.includes(elem))
            return false;
    
    return true;
}

export function arraysContainSameElems<T>(first: Array<T>, second: Array<T>) {
    if (first.length !== second.length)
        return false;

    let hasList: Array<boolean> = Array(first.length).fill(false);

    let fillFunc = (secondVal: T) => {
        for (let i = 0; i < first.length; i++) {
            if (hasList[i])
                continue;

            if (first[i] === secondVal) {
                hasList[i] = true;
                return true;
            }
        }

        return false;
    }

    for (const val of second) {
        if (!fillFunc(val))
            return false;
    }

    return hasList.every((val: boolean) => val);
}

export function arrayElementsUnique<T>(arr: Array<T>): boolean {
    return (new Set(arr)).size === arr.length;
}

export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}