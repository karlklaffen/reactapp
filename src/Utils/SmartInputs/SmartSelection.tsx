import {type JSX, useState, useEffect} from "react"

import { SmartSelectionGroup } from "./SmartSelectionUtils"

function SmartSelection<T>({group}: {group: SmartSelectionGroup<T>}): JSX.Element {
    
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(group.getDefaultSelectedIndices());
    
    useEffect(() => {
        for (const selectedIndex of group.getDefaultSelectedIndices())
            group.executeCallback(selectedIndex);
    }, []);

    return group.generateJSX(selectedIndices, setSelectedIndices);
}

export default SmartSelection;