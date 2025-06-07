import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { waitForHealth } from './services/api'

(async () => {
  try {
    await waitForHealth()
  } catch (err) {
    console.error(err)
  }
  createRoot(document.getElementById('root')!).render(<App />)
})()
