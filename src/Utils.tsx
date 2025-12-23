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
    return keyStr.length == 1 && (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
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