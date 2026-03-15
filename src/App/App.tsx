import './App.css'

import RandomCrosswordFromFile from '../RandomCrossword/RandomCrosswordFromFile';

function App() {

  return <div>
    <RandomCrosswordFromFile fileName="wikis.txt" />
  </div>
}

export default App;
