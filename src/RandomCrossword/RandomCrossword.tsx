import {type JSX, useState, useEffect} from "react"
import { WordHead, WordLoc, type WordInfo } from "../Crossword/CrosswordUtils";
import { getMinWikiData, getNumRandomWordInfosFromCategory } from "./RandomCrosswordUtils";
import { generateCrossword } from "./CrosswordGeneration";
import Crossword from "../Crossword/Crossword";

function RandomCrossword({wikiURL, categoryName, numAnswers, callbackFunc}: {wikiURL: string, categoryName: string, numAnswers: number, callbackFunc: () => void}): JSX.Element {
      
  const [wordHeads, setWordHeads] = useState(Array<WordHead>());
  const [generatedCrossword, setGeneratedCrossword] = useState<boolean>(false);

  console.log('rerender2');

  console.log('num answers      ', numAnswers);
  
  let wordInfos: Array<WordInfo> = [];

  console.log('uruuruurl: ', wikiURL);

  useEffect(() => {

    let getData: () => Promise<void> = async () => {
      
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
      
      setWordHeads(heads);
      setGeneratedCrossword(true);
      callbackFunc();
    };

    getData();
  }, []);

  
  return !generatedCrossword ?
    <p>Generating Crossword . . .</p>
    :
    <Crossword wordHeads={wordHeads} />
}

export default RandomCrossword;