import { useEffect, useState, type JSX } from 'react'
import {areLetters, getCheckedRadio, getWithDefault} from "../Utils/Utils"
import {WordInfo, WordHead, CellPos, WordLoc, WordCollection} from "../Crossword/private/CrosswordUtils"
import {getJsonFromAPI, setJsonFromAPI, getLinesFromFile} from "../Utils/APIUtils"
import { generateCrossword } from './private/CrosswordGeneration'
import {type WikiType, type WikiTypeData} from "./private/RandomCrosswordUtils"

import {generateRandomWordHeads} from "./private/GenerateRandomWordHeads"

import SmartSelection from '../Utils/SmartInputs/SmartSelection'
import { SmartSelectionGroup, SmartSelectionProxy, SmartSelectionTypes, type SmartSelectionOption } from '../Utils/SmartInputs/SmartSelectionUtils'
import Crossword from '../Crossword/Crossword'

function RandomCrosswordHandler({wikiTypes, minNumAnswers, maxNumAnswers}: {wikiTypes: Array<WikiType>, minNumAnswers: number, maxNumAnswers: number}): JSX.Element {
  
  const [selectedWikiUrl, setSelectedWikiUrl] = useState<string>("");
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<Array<string>>([]);
  const [numAnswers, setNumAnswers] = useState<number>(Math.floor((minNumAnswers + maxNumAnswers) / 2));
  const [generatingCrossword, setGeneratingCrossword] = useState<boolean>(false);

  const [wordHeads, setWordHeads] = useState<Array<WordHead>>([]);

  if (wikiTypes.length == 0)
    return <div>No Wikis to generate crossword</div>;


  let crosswordJSX = wordHeads.length === 0 ? <div>No Crossword</div> :
    <Crossword wordHeads={wordHeads} />

  return (
    <div>
      {crosswordJSX}
      <input type="button" value="Generate Crossword" disabled={generatingCrossword} onClick={async () => {
        setGeneratingCrossword(true);
        setWordHeads(await generateRandomWordHeads(selectedWikiUrl, selectedCategoryNames, numAnswers));
        setGeneratingCrossword(false);
      }}/>
      <p></p>
      Number of Answers:
      <br></br>
      <label>
        <input type="range" defaultValue={numAnswers} min={minNumAnswers} max={maxNumAnswers} onChange={(e: any) => {
          setNumAnswers(e.target.value);
        }} />
        {numAnswers}
      </label>

      <SmartSelection<WikiTypeData> group={new SmartSelectionGroup('Wikis:', 'wikis', SmartSelectionTypes.RADIO,

        wikiTypes.map((type: WikiType) => {
          return {id: type.displayName, displayName: type.displayName, data: {url: type.url, categoryNames: type.categoryNames}};
        }),

        new Set([0]),

        (selectedOption: SmartSelectionOption<WikiTypeData>) => {
          setSelectedWikiUrl(selectedOption.data.url);
        },
        
        (selectedOption: SmartSelectionOption<WikiTypeData>) => {

          return <SmartSelection<null> group={new SmartSelectionGroup<null>('Categories:', `${selectedOption.displayName}`, SmartSelectionTypes.CHECKBOX,
            
            selectedOption.data.categoryNames.map((catName: string) => {

              return {id: catName, displayName: catName, data: null};
            }),

            new Set([0]),

            (changedOption: SmartSelectionOption<null>, selected: boolean, proxy: SmartSelectionProxy<null>) => {

              if (changedOption.id === 'All') {

                if (selected) {
                  proxy.setAllSelected();
                  proxy.setDisabledExceptByIDs(['All']);
                  setSelectedCategoryNames(['All']);
                }
                else {
                  proxy.setAllEnabled();
                  proxy.setAllUnselected();
                  setSelectedCategoryNames([]);
                }

                return;
              }

              setSelectedCategoryNames(proxy.getOptionIDs(proxy.getSelectedOptions()));
            }
          )} />
        }
      )} />
    </div>
  )
}

export default RandomCrosswordHandler;
