import {type JSX} from "react"
import { allInArray, arraysContainSameElems, getInputLabelText } from "./Utils";

export type SelectionOption<T> = {
    
    displayName: string;
    data: T;
}

export class SelectionGroup<T> {
    name: string;
    id: string;
    type: string;
    options: Array<SelectionOption<T>>;
    defaultSelectedIndices: Set<number>;
    callbackFunc: (proxy: SelectionGroupProxy<T>, changedOption: SelectionOption<T>, changeSelected: boolean) => void;
    addJSXFunc: (selectedOption: SelectionOption<T>) => JSX.Element;

    parallelHTMLOptions: Array<HTMLInputElement>;

    proxy: SelectionGroupProxy<T>;

    constructor(name: string, id: string, type: string, options: Array<SelectionOption<T>>, defaultSelectedIndices: Set<number>, callbackFunc: (proxy: SelectionGroupProxy<T>, changedOption: SelectionOption<T>, selected: boolean) => void, addJSXFunc: (selectedOption: SelectionOption<T>) => JSX.Element = (_: SelectionOption<T>) => {return <></>}) {
        
        this.name = name;
        this.id = id;
        this.type = type;
        this.options = options;
        this.defaultSelectedIndices = defaultSelectedIndices;
        this.callbackFunc = callbackFunc;
        this.addJSXFunc = addJSXFunc;

        this.parallelHTMLOptions = [];

        this.proxy = new SelectionGroupProxy<T>(this);
    }

    getDefaultSelectedIndices(): Set<number> {
        return this.defaultSelectedIndices;
    }

    getSelectedIndices(): Set<number> {
        let indices: Set<number> = new Set();
        const allElems: Array<HTMLInputElement> = this.getHTMLOptions();
        for (let i = 0; i < allElems.length; i++) {
            if (allElems[i].checked)
                indices.add(i);
        }

        return indices;
    }

    getSelectedOptions(selected: boolean): Array<SelectionOption<T>> {
        let selectedOptions: Array<SelectionOption<T>> = [];
        const allElems: Array<HTMLInputElement> = this.getHTMLOptions();
        for (let i = 0; i < allElems.length; i++) {
            if (selected === allElems[i].checked)
                selectedOptions.push(this.options[i]);
        }

        return selectedOptions;
    }

    getIndexOfOptionByName(displayName: string): number {
        for (let i = 0; i < this.options.length; i++)
            if (this.options[i].displayName === displayName)
                return i;

        return -1;
    }

    executeCallback(newlyChangedOptionIndex: number): void {
        const allOptions: Array<HTMLInputElement> = this.getHTMLOptions();

        this.callbackFunc(this.proxy, this.options[newlyChangedOptionIndex], allOptions[newlyChangedOptionIndex].checked);
    }

    getUniqueName(): string {
        return `${this.name}${this.id}`;
    }

    getHTMLOptions(): Array<HTMLInputElement> {
        let options = Array.from(document.getElementsByName(this.getUniqueName()) as NodeListOf<HTMLInputElement>);
        return options;
    }

    getHTMLInputByOption(option: SelectionOption<T>): HTMLInputElement {
        return this.getHTMLOptions()[this.options.indexOf(option)];
    }

    generateJSX(selectedIndices: Set<number>, setSelectedIndices: (newSelectedIndices: Set<number>) => void): JSX.Element {
        let optionArray: Array<JSX.Element> = [];

        for (let i = 0; i < this.options.length; i++) {
            const option: SelectionOption<T> = this.options[i];
            
            optionArray.push(<div key={option.displayName}>            
                    <label>
                        <input type={this.type} name={this.getUniqueName()} defaultChecked={this.defaultSelectedIndices.has(i)} onChange={(e: any) => {
                            setSelectedIndices(this.getSelectedIndices());
                            this.executeCallback(i);
                        }} />
                        {option.displayName}
                    </label>
                </div>);
        }

        for (const selectedIndex of selectedIndices)
            optionArray.push(
            <div key={selectedIndex}>
                {this.addJSXFunc(this.options[selectedIndex])}
            </div>);

        return <div>
            <p></p>
            {this.name}
            {optionArray}
        </div>;
    }
}

export class SelectionGroupProxy<T> {
    group: SelectionGroup<T>

    constructor(group: SelectionGroup<T>) {
        this.group = group;
    }

    getOptionDisplayNames(options: Array<SelectionOption<T>>): Array<string> {
        return options.map((val: SelectionOption<T>) => val.displayName);
    }

    getSelectedOptions(): Array<SelectionOption<T>> {
        return this.group.getSelectedOptions(true);
    }

    getUnselectedOptions(): Array<SelectionOption<T>> {
        return this.group.getSelectedOptions(false);
    }

    setSelected(option: SelectionOption<T>, selected: boolean): void {
        this.group.getHTMLInputByOption(option).checked = selected;
    }

    setAllSelectedByName(displayNames: Array<string>, select: boolean): void {
        for (const option of this.group.options) {
            if (displayNames.includes(option.displayName)) {
                this.setSelected(option, select);
            }
        }
    }

    setAllSelectedExceptByName(displayNames: Array<string>, select: boolean): void {
        for (const option of this.group.options) {
            if (!displayNames.includes(option.displayName)) {
                this.setSelected(option, select);
            }
        }
    }

    setAllOnlySelectedByName(displayNames: Array<string>, select: boolean): void {
        for (const option of this.group.options) {
            this.setSelected(option, select === displayNames.includes(option.displayName));
        }
    }

    optionsSelectedByNames(displayNames: Array<string>, selected: boolean): boolean {
        const allSelected: Array<SelectionOption<T>> = this.group.getSelectedOptions(selected);

        return allInArray(this.getOptionDisplayNames(allSelected), displayNames);
    }

    onlyOptionsSelectedByNames(displayNames: Array<string>, selected: boolean): boolean {
        const allSelected: Array<SelectionOption<T>> = this.group.getSelectedOptions(selected);

        return arraysContainSameElems(this.getOptionDisplayNames(allSelected), displayNames);
    }

    getAllOptions(excludeNames: Array<string>): Array<SelectionOption<T>> {
        return this.group.options.filter((option: SelectionOption<T>) => !excludeNames.includes(option.displayName));
    }


}