import { useEffect, useState, type JSX } from "react";
import { getLinesFromFile } from "../Utils/APIUtils";
import RandomCrossword from "./RandomCrossword";
import { type RandomCrosswordConfigSpec, configSpecsFromFileLines, type WikiType } from "./private/RandomCrosswordUtils";

function RandomCrosswordFromFile({fileName}: {fileName: string}): JSX.Element {

    const [configSpecs, setConfigSpecs] = useState<RandomCrosswordConfigSpec | null>(null);

    useEffect(() => {
        let thisFunc = async () => {
            setConfigSpecs(configSpecsFromFileLines(await getLinesFromFile(fileName)));
        }

        thisFunc();
    }, []);

    return configSpecs === null ? <div>Loading . . .</div> :
    <RandomCrossword wikiTypes={configSpecs.wikiTypes} minNumAnswers={configSpecs.minNumAnswers} maxNumAnswers={configSpecs.maxNumAnswers} />;
}

export default RandomCrosswordFromFile;