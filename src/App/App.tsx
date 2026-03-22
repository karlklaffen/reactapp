import './App.css'

import RandomCrosswordFromFile from '../RandomCrossword/RandomCrosswordFromFile';

function App() {

  return <div>
    <RandomCrosswordFromFile fileName="config.txt" />
  </div>
}

export default App;
