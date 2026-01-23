import { useEffect, useState, type JSX } from 'react'
import {getLinesFromFile} from "./APIUtils"
import {WordHead, CellPos} from "./CrosswordUtils"
import {fileLinesToWikiCategories, WikiTypeData} from "./RandomCrosswordUtils"

import RandomCrossword from './RandomCrossword'

function RandomCrosswordLauncher({fileName}: {fileName: string}) {
    const [wikiTypeData, setWikiTypeData] = useState<Map<string, WikiTypeData> | null>(null);

  useEffect(() => {
    (async () => {
      let wikiDataLines: Array<string> = await getLinesFromFile("wikis.txt");
      setWikiTypeData(fileLinesToWikiCategories(wikiDataLines));
    })();
  }, []);

  if (wikiTypeData == null)
    return <div>Loading Random Crossword Data...</div>

  console.log(wikiTypeData);
  
  return (
    <div>
      <RandomCrossword wikiTypeData={wikiTypeData}/>
    </div>
  )
}

export default RandomCrosswordLauncher;