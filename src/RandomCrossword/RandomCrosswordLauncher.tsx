import { useEffect, useState, type JSX } from 'react'
import {getLinesFromFile} from "../Utils/APIUtils"
import {fileLinesToWikiCategories, type WikiType} from "./RandomCrosswordUtils"

import RandomCrosswordHandler from './RandomCrosswordHandler'

function RandomCrosswordLauncher({fileName}: {fileName: string}) {

  const [wikiTypeData, setWikiTypeData] = useState<Array<WikiType> | null>(null);

  useEffect(() => {
    (async () => {
      let wikiDataLines: Array<string> = await getLinesFromFile(fileName);
      setWikiTypeData(fileLinesToWikiCategories(wikiDataLines));
    })();
  }, []);

  if (wikiTypeData == null)
    return <div>Loading Random Crossword Data...</div>
  
  return (
    <div>
      <RandomCrosswordHandler wikiTypes={wikiTypeData} minNumAnswers={3} maxNumAnswers={15}/>
    </div>
  )
}

export default RandomCrosswordLauncher;