import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "../Utils/Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "../Crossword/private/CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "../Utils/APIUtils"
import { generateCrossword } from './private/CrosswordGeneration'
import {type WikiType, type WikiTypeData} from "./private/RandomCrosswordUtils"

import {generateRandomWordHeads} from "./private/GenerateRandomWordHeads"

import SmartSelection from '../Utils/SmartSelection'
import { SelectionGroup, SelectionGroupProxy, type SelectionOption } from '../Utils/SmartSelectionUtils'
import Crossword from '../Crossword/Crossword'

function RandomCrosswordHandler({wikiTypes, minNumAnswers, maxNumAnswers}: {wikiTypes: Array<WikiType>, minNumAnswers: number, maxNumAnswers: number}): JSX.Element {
  
  const [selectedWikiUrl, setSelectedWikiUrl] = useState<string>("");
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<Array<string>>([]);
  const [numAnswers, setNumAnswers] = useState<number>((minNumAnswers + maxNumAnswers) / 2);
  const [generatingCrossword, setGeneratingCrossword] = useState<boolean>(false);
  const [hasCrossword, setHasCrossword] = useState<boolean>(false);

  const [wordHeads, setWordHeads] = useState<Array<WordHead>>([]);

  console.log(selectedCategoryNames);

  if (wikiTypes.length == 0)
    return <div>No Wikis to generate crossword</div>;


  let crosswordJSX = wordHeads.length === 0 ? <div>No Crossword</div> :
    <Crossword wordHeads={wordHeads} />

  return (
    <div>
      {crosswordJSX}
      <input type="button" value="Generate Crossword" disabled={generatingCrossword} onClick={async () => {
        setGeneratingCrossword(true);
        setHasCrossword(true);
        setWordHeads(await generateRandomWordHeads(selectedWikiUrl, selectedCategoryNames, numAnswers));
        setGeneratingCrossword(false);
      }}/>

      <SmartSelection<WikiTypeData> initialGroup={new SelectionGroup('Wikis:', 'wikis', 'radio',

        wikiTypes.map((type: WikiType) => {
          return {displayName: type.displayName, data: {url: type.url, categoryNames: type.categoryNames}};
        }),

        new Set([0]),

        (_: SelectionGroupProxy<WikiTypeData>, selectedOption: SelectionOption<WikiTypeData>) => {
          setSelectedWikiUrl(selectedOption.data.url);
        },
        
        (selectedOption: SelectionOption<WikiTypeData>) => {

          return <SmartSelection<null> initialGroup={new SelectionGroup<null>('Categories:', `${selectedOption.displayName}`, 'checkbox',
            
            selectedOption.data.categoryNames.map((catName: string) => {

              return {displayName: catName, data: null};
            }),

            new Set([0]),

            (proxy: SelectionGroupProxy<null>, changedOption: SelectionOption<null>, selected: boolean) => {
              if (selected) {
                if (changedOption.displayName == 'All') {
                  proxy.setAllOnlySelectedByName(['All'], true);
                  setSelectedCategoryNames(selectedOption.data.categoryNames.filter((val: string) => val !== 'All'));
                  // TODO: Add ability to pass in callback function that can set this state
                  console.log('set all');
                }
                else {
                  proxy.setAllSelectedByName(['All'], false);
                }
              }
              
              if (proxy.optionsSelectedByNames(['All'], true))
                setSelectedCategoryNames(proxy.getOptionDisplayNames(proxy.getAllOptions(['All'])));
              else
                setSelectedCategoryNames(proxy.getOptionDisplayNames(proxy.getSelectedOptions()));
            }
          )} />
        }
      )} />
    </div>
  )
}

export default RandomCrosswordHandler;
