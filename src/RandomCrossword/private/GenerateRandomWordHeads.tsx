import {type JSX, useState, useEffect} from "react"
import { WordHead, WordLoc, type WordInfo } from "../../Crossword/private/CrosswordUtils";
import { getMinWikiData, getNumRandomWordInfosFromCategories } from "./RandomCrosswordUtils";
import { generateCrossword } from "./CrosswordGeneration";
import Crossword from "../../Crossword/Crossword";

export async function generateRandomWordHeads(wikiURL: string, categoryNames: Array<string>, numAnswers: number): Promise<Array<WordHead>> {
  
  let wordInfos: Array<WordInfo> = [];

  if (categoryNames.includes("All"))
    wordInfos = await getMinWikiData(wikiURL, numAnswers);
  else
    wordInfos = await getNumRandomWordInfosFromCategories(wikiURL, categoryNames, numAnswers);

  let strs: Array<string> = [];
  for (const info of wordInfos)
    strs.push(info.word);

  let wordLocs: Array<WordLoc> = generateCrossword(strs);

  let heads: Array<WordHead> = [];
  for (let i = 0; i < wordInfos.length; i++)
    heads.push(new WordHead(wordLocs[i], wordInfos[i]));

  
  return heads;
}