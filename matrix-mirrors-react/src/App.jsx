import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuoteForm from './components/QuoteForm';
import QuoteSummary from './components/QuoteSummary';
import { QuoteProvider } from './context/QuoteContext';
import './App.css';

function App() {
  return (
    <QuoteProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Matrix Mirrors Quote Generator</h1>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<QuoteForm />} />
              <Route path="/summary" element={<QuoteSummary />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QuoteProvider>
  );
}

export default App;
