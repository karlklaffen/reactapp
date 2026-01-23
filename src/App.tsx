import { useEffect, useState, type JSX } from 'react'
import {getLinesFromFile} from "./APIUtils"
import {WordHead, CellPos} from "./CrosswordUtils"
import {fileLinesToWikiCategories, WikiTypeData} from "./RandomCrosswordUtils"
import './App.css'

import RandomCrosswordLauncher from './RandomCrosswordLauncher'

function App() {

  return <div>
    <RandomCrosswordLauncher fileName="wikis.txt" />
  </div>
}

export default App;
