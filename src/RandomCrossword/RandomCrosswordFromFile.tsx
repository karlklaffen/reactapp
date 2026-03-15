import { useEffect, useState, type JSX } from "react";
import { getLinesFromFile } from "../Utils/APIUtils";
import RandomCrossword from "./RandomCrossword";
import { fileLinesToWikiCategories, type WikiType } from "./private/RandomCrosswordUtils";

function RandomCrosswordFromFile({fileName}: {fileName: string}): JSX.Element {

    const [wikiTypes, setWikiTypes] = useState<Array<WikiType>>([]);

    useEffect(() => {
        let thisFunc = async () => {
            setWikiTypes(fileLinesToWikiCategories(await getLinesFromFile(fileName)));
        }

        thisFunc();
    }, []);

    return wikiTypes.length == 0 ? <div>Loading . . .</div> :
    <RandomCrossword wikiTypes={wikiTypes} minNumAnswers={10} maxNumAnswers={15} />;
}

export default RandomCrosswordFromFile;