export async function getJsonFromAPI(baseUrl: string, body: Record<string, string>, addHeaders: Record<string, string> = {}, userAgent: string = "karlklaffen@gmail.com", ): Promise<any> {

    let newHeaders: Record<string, string> = addHeaders;
    newHeaders["User-Agent"] = userAgent;

    return fetch(baseUrl + new URLSearchParams(body).toString(),
        {
            method: "GET",
            headers: newHeaders,
        })
        .then(text => text.json());
}

export function setJsonFromAPI(baseUrl: string, body: Record<string, string>, headers: Record<string, string>, setFunction: (obj: any) => void): void {
    let func = async () => {
        setFunction(await getJsonFromAPI(baseUrl, body, headers));
    }
    func();
}

export async function getLinesFromFile(path: string): Promise<Array<string>> {
    return await fetch(path)
        .then(response => response.text())
        .then(text => text.split('\r\n'));
}

export function setLinesFromFile(path: string, setFunction: (lines: Array<string>) => void): void {

    getLinesFromFile(path)
        .then(lines => setFunction(lines));

}