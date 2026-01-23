import {areLetters} from "./Utils"
import {WordInfo} from "./CrosswordUtils"
import {getJsonFromAPI} from "./APIUtils"

function getWordFromTitle(title: string): string | null {
  if (title.length > 25)
    return null;

  let newTitle: string = '';

  for (const char of title) {
    if (char === ' ')
      continue;

    if (!areLetters(char))
      return null;

    newTitle += char;
  }

  if (newTitle === '')
    return null;

  return newTitle.toUpperCase();
}

function getClueFromSentence(sentence: string): string | null {
  const descriptorWords = ['is', 'was', 'are']
  let minIndex: number = -1;
  let curFoundWord: string = '';
  for (const word of descriptorWords) {
    let wordToFind: string = ` ${word} `;
    let index: number = sentence.indexOf(wordToFind);
    if (index === -1)
      continue;

    if (minIndex === -1 || index < minIndex) {
      minIndex = index;
      curFoundWord = wordToFind;
    }
  }

  if (minIndex === -1)
    return null;

  let clueToReturn: string = sentence.substring(minIndex + curFoundWord.length);
  return `${clueToReturn[0].toUpperCase()}${clueToReturn.substring(1)}`;

}

function getWordInfoFromWikiJson(pageJson: any): WordInfo | null {

  let title: string | null = getWordFromTitle(pageJson.title);

  if (title === null)
    return null;

  let clue: string | null = getClueFromSentence(pageJson.extract);

  if (clue === null)
    return null;

  return new WordInfo(title, clue);
}

function getWordInfosFromWikiJson(json: any, maxWanted: number | null = null): Array<WordInfo> {

  console.log('json', json);
  let infos: Array<WordInfo> = [];
  const pages: any = json.query.pages;
  for (const pageId in pages) {

    if (maxWanted === infos.length)
      break;

    const thisPage = pages[pageId];
    let thisInfo: WordInfo | null = getWordInfoFromWikiJson(thisPage);

    if (thisInfo === null)
      continue;

    infos.push(thisInfo);
  }

  return infos;
}

async function getRandomPageWikiData(wiki: string, requestNum: number): Promise<any> {
  return getJsonFromAPI(`https://${wiki}/api.php?`,
      {
        action: 'query',
        format: 'json',
        origin: '*',
        prop: 'extracts',
        generator: 'random',
        formatversion: '2',
        exsentences: '1',
        exintro: '1',
        explaintext: '1',
        grnnamespace: '0',
        grnlimit: requestNum.toString()
      }
    );
}

function parseCategoryTitleData(data: any): Array<string> {
  let titles: Array<string> = [];

  for (const member of data.query.categorymembers)
    titles.push(member.title)

  return titles;
}

export async function getAllPageTitlesInCategory(wiki: string, category: string, cont: string | null = null): Promise<Array<string>> {
  let body: Record<string, string> = {
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      formatversion: '2',
      grnnamespace: '0',
      cmtitle: `Category:${category}`
    };
  
  if (cont != null)
    body.cmcontinue = cont;

  let curData: any = await getJsonFromAPI(`https://${wiki}/api.php?`, body);

  let curTitles: Array<string> = parseCategoryTitleData(curData);

  if (Object.hasOwn(curData, "continue"))
    curTitles.push(...await getAllPageTitlesInCategory(wiki, category, curData["continue"]["cmcontinue"]))

  return curTitles;
    
}

export async function getMinWikiData(wiki: string, totalRequested: number): Promise<Array<WordInfo>> {
  // Plan for getting minimum:
  // Get num requested * 2 
  // After, keep getting num remaining * 2

  let infos: Array<WordInfo> = [];

  while (infos.length < totalRequested) {

    let numNeeded = totalRequested - infos.length;

    const jsonBatch: any = await getRandomPageWikiData(wiki, numNeeded * 2);

    let theseInfos: Array<WordInfo> = getWordInfosFromWikiJson(jsonBatch, numNeeded);
    infos.push(...theseInfos);
  }
    
  return infos;
  
}

// export class WikiType {
//   name: string;
//   url: string;

//   constructor(name: string, url: string) {
//     this.name = name;
//     this.url = url;
//   }
// }

export class WikiTypeData {
  url: string;
  categoryNames: Array<string>;

  constructor(url: string, categoryNames: Array<string>) {
    this.url = url;
    this.categoryNames = categoryNames;
  }
}

export class WikiInfo {
  name: string;
  url: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }
}

export function fileLinesToWikiCategories(lines: Array<string>): Map<string, WikiTypeData> {
  let catMap: Map<string, WikiTypeData> = new Map();

  let collectedData: boolean = false;
  let curWikiName: string = "";
  let curWikiUrl: string = "";
  let curCats: Array<string> = [];

  console.log(lines);

  for (let i = 0; i <= lines.length; i++) {
    if (lines[i] == "" || i == lines.length) { // blank line or end, reset
      if (collectedData) {
        catMap.set(curWikiName, new WikiTypeData(curWikiUrl, curCats));
        collectedData = false;
      }
    }
    else {
      if (!collectedData) { // if started over, do this
        let wikiInfo = lines[i].split(" / ");
        curWikiName = wikiInfo[0];
        curWikiUrl = wikiInfo[1];
        curCats = [];
      }
      else {
        curCats.push(lines[i]);
      }
      collectedData = true;
    }
  }

  console.log(catMap);

  return catMap;
}