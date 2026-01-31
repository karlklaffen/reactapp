import {type JSX, useState} from "react"
import type { WikiTypeData } from "./RandomCrosswordUtils";

import WikiSelectionRadios from "./WikiSelectionRadios";
import WikiCategoryRadios from "./WikiCategoryRadios";
import { getWithDefault } from "../Utils/Utils";

function RandomCrosswordSelector({wikiSelectionGroupName, categorySelectionGroupName, wikiTypeData, minNumAnswers, maxNumAnswers, callbackFunc}: {wikiSelectionGroupName: string, categorySelectionGroupName: string, wikiTypeData: Map<string, WikiTypeData>, minNumAnswers: number, maxNumAnswers: number, callbackFunc: (wikiName: string, categoryName: string, numAnswers: number) => void}): JSX.Element {

    const [selectedWikiName, setSelectedWikiName] = useState<string>(wikiTypeData.keys().next().value!);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>(wikiTypeData.get(selectedWikiName)?.categoryNames[0]!);

    const [numAnswers, setNumAnswers] = useState<number>((minNumAnswers + maxNumAnswers) / 2);

    let categoryNames: Array<string> | null = getWithDefault(wikiTypeData.get(selectedWikiName)?.categoryNames, null);

    return (
        <div>
            <button onClick={() => {
                callbackFunc(selectedWikiName, selectedCategoryName, numAnswers);
            }}>
                Generate New Crossword
            </button>
            <div>
                <label htmlFor="custom-num-answers-field">Number of Answers: </label>
                <input type="range" id="custom-num-answers-field" min="3" max="15" onChange={(e: any) => {
                    setNumAnswers(e.target.value);
                }}/>
                <label htmlFor="custom-num-answers-field" id="custom-num-answers-display">{numAnswers}</label>
            </div>
            
            <div>
                <div>
                Wiki:
                <WikiSelectionRadios wikiNames={Array.from(wikiTypeData.keys())} groupName={wikiSelectionGroupName} onClick={(e: any) => {
                    setSelectedWikiName(e.target.value);

                    // set default category back to "All"
                    setSelectedCategoryName(wikiTypeData.get(e.target.value)?.categoryNames[0]!)
                    let catAllBt = document.getElementById("catallbt");

                    if (catAllBt != undefined)
                        (catAllBt as HTMLInputElement).checked = true;
                }}/>
                </div>
                <div>
                Category:
                <WikiCategoryRadios wikiCategories={categoryNames} groupName={categorySelectionGroupName} onClick={(e: any) => {
                    setSelectedCategoryName(e.target.value);
                }}/>
                </div>
            </div>
        </div>
    )
}

export default RandomCrosswordSelector