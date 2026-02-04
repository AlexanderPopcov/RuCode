import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

function Dashboard({ theme, toggleTheme }) {
  const [units, setUnits] = useState([])
  const [completedUnits, setCompletedUnits] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Не забудь вернуть свой IP, если тестируешь с телефона!
    fetch('http://127.0.0.1:8000/api/units')
      .then(res => res.json())
      .then(data => setUnits(data))
    const saved = JSON.parse(localStorage.getItem('rucode_progress') || '[]')
    setCompletedUnits(saved)
  }, [])

  const isUnlocked = (index) => index === 0 || completedUnits.includes(index) || completedUnits.includes(units[index-1]?.id)

  // --- 🐍 НОВАЯ МАТЕМАТИКА ПУТИ ---
  const getPosition = (index) => {
    const startY = 80;        // Отступ сверху
    const stepY = 140;        // Расстояние между кнопками по высоте
    const amplitude = 20;     // Размах виляния (20% от ширины экрана)
    
    // Формула змейки: i * Pi / 2 обеспечивает шаг "Центр -> Право -> Центр -> Лево"
    const x = 50 + Math.sin(index * Math.PI / 2) * amplitude; 
    const y = startY + index * stepY;
    
    return { x, y };
  }

  const renderPath = () => {
    if (units.length === 0) return null;
    
    let pathString = "";
    
    units.forEach((_, i) => {
      const pos = getPosition(i);
      
      if (i === 0) {
        pathString += `M ${pos.x} ${pos.y}`; // Начальная точка
      } else {
        const prevPos = getPosition(i - 1);
        
        // Контрольные точки для плавной кривой Безье
        const cp1x = prevPos.x;
        const cp1y = prevPos.y + 70; // Тянем вниз от предыдущей
        
        const cp2x = pos.x;
        const cp2y = pos.y - 70;     // Тянем вверх от текущей
        
        pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
      }
    });

    // Высота SVG контейнера
    const totalHeight = units.length * 140 + 200;

    return (
      <svg 
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible" 
        style={{ height: totalHeight }}
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
      >
        {/* Слой 1: Граница дороги (Темная) */}
        <path 
            d={pathString} 
            stroke={theme === 'dark' ? '#1f2937' : '#d1d5db'} // gray-800 / gray-300
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
        />
        
        {/* Слой 2: Асфальт (Светлая серединка) */}
        <path 
            d={pathString} 
            stroke={theme === 'dark' ? '#374151' : '#f3f4f6'} // gray-700 / gray-100
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
            strokeDasharray="6 6" // Пунктир
        />
      </svg>
    )
  }
  // --------------------------------

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.4 } }
  }

  return (
    <div className="min-h-screen font-sans flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      
      <Sidebar theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col items-center w-full md:pl-64 relative">
        
        {/* Моб. шапка */}
        <div className="md:hidden w-full p-4 flex justify-between items-center border-b dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30">
            <span className="font-black text-green-600 text-xl tracking-wider">RUCODE</span>
            <button onClick={toggleTheme} className="text-2xl">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>

        {/* КАРТА */}
        <div className="w-full max-w-md relative py-10 flex flex-col items-center">
            
            {/* РИСУЕМ ДОРОГУ */}
            {renderPath()}

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full h-full z-10">
                {units.map((unit, index) => {
                    const unlocked = isUnlocked(index)
                    const completed = completedUnits.includes(unit.id)
                    const pos = getPosition(index); // Получаем координаты для кнопки

                    // Сдвиг кнопки относительно центра (pos.x в процентах, переводим в стиль)
                    const leftPosition = `${pos.x}%`; 

                    return (
                        <motion.div 
                            key={unit.id} 
                            variants={itemVariants} 
                            className="absolute w-24 -ml-12" // -ml-12 чтобы центрировать элемент шириной w-24 (96px)
                            style={{ left: leftPosition, top: pos.y }}
                        >
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => unlocked ? navigate(`/lesson/${unit.id}`) : null}
                                disabled={!unlocked}
                                className={`
                                    w-24 h-24 rounded-full border-b-8 flex items-center justify-center text-4xl shadow-xl transition-all relative
                                    ${completed 
                                        ? 'bg-yellow-400 border-yellow-600' 
                                        : unlocked 
                                            ? (index === 0 ? 'bg-green-500 border-green-700' : 'bg-green-500 border-green-700') 
                                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 grayscale opacity-80'
                                    }
                                `}
                            >
                                <span className="filter drop-shadow-md z-20">
                                    {completed ? '👑' : (unlocked ? '⭐' : '🔒')}
                                </span>

                                {/* Имитация 3D блика на кнопке */}
                                <div className="absolute top-2 right-4 w-4 h-4 bg-white opacity-20 rounded-full"></div>
                                
                                {/* Тултип снизу */}
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-md border dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {unit.title}
                                </div>
                            </motion.button>
                        </motion.div>
                )})}
                {/* Пустой блок внизу, чтобы контент не обрезался */}
                <div style={{ height: units.length * 140 + 200 }}></div>
            </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard