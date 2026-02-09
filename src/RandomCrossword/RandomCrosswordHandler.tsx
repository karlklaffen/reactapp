import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "../Utils/Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "../Crossword/CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "../Utils/APIUtils"
import { generateCrossword } from './CrosswordGeneration'
import {getMinWikiData, getNumRandomWordInfosFromCategory, type WikiType, type WikiTypeData, getWikiTypeByDisplayName} from "./RandomCrosswordUtils"

// import WikiSelectionRadios from './WikiSelectionRadios'
// import WikiCategoryRadios from './WikiCategoryRadios'

import RandomCrossword from "./RandomCrossword"
// import RandomCrosswordSelector from './RandomCrosswordSelector'
import SmartSelection from '../Utils/SmartSelection'
import { SelectionGroup, type SelectionOption } from '../Utils/SmartSelectionUtils'

function RandomCrosswordHandler({wikiTypes, minNumAnswers, maxNumAnswers}: {wikiTypes: Array<WikiType>, minNumAnswers: number, maxNumAnswers: number}): JSX.Element {
  
  const [selectedWikiUrl, setSelectedWikiUrl] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [numAnswers, setNumAnswers] = useState<number>((minNumAnswers + maxNumAnswers) / 2);
  const [generatingCrossword, setGeneratingCrossword] = useState<boolean>(false);
  const [hasCrossword, setHasCrossword] = useState<boolean>(false);

  console.log('gen', generatingCrossword);

  if (wikiTypes.length == 0)
    return <div>No Wikis to generate crossword</div>;

  let crosswordJSX = !hasCrossword ? <div>No Crossword</div> :
    <RandomCrossword wikiURL={selectedWikiUrl} categoryName={selectedCategoryName} numAnswers={numAnswers} callbackFunc={() => {
      setGeneratingCrossword(false);
    }}/>

  return (
    <div>
      {crosswordJSX}
      <input type="button" value="Generate Crossword" disabled={generatingCrossword} onClick={() => {
        setGeneratingCrossword(true);
        setHasCrossword(true);
        setNumAnswers(5);
      }}/>

      <SmartSelection<WikiTypeData> initialGroup={new SelectionGroup('Wikis:', 'radio',

        wikiTypes.map((type: WikiType) => {
          return {displayName: type.displayName, data: {url: type.url, categoryNames: type.categoryNames}};
        }),

        new Set([0]),

        (selectedOption: SelectionOption<WikiTypeData>, _: boolean) => {
          setSelectedWikiUrl(selectedOption.data.url);
        },
        
        (selectedOption: SelectionOption<WikiTypeData>) => {

          return <SmartSelection<null> initialGroup={new SelectionGroup<null>('Categories:', 'radio',
            
            selectedOption.data.categoryNames.map((catName: string) => {
              console.log(selectedOption.displayName);

              return {displayName: catName, data: null};
            }),

            new Set([0]),

            (selectedOption: SelectionOption<null>, _: boolean) => {
              setSelectedCategoryName(selectedOption.displayName);
            }
          )} />
        }
      )} />
    </div>
  )
}

export default RandomCrosswordHandler;
