import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import LessonPage from './LessonPage'

function App() {
  // Логика Темы: читаем из настроек браузера или ставим темную по умолчанию
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/lesson/:unitId" element={<LessonPage />} />
      </Routes>
    </div>
  )
}

export default App