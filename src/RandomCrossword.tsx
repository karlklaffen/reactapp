import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "./Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "./CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "./APIUtils"
import { generateCrossword } from './CrosswordGeneration'
import {getMinWikiData, WikiTypeData} from "./RandomCrosswordUtils"

import WikiSelectionRadios from './WikiSelectionRadios'
import WikiCategoryRadios from './WikiCategoryRadios'

import Crossword from "./Crossword"

function RandomCrossword({wikiTypeData}: {wikiTypeData: Map<string, WikiTypeData>}): JSX.Element {

  const [wordHeads, setWordHeads] = useState(Array<WordHead>());
  const [resetEnabled, setResetEnabled] = useState(true);

  const [selectedWikiName, setSelectedWikiName] = useState<string>(getWithDefault(wikiTypeData.keys().next().value, ""));

  if (wikiTypeData.size == 0)
    return <div>No Wikis to generate crossword</div>

  let checkedWikiRadio: HTMLInputElement | null = getCheckedRadio("wiki");

  let getRandomCrosswordFunc = async () => {
    setResetEnabled(false);

    let selectedWikiUrl: string | undefined = checkedWikiRadio == null ? undefined : wikiTypeData.get(checkedWikiRadio.value)?.url;

    if (selectedWikiUrl != undefined) {
      let wordInfos: Array<WordInfo> = await getMinWikiData(selectedWikiUrl, 10);

      console.log('word infos', wordInfos);

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

  let updateCategoriesFunc = (e: any) => {
    if (e.target == null)
      return;

    setSelectedWikiName(e.target.value);
    console.log(e.target.value);
  }

  console.log(wordHeads.length === 0, wordHeads);
  let baseElements: JSX.Element = wordHeads.length === 0 ?
    <p>No Crossword</p>
    :
    <Crossword wordHeads={wordHeads} />

  let categoryNames: Array<string> | null = getWithDefault(wikiTypeData.get(selectedWikiName)?.categoryNames, null);

  console.log(checkedWikiRadio);

  return (
    <div>
      {baseElements}
      <button onClick={getRandomCrosswordFunc} disabled={!resetEnabled}>
        Generate New Crossword
      </button>
      
      <div>
        <div>
          Wiki:
          <WikiSelectionRadios wikiNames={Array.from(wikiTypeData.keys())} groupName={"wiki"} onClick={updateCategoriesFunc}/>
        </div>
        <div>
          Category:
          <WikiCategoryRadios wikiCategories={categoryNames} />
        </div>
      </div>
    </div>
  )
}

export default RandomCrossword;
