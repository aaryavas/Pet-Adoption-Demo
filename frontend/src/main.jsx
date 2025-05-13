// This file is the entry point for the React application.
// It imports the necessary modules and renders the main App component into the root element of the HTML document.
// It uses React's StrictMode to help identify potential problems in the application.
// It also imports the main CSS file for styling the application.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)