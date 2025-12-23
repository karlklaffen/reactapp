import { useEffect, useState, type JSX } from 'react'
import {setJsonFromAPI} from "./Utils"
import {WordHead, CellPos} from "./CrosswordUtils"
import './App.css'

import Crossword from "./Crossword"
import RandomCrossword from './RandomCrossword'

function App() {
  
  return (
    <div>
      <RandomCrossword />
    </div>
  )
}

export default App;
