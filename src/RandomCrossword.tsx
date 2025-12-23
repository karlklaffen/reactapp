import { useEffect, useState, type JSX } from 'react'
import {setJsonFromAPI, getJsonFromAPI, areLetters} from "./Utils"
import {WordInfo, WordHead, CellPos} from "./CrosswordUtils"

import Crossword from "./Crossword"

function getWordFromTitle(title: string): string | null {
  let newTitle: string = '';

  for (const char of title) {
    if (char == ' ')
      continue;

    if (!areLetters(char))
      return null;

    newTitle += char;
  }

  if (newTitle == '')
    return null;

  return newTitle.toUpperCase();
}

function getClueFromSentence(sentence: string): string | null {
  const descriptorWords = ['is', 'was', 'are']
  for (const word of descriptorWords) {
    let wordToFind: string = ` ${word} `;
    console.log('word', word, sentence);
    let index: number = sentence.indexOf(wordToFind);
    if (index == -1)
      continue;

    let clueToReturn: string = sentence.substring(index + wordToFind.length);
    return `${clueToReturn[0].toUpperCase()}${clueToReturn.substring(1)}`;
  }

  return null;
}

function getWordInfoFromWikiJson(pageJson: any): WordInfo | null {

  let title: string | null = getWordFromTitle(pageJson.title);

  if (title == null)
    return null;

  let clue: string | null = getClueFromSentence(pageJson.extract);

  if (clue == null)
    return null;

  return new WordInfo(title, clue);
}

function getWordInfosFromWikiJson(json: any, maxWanted: number | null = null): Array<WordInfo> {

  console.log(json.query.pages);

  let infos: Array<WordInfo> = [];
  const pages: any = json.query.pages;
  for (const pageId in pages) {

    if (maxWanted == infos.length)
      break;

    const thisPage = pages[pageId];
    let thisInfo: WordInfo | null = getWordInfoFromWikiJson(thisPage);

    if (thisInfo == null)
      continue;

    infos.push(thisInfo);
  }

  return infos;
}

async function getWikiData(requestNum: number): Promise<any> {
  return getJsonFromAPI('https://en.wikipedia.org/w/api.php?',
      {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        exintro: 'true',
        exsentences: '1',
        explaintext: 'true',
        generator: 'random',
        grnnamespace: '0',
        grnlimit: requestNum.toString(),
        origin: '*'
      },
      {
        'User-Agent': 'karlklaffen@gmail.com'
      }
    );
}

async function getMinWikiData(totalRequested: number): Promise<Array<WordInfo>> {
  // Plan for getting minimum:
  // Get num requested * 2 
  // After, keep getting num remaining * 2

  let infos: Array<WordInfo> = [];

  while (infos.length < totalRequested) {

    let numNeeded = totalRequested - infos.length;

    const jsonBatch: any = await getWikiData(numNeeded * 2);

    let theseInfos: Array<WordInfo> = getWordInfosFromWikiJson(jsonBatch, numNeeded);
    infos.push(...theseInfos);
  }
    
  return infos;
  
}

function getWordHeadsFromInfo(wordInfos: Array<WordInfo>): Array<WordHead> {

  let row: number = 0;

  let heads: Array<WordHead> = [];

  for (const info of wordInfos) {
    heads.push(new WordHead(new CellPos(row, 0), true, row + 1, info));
    row++;
  }

  return heads;
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

    let wordInfos: Array<WordInfo> = await getMinWikiData(5);
    console.log('infos', wordInfos);
    setWordHeads(getWordHeadsFromInfo(wordInfos));

    setResetEnabled(true);
  }

  let baseElements: JSX.Element = wordHeads.length == 0 ?
    <p>No Crossword</p>
    :
    <Crossword wordHeads={wordHeads} />
  
  return (
    <div>
      {baseElements}
      <button onClick={getRandomCrosswordFunc} disabled={!resetEnabled}>
        Generate New Crossword
      </button>
    </div>
  )
}

export default RandomCrossword;
