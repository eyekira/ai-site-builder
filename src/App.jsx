import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="app">
      <header className="header">
        <h1>AI Site Builder</h1>
        <p>Build websites with the power of AI</p>
      </header>
      
      <main className="main">
        <div className="builder-section">
          <h2>Describe Your Website</h2>
          <textarea
            className="prompt-input"
            placeholder="Describe the website you want to build... e.g., 'A modern portfolio website with a dark theme, showcasing my photography work'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button className="generate-btn" disabled={!prompt.trim()}>
            Generate Website
          </button>
        </div>

        <div className="preview-section">
          <h2>Preview</h2>
          <div className="preview-placeholder">
            <p>Your generated website will appear here</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>AI Site Builder - Create stunning websites effortlessly</p>
      </footer>
    </div>
  )
}

export default App
