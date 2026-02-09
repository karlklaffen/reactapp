import {type JSX} from "react"

export type SelectionOption<T> = {
    displayName: string;
    data: T;
}

export class SelectionGroup<T> {
    name: string;
    type: string;
    options: Array<SelectionOption<T>>
    defaultCheckedIndices: Set<number>;
    callbackFunc: (checkedOption: SelectionOption<T>, checked: boolean) => void;
    addJSXFunc: (checkedOption: SelectionOption<T>) => JSX.Element;

    constructor(name: string, type: string, options: Array<SelectionOption<T>>, defaultCheckedIndices: Set<number>, callbackFunc: (checkedOption: SelectionOption<T>, checked: boolean) => void, addJSXFunc: (checkedOption: SelectionOption<T>) => JSX.Element = (_: SelectionOption<T>) => {return <></>}) {
        this.name = name;
        this.type = type;
        this.options = options;
        this.defaultCheckedIndices = defaultCheckedIndices;
        this.callbackFunc = callbackFunc;
        this.addJSXFunc = addJSXFunc;
    }

    getCheckedIndices(): Set<number> {
        let indices: Set<number> = new Set();
        const allElems: NodeListOf<HTMLInputElement> = document.getElementsByName(this.name) as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < allElems.length; i++) {
            if (allElems[i].checked)
                indices.add(i);
        }

        return indices;
    }

    getIndexOfOption(displayName: string): number {
        for (let i = 0; i < this.options.length; i++)
            if (this.options[i].displayName === displayName)
                return i;

        return -1;
    }
}