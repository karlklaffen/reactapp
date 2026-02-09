import {type JSX, useState, useEffect} from "react"

import { SelectionGroup, type SelectionOption } from "./SmartSelectionUtils"

function SmartSelection<T>({initialGroup}: {initialGroup: SelectionGroup<T>}): JSX.Element {
    const [checkedIndices, setCheckedIndices] = useState<Set<number>>(initialGroup.defaultCheckedIndices);


    useEffect(() => {
        for (const checkedIndex of initialGroup.defaultCheckedIndices)
            initialGroup.callbackFunc(initialGroup.options[checkedIndex], true);
    }, []);

    let jsxArray: Array<JSX.Element> = [];

    for (let i = 0; i < initialGroup.options.length; i++) {
        const option: SelectionOption<T> = initialGroup.options[i];
        
        jsxArray.push(<div key={option.displayName}>            
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
        jsxArray.push(
        <div key={checkedIndex}>
            {initialGroup.addJSXFunc(initialGroup.options[checkedIndex])}
        </div>);
    

    return <div>
        {initialGroup.name}
        {jsxArray}
    </div>;
}

export default SmartSelection;