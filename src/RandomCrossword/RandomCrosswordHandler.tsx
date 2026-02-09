import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "../Utils/Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "../Crossword/CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "../Utils/APIUtils"
import { generateCrossword } from './CrosswordGeneration'
import {getMinWikiData, getNumRandomWordInfosFromCategory, type WikiType, type WikiTypeData, getWikiTypeByDisplayName} from "./RandomCrosswordUtils"

import WikiSelectionRadios from './WikiSelectionRadios'
import WikiCategoryRadios from './WikiCategoryRadios'

import RandomCrossword from "./RandomCrossword"
// import RandomCrosswordSelector from './RandomCrosswordSelector'
import SmartSelection from '../Utils/SmartSelection'
import { SelectionGroup, type SelectionOption } from '../Utils/SmartSelectionUtils'

function RandomCrosswordHandler({wikiTypes, minNumAnswers, maxNumAnswers}: {wikiTypes: Array<WikiType>, minNumAnswers: number, maxNumAnswers: number}): JSX.Element {

  const WIKI_SELECTION_GROUP_NAME = "wiki";
  const CATEGORY_SELECTION_GROUP_NAME = "category";
  
  const [selectedWikiName, setSelectedWikiName] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  const [numAnswers, setNumAnswers] = useState<number>((minNumAnswers + maxNumAnswers) / 2);

  if (wikiTypes.length == 0)
    return <div>No Wikis to generate crossword</div>;

  console.log('rerender');

  let crosswordJSX = selectedWikiName === "" ? <div>No Crossword</div> :
    <RandomCrossword wikiURL={getWikiTypeByDisplayName(wikiTypes, selectedWikiName)!.url} categoryName={selectedCategoryName} numAnswers={numAnswers}/>

  return (
    <div>
      {crosswordJSX}
      {/* <RandomCrosswordSelector wikiSelectionGroupName={WIKI_SELECTION_GROUP_NAME} categorySelectionGroupName={CATEGORY_SELECTION_GROUP_NAME}
        wikiTypeData={wikiTypeData} minNumAnswers={minNumAnswers} maxNumAnswers={maxNumAnswers} callbackFunc={(wikiName: string, categoryName: string, numAnswers: number) => {
        
        setSelectedWikiName(wikiName);
        setSelectedCategoryName(categoryName);
        setNumAnswers(numAnswers);
        console.log('returned');
      }} /> */}
      <SmartSelection<WikiTypeData> initialGroup={new SelectionGroup('wikis', 'radio',

        wikiTypes.map((type: WikiType) => {
          return {displayName: type.displayName, data: {url: type.url, categoryNames: type.categoryNames}};
        }),

        new Set([0]),
        
        (selectedOption: SelectionOption<WikiTypeData>) => {

          return <SmartSelection<null> initialGroup={new SelectionGroup<null>('categories', 'radio',
            
            selectedOption.data.categoryNames.map((catName: string) => {
              return {displayName: catName, data: null};
            }),

            new Set([0])
          )} />
        }
      )} />
    </div>
  )
}

export default RandomCrosswordHandler;
