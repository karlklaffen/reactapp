import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "../Utils/Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "../Crossword/CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "../Utils/APIUtils"
import { generateCrossword } from './CrosswordGeneration'
import {getMinWikiData, getNumRandomWordInfosFromCategory, WikiTypeData} from "./RandomCrosswordUtils"

import WikiSelectionRadios from './WikiSelectionRadios'
import WikiCategoryRadios from './WikiCategoryRadios'

import RandomCrossword from "./RandomCrossword"
import RandomCrosswordSelector from './RandomCrosswordSelector'

function RandomCrosswordHandler({wikiTypeData, minNumAnswers, maxNumAnswers}: {wikiTypeData: Map<string, WikiTypeData>, minNumAnswers: number, maxNumAnswers: number}): JSX.Element {
  
  const [selectedWikiName, setSelectedWikiName] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  const [numAnswers, setNumAnswers] = useState<number>((minNumAnswers + maxNumAnswers) / 2);
  
  // const [resetEnabled, setResetEnabled] = useState(true);
  
  const WIKI_SELECTION_GROUP_NAME = "wiki";
  const CATEGORY_SELECTION_GROUP_NAME = "category";

  if (wikiTypeData.size == 0)
    return <div>No Wikis to generate crossword</div>

  // let checkedWikiRadio: HTMLInputElement | null = getCheckedRadio(WIKI_SELECTION_GROUP_NAME);

  // let getRandomCrosswordFunc = async () => {
  //   setResetEnabled(false);
    

  //   setResetEnabled(true);
  // }

  console.log('rerender');

  let crosswordJSX = selectedWikiName === "" ? <div>No Crossword</div> :
    <RandomCrossword wikiURL={wikiTypeData.get(selectedWikiName)!.url} categoryName={selectedCategoryName} numAnswers={numAnswers}/>

  return (
    <div>
      {crosswordJSX}
      <RandomCrosswordSelector wikiSelectionGroupName={WIKI_SELECTION_GROUP_NAME} categorySelectionGroupName={CATEGORY_SELECTION_GROUP_NAME}
        wikiTypeData={wikiTypeData} minNumAnswers={minNumAnswers} maxNumAnswers={maxNumAnswers} callbackFunc={(wikiName: string, categoryName: string, numAnswers: number) => {
        
        setSelectedWikiName(wikiName);
        setSelectedCategoryName(categoryName);
        setNumAnswers(numAnswers);
        console.log('returned');
      }} />
    </div>
  )
}

export default RandomCrosswordHandler;
