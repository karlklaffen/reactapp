import {type JSX, useState, useEffect} from "react"
import { WordHead, WordLoc, type WordInfo } from "../Crossword/CrosswordUtils";
import { getMinWikiData, getNumRandomWordInfosFromCategory } from "./RandomCrosswordUtils";
import { generateCrossword } from "./CrosswordGeneration";
import Crossword from "../Crossword/Crossword";

function RandomCrossword({wikiURL, categoryName, numAnswers}: {wikiURL: string, categoryName: string, numAnswers: number}): JSX.Element {
      
  const [wordHeads, setWordHeads] = useState(Array<WordHead>());

  console.log('rerender2');
  
  let wordInfos: Array<WordInfo> = [];

  useEffect(() => {

    let getData: () => Promise<void> = async () => {
      console.log('started');
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
      console.log('finished');
    };

    getData();
    console.log('tried');
  }, [])

  
  return wordHeads.length === 0 ?
    <p>No Crossword</p>
    :
    <Crossword wordHeads={wordHeads} />
}

export default RandomCrossword;