import {type JSX, useState} from "react"

import { SelectionGroup, type SelectionOption } from "./SmartSelectionUtils"

import { getElementsFromIndices } from "./Utils";

function SmartSelection<T>({initialGroup}: {initialGroup: SelectionGroup<T>}): Array<JSX.Element> {
    const [checkedIndices, setCheckedIndices] = useState<Set<number>>(initialGroup.defaultCheckedIndices);

    let jsxArray: Array<JSX.Element> = [];

    for (let i = 0; i < initialGroup.options.length; i++) {
        const option: SelectionOption<T> = initialGroup.options[i];
        
        jsxArray.push(<div key={option.displayName}>
                {/* <input type={initialGroup.type} name={initialGroup.name} id={id} value={option.value} onClick={(e: any) => {
                    setCheckedIndices(initialGroup.getCheckedIndices());
                }}/>
                <label htmlFor={id}>{option.displayName}</label> */}
                
                <label>
                    <input type={initialGroup.type} name={initialGroup.name} defaultChecked={initialGroup.defaultCheckedIndices.has(i)} onClick={(e: any) => {
                        setCheckedIndices(initialGroup.getCheckedIndices());
                    }} />
                    {option.displayName}
                </label>
            </div>);
    }

    for (const checkedIndex of checkedIndices)
        jsxArray.push(
        <div key={checkedIndex}>
            {initialGroup.addJSXFunc(initialGroup.options[checkedIndex])}
        </div>);
    

    return jsxArray;
}

export default SmartSelection;