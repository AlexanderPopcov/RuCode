import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function LessonPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  
  const [lessons, setLessons] = useState([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [result, setResult] = useState(null)
  const [hearts, setHearts] = useState(3)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/lessons/${unitId}`)
      .then(res => res.json())
      .then(data => setLessons(data))
  }, [unitId])

  const handleCompleteUnit = () => {
    const saved = JSON.parse(localStorage.getItem('rucode_progress') || '[]')
    const newProgress = saved.includes(Number(unitId)) ? saved : [...saved, Number(unitId)]
    localStorage.setItem('rucode_progress', JSON.stringify(newProgress))
    navigate('/')
  }

  const handleCheck = (option) => {
    if (selectedOption || isGameOver) return
    setSelectedOption(option)
    const currentLesson = lessons[currentLessonIndex]

    if (option === currentLesson.correct_answer) {
      setResult('correct')
    } else {
      setResult('wrong')
      setHearts(prev => {
        const newHearts = prev - 1
        if (newHearts <= 0) setTimeout(() => setIsGameOver(true), 1500)
        return newHearts
      })
    }
  }

  const nextLesson = () => {
    setSelectedOption(null)
    setResult(null)
    setCurrentLessonIndex(prev => prev + 1)
  }

  if (lessons.length === 0) return <div className="text-center mt-20 text-gray-500 font-bold animate-pulse">Загружаем магию...</div>

  // ЭКРАН ПОБЕДЫ
  if (currentLessonIndex >= lessons.length) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 dark:bg-gray-900 overflow-hidden">
            <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} 
                className="text-8xl mb-6 filter drop-shadow-2xl">🏆</motion.div>
            <motion.h1 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black mb-4 text-yellow-600">Модуль пройден!</motion.h1>
            <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleCompleteUnit} 
                className="px-8 py-3 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30">
                На карту
            </motion.button>
        </div>
    )
  }
  
  if (isGameOver) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} // Тряска
                className="text-8xl mb-4">💔</motion.div>
            <h1 className="text-4xl font-black text-red-500 mb-8">Сердца разбиты</h1>
            <button onClick={() => navigate('/')} className="px-8 py-4 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition">Выйти</button>
        </div>
    )
  }

  const lesson = lessons[currentLessonIndex]

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto font-sans bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Прогресс бар */}
      <div className="flex justify-between items-center p-4 pt-6">
        <button onClick={() => navigate('/')} className="text-gray-300 hover:text-gray-500 text-2xl font-bold transition-colors">✕</button>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mx-4 relative overflow-hidden">
            <motion.div 
                className="bg-green-500 h-4 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentLessonIndex)/lessons.length)*100}%` }}
                transition={{ duration: 0.5 }}
            ></motion.div>
        </div>
        <div className="text-red-500 font-black text-lg flex items-center gap-1">
            <motion.span key={hearts} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl">❤️</motion.span> 
            {hearts}
        </div>
      </div>

      {/* АНИМИРОВАННАЯ КАРТОЧКА ВОПРОСА */}
      <div className="flex-1 p-4 pb-40 overflow-y-auto custom-scrollbar">
         <AnimatePresence mode='wait'>
            <motion.div
                key={currentLessonIndex} // Ключ меняется -> запускается анимация
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4">{lesson.title}</h2>
                
                <div className="bg-blue-50 dark:bg-gray-800 p-5 rounded-3xl border-2 border-blue-100 dark:border-gray-700 mb-8">
                    <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed text-lg">
                        {lesson.description}
                    </p>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-2 border-l-4 border-gray-300 dark:border-gray-600">{lesson.question}</h3>
                
                <div className="space-y-3">
                    {lesson.options.map((option, idx) => (
                        <motion.button 
                            key={idx} 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCheck(option)} 
                            disabled={selectedOption !== null}
                            className={`w-full p-4 text-left rounded-2xl border-b-4 font-bold text-lg transition-colors
                                ${selectedOption === option 
                                    ? (result === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700')
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'}
                            `}>
                            {option}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
         </AnimatePresence>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <AnimatePresence>
      {result && (
        <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className={`fixed bottom-0 left-0 right-0 p-4 border-t-2 z-50
            ${result === 'correct' 
                ? 'bg-green-100 dark:bg-gray-800 border-green-200 dark:border-green-900' 
                : 'bg-red-100 dark:bg-gray-800 border-red-200 dark:border-red-900'}`}>
             
             <div className="max-w-md mx-auto">
                <div className={`font-bold text-2xl mb-2 flex items-center gap-2 ${result === 'correct' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {result === 'correct' ? '✨ Блестяще!' : '🤔 Ошибка...'}
                </div>
                
                <div className="mb-4 text-gray-700 dark:text-gray-300 text-sm bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                    {lesson.explanation}
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={nextLesson} 
                    className={`w-full py-4 rounded-2xl font-black text-white uppercase shadow-lg tracking-wider
                    ${result === 'correct' ? 'bg-green-500 border-b-4 border-green-700' : 'bg-red-500 border-b-4 border-red-700'}`}>
                    {currentLessonIndex + 1 === lessons.length ? 'Завершить' : 'Дальше'}
                </motion.button>
             </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

export default LessonPage