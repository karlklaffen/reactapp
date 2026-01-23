import { type JSX, useState, useEffect } from "react";
import {getJsonFromAPI, getLinesFromFile} from "./APIUtils"
import {WikiInfo} from "./RandomCrosswordUtils"

function WikiSelectionRadios({wikiNames, groupName, onClick}: {wikiNames: Array<string>, groupName: string, onClick: (e: any) => void}): Array<JSX.Element> {

    let choices: Array<JSX.Element> = [];

    let firstElem: boolean = true;

    for (const wikiName of wikiNames) {
        let id: string = `radio-${wikiName}`;
        choices.push(
            <div key={wikiName}>
                <input type="radio" name={groupName} id={id} value={wikiName} defaultChecked={firstElem} onClick={onClick}/>
                <label htmlFor={id}>{wikiName}</label>
            </div>
        )
        firstElem = false;
    }

    return choices;

}

export default WikiSelectionRadios;