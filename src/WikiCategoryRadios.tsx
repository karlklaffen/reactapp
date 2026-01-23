import {type JSX} from "react"

function WikiCategoryRadios({wikiCategories}: {wikiCategories: Array<string> | null}): Array<JSX.Element> {
    let categories: Array<JSX.Element> = [
            <div key="">
                <input type="radio" name="category" id="catallbt" value="" defaultChecked/>
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
                    <input type="radio" name="category" id={id} value={categoryName}/>
                    <label htmlFor={id}>{categoryName}</label>
                </div>
            )
        }
    
        return categories;
}

export default WikiCategoryRadios;