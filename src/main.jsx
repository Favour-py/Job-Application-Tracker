import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
        <ThemeProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
