export function setLinesFromFile(path: string, setFunction: (lines: Array<string>) => void): void {

    fetch(path)
        .then((response) => response.text())
        .then((text) => setFunction(text.split('\r\n')));

}

export function isLetterKey(keyStr: string) {
    let code: number = keyStr.charCodeAt(0);
    return keyStr.length == 1 && (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}