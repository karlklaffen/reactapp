import {areLetters, getRandomUniqueElements} from "../Utils/Utils"
import {WordInfo} from "../Crossword/CrosswordUtils"
import {getJsonFromAPI} from "../Utils/APIUtils"
import { type SelectionOption } from "../Utils/SmartSelectionUtils";

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

async function getPageWikiData(wiki: string, titles: Array<string>): Promise<any> {
  return getJsonFromAPI(`https://${wiki}/api.php?`,
      {
        action: 'query',
        format: 'json',
        origin: '*',
        prop: 'extracts',
        titles: titles.join('|'),
        formatversion: '2',
        exsentences: '1',
        exintro: '1',
        explaintext: '1',
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

export type WikiType = {
  displayName: string;
  url: string;
  categoryNames: Array<string>;
}

export type WikiTypeData = {
  url: string;
  categoryNames: Array<string>;
}

export type WikiInfo = {
  name: string;
  url: string;
}

export function fileLinesToWikiCategories(lines: Array<string>): Array<WikiType> {
  let types: Array<WikiType> = new Array<WikiType>();

  let collectedData: boolean = false;
  let curWikiName: string = "";
  let curWikiUrl: string = "";
  let curCats: Array<string> = [];

  console.log(lines);

  for (let i = 0; i <= lines.length; i++) {
    if (lines[i] == "" || i == lines.length) { // blank line or end, reset
      if (collectedData) {
        types.push({displayName: curWikiName, url: curWikiUrl, categoryNames: curCats});
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

  console.log(types);

  return types;
}

export async function getNumRandomWordInfosFromCategory(wiki: string, category: string, num: number): Promise<Array<WordInfo>> {
  let allPages: Array<string> = await getAllPageTitlesInCategory(wiki, category);

  let selectedPageTitles: Array<string> = getRandomUniqueElements(allPages, num);

  let data: any = await getPageWikiData(wiki, selectedPageTitles);

  return getWordInfosFromWikiJson(data);
}

export class RandomCrosswordSpecificationInfo {
  wikiName: string;
  categoryName: string;

  constructor(wikiName: string, categoryName: string) {
    this.wikiName = wikiName;
    this.categoryName = categoryName;
  }
}

export function getWikiTypeByDisplayName(wikiTypes: Array<WikiType>, displayName: string): WikiType | undefined {
  for (const type of wikiTypes)
    if (type.displayName == displayName)
      return type;
  
  return undefined;
}

// export function getSelectionOptionsFromWikiTypes(wikiTypes: Array<WikiType>): Array<SelectionOption> {
//   let options: Array<SelectionOption> = [];

//   for (const type of wikiTypes)
//     options.push({displayName: type.displayName, value: type.url});

//   return options;
// }

// export function getSelectionOptionsFromCategoryTypes(catNames: Array<string>): Array<SelectionOption> {
//   let options: Array<SelectionOption> = [];


// }