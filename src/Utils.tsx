type Primitive = string | number 

export function setLinesFromFile(path: string, setFunction: (lines: Array<string>) => void): void {

    fetch(path)
        .then(response => response.text())
        .then(text => setFunction(text.split('\r\n')));

}

export async function getJsonFromAPI(baseUrl: string, body: Record<string, string>, headers: HeadersInit): Promise<any> {
    return fetch(baseUrl + new URLSearchParams(body).toString(),
        {
            method: "GET",
            headers: headers,
        })
        .then(text => text.json());
}

export function setJsonFromAPI(baseUrl: string, body: Record<string, string>, headers: HeadersInit, setFunction: (obj: any) => void): void {
    let func = async () => {
        setFunction(await getJsonFromAPI(baseUrl, body, headers));
    }
    func();
}

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

// export function getClone<Type>(obj: Type): Type {
//     return structuredClone(obj);
// }

// export function getRandomUniqueElements<Type>(elements: Array<Type>, num: number = 1): Array<Type> {
//     let newList: Array<Type> = getClone(elements);

//     let retElems: Array<Type> = [];

//     for (let i = 0; i < num; i++) {
//         const thisElemIndex: number = getRandomInt(elements.length);
//         retElems.push(newList[thisElemIndex]);
//         newList.splice(thisElemIndex, 1);
//     }

//     return retElems;
// }

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

export function range(max: number) {

    let indices: Array<number> = [];
    for (let i = 0; i < max; i++)
        indices.push(i);

    return indices;
}