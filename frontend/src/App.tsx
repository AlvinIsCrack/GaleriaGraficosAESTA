import "./App.css";
import Dashboard from "./components/Dashboard";
import Header from './components/Header'

function App() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <Dashboard />
    </div>
  )
}

export default App
