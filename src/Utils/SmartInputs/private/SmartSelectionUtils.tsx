import {type JSX} from "react"
import { allInArray, arraysContainSameElems, arrayElementsUnique } from "../../Utils";

export type SmartSelectionOption<T> = {
    
    id: string;
    displayName: string;
    data: T;
}

export type SmartSelectionType = {
    type: string;
}

export class SmartSelectionTypes {
    static RADIO = {type: "radio"};
    static CHECKBOX = {type: "checkbox"};
}

export class SmartSelectionGroup<T> {
    name: string;
    id: string;
    type: SmartSelectionType;
    options: Array<SmartSelectionOption<T>>;
    defaultSelectedIndices: Set<number>;
    callbackFunc: (changedOption: SmartSelectionOption<T>, changeSelected: boolean, proxy: SmartSelectionProxy<T>) => void;
    addJSXFunc: (selectedOption: SmartSelectionOption<T>) => JSX.Element;

    proxy: SmartSelectionProxy<T>;

    constructor(name: string, id: string, type: SmartSelectionType, options: Array<SmartSelectionOption<T>>, defaultSelectedIndices: Set<number>, callbackFunc: (changedOption: SmartSelectionOption<T>, selected: boolean, proxy: SmartSelectionProxy<T>) => void, addJSXFunc: (selectedOption: SmartSelectionOption<T>) => JSX.Element = (_: SmartSelectionOption<T>) => {return <></>}) {
        
        this.verifyOptionIDsUnique(options);

        this.name = name;
        this.id = id;
        this.type = type;
        this.options = options;
        this.defaultSelectedIndices = defaultSelectedIndices;
        this.callbackFunc = callbackFunc;
        this.addJSXFunc = addJSXFunc;

        this.proxy = new SmartSelectionProxy<T>(this);
    }

    verifyOptionIDsUnique(options: Array<SmartSelectionOption<T>>): void {
        if (!arrayElementsUnique(options.map((option: SmartSelectionOption<T>) => option.id)))
            throw Error('Option IDs not unique');
    }

    getDefaultSelectedIndices(): Set<number> {
        return this.defaultSelectedIndices;
    }

    getSelectedIndices(): Set<number> {
        let indices: Set<number> = new Set();
        const allElems: Array<HTMLInputElement> = this.getAllHTMLOptions();
        for (let i = 0; i < allElems.length; i++) {
            if (allElems[i].checked)
                indices.add(i);
        }

        return indices;
    }

    getSelectedOptions(selected: boolean): Array<SmartSelectionOption<T>> {
        let selectedOptions: Array<SmartSelectionOption<T>> = [];
        const allElems: Array<HTMLInputElement> = this.getAllHTMLOptions();
        for (let i = 0; i < allElems.length; i++) {
            if (selected === allElems[i].checked)
                selectedOptions.push(this.options[i]);
        }

        return selectedOptions;
    }

    getIndexOfOptionByID(optionID: string): number {
        for (let i = 0; i < this.options.length; i++)
            if (this.options[i].id === optionID)
                return i;

        return -1;
    }

    executeCallback(newlyChangedOptionIndex: number): void {
        const allOptions: Array<HTMLInputElement> = this.getAllHTMLOptions();

        this.callbackFunc(this.options[newlyChangedOptionIndex], allOptions[newlyChangedOptionIndex].checked, this.proxy);
    }

    getUniqueName(): string {
        return `${this.name}${this.id}`;
    }

    getAllHTMLOptions(): Array<HTMLInputElement> {
        let options = Array.from(document.getElementsByName(this.getUniqueName()) as NodeListOf<HTMLInputElement>);
        return options;
    }

    getHTMLInputByOption(option: SmartSelectionOption<T>): HTMLInputElement {
        return this.getAllHTMLOptions()[this.options.indexOf(option)];
    }

    getHTMLInputsByOptions(theseOptions: Array<SmartSelectionOption<T>>): Array<HTMLInputElement> {
        let allHTMLOptions: Array<HTMLInputElement> = this.getAllHTMLOptions();

        return theseOptions.map((thisOption: SmartSelectionOption<T>) => allHTMLOptions[this.options.indexOf(thisOption)]);
    }

    getOptionsFromIDs(ids: Array<string>): Array<SmartSelectionOption<T>> {
        let retOptions: Array<SmartSelectionOption<T>> = [];

        for (const id of ids) {
            let thisOption: SmartSelectionOption<T> | undefined = this.options.find((val: SmartSelectionOption<T>) => val.id === id);

            if (thisOption === undefined)
                throw Error('id not found');

            retOptions.push(thisOption);
        }

        return retOptions;
    }

