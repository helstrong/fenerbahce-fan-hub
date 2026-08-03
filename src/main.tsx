import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { DataProvider } from './data/DataContext'
import { SeasonProvider } from './data/SeasonContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <DataProvider>
          <SeasonProvider>
            <App />
          </SeasonProvider>
        </DataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
