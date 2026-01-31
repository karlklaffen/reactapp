import {type JSX} from "react"

function WikiCategoryRadios({wikiCategories, groupName, onClick}: {wikiCategories: Array<string> | null, groupName: string, onClick: (e: any) => void}): Array<JSX.Element> {
    let categories: Array<JSX.Element> = [
            <div key="All">
                <input type="radio" name={groupName} id="catallbt" value="All" onClick={onClick} defaultChecked/>
                <label htmlFor="catallbt">All</label>
            </div>
        ];
    
        if (wikiCategories == null) {
            categories.push(
            <div key="Loading">
                Loading Additional Categories...
            </div>)

            return categories;
        }

        for (const categoryName of wikiCategories) {
            let id: string = `radio-${categoryName}`;
            categories.push(
                <div key={categoryName}>
                    <input type="radio" name={groupName} id={id} value={categoryName} onClick={onClick}/>
                    <label htmlFor={id}>{categoryName}</label>
                </div>
            )
        }
    
        return categories;
}

export default WikiCategoryRadios;