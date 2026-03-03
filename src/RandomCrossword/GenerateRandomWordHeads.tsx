import {type JSX, useState, useEffect} from "react"
import { WordHead, WordLoc, type WordInfo } from "../Crossword/CrosswordUtils";
import { getMinWikiData, getNumRandomWordInfosFromCategory } from "./RandomCrosswordUtils";
import { generateCrossword } from "./CrosswordGeneration";
import Crossword from "../Crossword/Crossword";

export async function generateRandomWordHeads(wikiURL: string, categoryName: string, numAnswers: number): Promise<Array<WordHead>> {

  console.log('rerender2');

  console.log('num answers      ', numAnswers);
  
  let wordInfos: Array<WordInfo> = [];

  console.log('uruuruurl: ', wikiURL);

  if (categoryName === "All") {
    wordInfos = await getMinWikiData(wikiURL, numAnswers);
  }
  else {
    wordInfos = await getNumRandomWordInfosFromCategory(wikiURL, categoryName, numAnswers);
  }

  let strs: Array<string> = [];
  for (const info of wordInfos)
    strs.push(info.word);

  let wordLocs: Array<WordLoc> = generateCrossword(strs);

  let heads: Array<WordHead> = [];
  for (let i = 0; i < wordInfos.length; i++)
    heads.push(new WordHead(wordLocs[i], wordInfos[i]));

  
  return heads;
}