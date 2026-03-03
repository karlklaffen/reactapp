import {type JSX, useState, useEffect} from "react"

import { SelectionGroup, type SelectionOption } from "./SmartSelectionUtils"

function SmartSelection<T>({initialGroup}: {initialGroup: SelectionGroup<T>}): JSX.Element {
    const [checkedIndices, setCheckedIndices] = useState<Set<number>>(initialGroup.defaultCheckedIndices);


    useEffect(() => {
        for (const checkedIndex of initialGroup.defaultCheckedIndices)
            initialGroup.callbackFunc(initialGroup.options[checkedIndex], true);
    }, []);

    let optionArray: Array<JSX.Element> = [];

    for (let i = 0; i < initialGroup.options.length; i++) {
        const option: SelectionOption<T> = initialGroup.options[i];
        
        optionArray.push(<div key={option.displayName}>            
                <label>
                    <input type={initialGroup.type} name={initialGroup.name} defaultChecked={initialGroup.defaultCheckedIndices.has(i)} onClick={(_: any) => {
                        setCheckedIndices(initialGroup.getCheckedIndices());
                        initialGroup.callbackFunc(option, true);
                    }} />
                    {option.displayName}
                </label>
            </div>);
    }

    for (const checkedIndex of checkedIndices)
        optionArray.push(
        <div key={checkedIndex}>
            {initialGroup.addJSXFunc(initialGroup.options[checkedIndex])}
        </div>);
    

    return <div>
        <p></p>
        {initialGroup.name}
        {optionArray}
    </div>;
}

export default SmartSelection;