import { useEffect, useState, type JSX } from 'react'
import {setJsonFromAPI, getJsonFromAPI, areLetters, getCheckedRadio} from "./Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "./CrosswordUtils"
import { generateCrossword } from './CrosswordGeneration'

import Crossword from "./Crossword"

function getWordFromTitle(title: string): string | null {
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

async function getWikiData(wiki: string, requestNum: number): Promise<any> {
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
      },
      {
        'User-Agent': 'karlklaffen@gmail.com'
      }
    );
}

async function getMinWikiData(wiki: string, totalRequested: number): Promise<Array<WordInfo>> {
  // Plan for getting minimum:
  // Get num requested * 2 
  // After, keep getting num remaining * 2

  let infos: Array<WordInfo> = [];

  while (infos.length < totalRequested) {

    let numNeeded = totalRequested - infos.length;

    const jsonBatch: any = await getWikiData(wiki, numNeeded * 2);

    let theseInfos: Array<WordInfo> = getWordInfosFromWikiJson(jsonBatch, numNeeded);
    infos.push(...theseInfos);
  }
    
  return infos;
  
}

function RandomCrossword() {

  const [wordHeads, setWordHeads] = useState(Array<WordHead>());
  const [resetEnabled, setResetEnabled] = useState(true);

  // let afterGotDataFunc = (json: any) => {
  //   setWikiJson(json);
  //   setResetEnabled(true);
  // }

  let getRandomCrosswordFunc = async () => {
    setResetEnabled(false);

    let radioElem: HTMLInputElement | null = getCheckedRadio("wikitype");
    if (radioElem != null) {
      let wordInfos: Array<WordInfo> = await getMinWikiData(radioElem.value, 5);

      let strs: Array<string> = [];
      for (const info of wordInfos)
        strs.push(info.word);

      let wordLocs: Array<WordLoc> = generateCrossword(strs);

      let heads: Array<WordHead> = [];
      for (let i = 0; i < wordInfos.length; i++)
        heads.push(new WordHead(wordLocs[i], wordInfos[i]));

      console.log('heads', heads);
      
      setWordHeads(heads);
    }

    setResetEnabled(true);
  }

  console.log(wordHeads.length === 0, wordHeads);
  let baseElements: JSX.Element = wordHeads.length === 0 ?
    <p>No Crossword</p>
    :
    <Crossword wordHeads={wordHeads} />
  
  return (
    <div>
      {baseElements}
      <button onClick={getRandomCrosswordFunc} disabled={!resetEnabled}>
        Generate New Crossword
      </button>
      <input type="radio" name="wikitype" id="wikipediabt" value="en.wikipedia.org/w" defaultChecked/>
      <label htmlFor="wikipediabt">Wikipedia</label>
      <input type="radio" name="wikitype" id="minecraftwikibt" value="minecraft.wiki" />
      <label htmlFor="minecraftwikibt">Minecraft Wiki</label>
    </div>
  )
}

export default RandomCrossword;
