import {type JSX, useState, useEffect} from "react"

import { SelectionGroup, type SelectionOption } from "./SmartSelectionUtils"

function SmartSelection<T>({initialGroup}: {initialGroup: SelectionGroup<T>}): JSX.Element {
    
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(initialGroup.getDefaultSelectedIndices());

    
    useEffect(() => {
        for (const selectedIndex of initialGroup.getDefaultSelectedIndices())
            initialGroup.executeCallback(selectedIndex);
    }, []);

    return initialGroup.generateJSX(selectedIndices, setSelectedIndices);
}

export default SmartSelection;