    setOptionsSelected(options: Array<SmartSelectionOption<T>>, selected: boolean, doCallback: boolean): void {
        let inputs: Array<HTMLInputElement> = this.getHTMLInputsByOptions(options);

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = selected;

            if (doCallback)
                this.executeCallback(i);
        }
    }

    setOptionsEnabled(options: Array<SmartSelectionOption<T>>, enabled: boolean): void {
        let inputs: Array<HTMLInputElement> = this.getHTMLInputsByOptions(options);

        for (let i = 0; i < inputs.length; i++)
            inputs[i].disabled = !enabled;
    }

    generateJSX(selectedIndices: Set<number>, setSelectedIndices: (newSelectedIndices: Set<number>) => void): JSX.Element {
        let optionArray: Array<JSX.Element> = [];

        for (let i = 0; i < this.options.length; i++) {
            const option: SmartSelectionOption<T> = this.options[i];
            
            optionArray.push(<div key={option.displayName}>            
                    <label>
                        <input type={this.type.type} name={this.getUniqueName()} defaultChecked={this.defaultSelectedIndices.has(i)} onChange={(_: any) => {
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

export class SmartSelectionProxy<T> {
    group: SmartSelectionGroup<T>

    constructor(group: SmartSelectionGroup<T>) {
        this.group = group;
    }

    getAllOptions(): Array<SmartSelectionOption<T>> {
        return this.group.options;
    }

    getAllOptionsExcept(excludeIDs: Array<string>): Array<SmartSelectionOption<T>> {
        return this.group.options.filter((option: SmartSelectionOption<T>) => !excludeIDs.includes(option.id));
    }

    getOptionIDs(options: Array<SmartSelectionOption<T>>): Array<string> {
        return options.map((val: SmartSelectionOption<T>) => val.id);
    }

    getSelectedOptions(): Array<SmartSelectionOption<T>> {
        return this.group.getSelectedOptions(true);
    }

    getUnselectedOptions(): Array<SmartSelectionOption<T>> {
        return this.group.getSelectedOptions(false);
    }

    setSelected(option: SmartSelectionOption<T>, selected: boolean): void {
        this.group.setOptionsSelected([option], selected, false);
    }

    setUnselected(option: SmartSelectionOption<T>): void {
        this.setSelected(option, false);
    }

    setSelectedByIDs(ids: Array<string>, select: boolean): void {
        this.group.setOptionsSelected(this.group.getOptionsFromIDs(ids), select, false);
    }

    setUnselectedByIDs(ids: Array<string>): void {
        this.setSelectedByIDs(ids, false);
    }

    setSelectedExceptByIDs(optionIDs: Array<string>, select: boolean): void {
        for (const option of this.group.options) {
            if (!optionIDs.includes(option.id)) {
                this.setSelected(option, select);
            }
        }
    }

    setUnselectedExceptByIDs(optionIDs: Array<string>): void {
        this.setSelectedExceptByIDs(optionIDs, false);
    }

    setOnlySelectedByIDs(optionIDs: Array<string>, select: boolean): void {
        for (const option of this.group.options) {
            this.setSelected(option, select === optionIDs.includes(option.id));
        }
    }

    setOnlyUnselectedByIDs(optionIDs: Array<string>): void {
        this.setOnlySelectedByIDs(optionIDs, false);
    }

    setAllSelected(): void {
        this.group.setOptionsSelected(this.getAllOptions(), true, false);
    }

    setAllUnselected(): void {
        this.group.setOptionsSelected(this.getAllOptions(), false, false);
    }

    optionsSelectedByIDs(optionIDs: Array<string>, selected: boolean): boolean {
        const allSelected: Array<SmartSelectionOption<T>> = this.group.getSelectedOptions(selected);

        return allInArray(this.getOptionIDs(allSelected), optionIDs);
    }

    optionsUnselectedByIDs(ids: Array<string>): boolean {
        return this.optionsSelectedByIDs(ids, false);
    }

    onlyOptionsSelectedByIDs(optionIDs: Array<string>, selected: boolean): boolean {
        const allSelected: Array<SmartSelectionOption<T>> = this.group.getSelectedOptions(selected);

        return arraysContainSameElems(this.getOptionIDs(allSelected), optionIDs);
    }

    onlyOptionsUnselectedByIDs(optionIDs: Array<string>): boolean {
        return this.onlyOptionsSelectedByIDs(optionIDs, false);
    }

    setEnabled(option: SmartSelectionOption<T>, enable: boolean): void {
        this.group.getHTMLInputByOption(option).disabled = !enable;
    }

    setDisabled(option: SmartSelectionOption<T>): void {
        this.setEnabled(option, false);
    }

    setEnabledByIDs(ids: Array<string>, enable: boolean = true): void {
        this.group.setOptionsEnabled(this.group.getOptionsFromIDs(ids), enable);
    }

    setDisabledByIDs(ids: Array<string>): void {
        this.setEnabledByIDs(ids, false);
    }

    setEnabledExceptByIDs(ids: Array<string>, enabled: boolean = true): void {
        for (const option of this.group.options)
            if (!ids.includes(option.id))
                this.setEnabled(option, enabled);
    }

    setDisabledExceptByIDs(ids: Array<string>): void {
        this.setEnabledExceptByIDs(ids, false);
    }

    setOnlyEnabledByIDs(ids: Array<string>, enable: boolean = true): void {
        for (const option of this.group.options)
            this.setEnabled(option, enable === ids.includes(option.id));
    }

    setOnlyDisabledByIDs(ids: Array<string>): void {
        this.setOnlyEnabledByIDs(ids, false);
    }

    setAllEnabled(): void {
        this.group.setOptionsEnabled(this.group.options, true);
    }

    setAllDisabled(): void {
        this.group.setOptionsEnabled(this.group.options, false);
    }
}