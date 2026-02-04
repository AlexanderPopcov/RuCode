import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWindowSize } from './hooks/useWindowSize'

// --- ХЕЛПЕР ДЛЯ ГЕНЕРАЦИИ SVG ПУТИ (теперь принимает динамические параметры) ---
const generateSVGPath = (units, containerWidth, hOffset, vSpacing) => {
  if (units.length < 2 || containerWidth <= 0) return "";
  
  const points = units.map((_, index) => {
    const y = index * vSpacing + 56;
    const isEven = index % 2 === 0;
    const x = containerWidth / 2 + (isEven ? -hOffset : hOffset);
    return { x, y };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    pathD += ` C ${p1.x},${p1.y + vSpacing / 2} ${p2.x},${p2.y - vSpacing / 2} ${p2.x},${p2.y}`;
  }
  
  return pathD;
};


function Dashboard({ theme, toggleTheme }) {
  const [units, setUnits] = useState([])
  const [completedUnits, setCompletedUnits] = useState([])
  const navigate = useNavigate()

  // --- АДАПТИВНОСТЬ ---
  const { width: windowWidth } = useWindowSize();
  const layout = useMemo(() => {
    const isMobile = windowWidth < 500;
    // Ограничиваем ширину контейнера или используем ширину окна
    const cWidth = Math.min(windowWidth, 448) - 32; // Вычитаем паддинги (p-4 -> 2rem)
    const hOffset = isMobile ? cWidth / 3.5 : 120;
    const vSpacing = isMobile ? 140 : 150;
    return {
        containerWidth: cWidth,
        horizontalOffset: hOffset,
        verticalSpacing: vSpacing
    };
  }, [windowWidth]);


  // --- Логика для анимации рисования пути ---
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);

  const pathD = useMemo(() => (
      units.length > 0 && layout.containerWidth > 0 
          ? generateSVGPath(units, layout.containerWidth, layout.horizontalOffset, layout.verticalSpacing) 
          : ""
  ), [units, layout]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathD]);
  
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/units')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setUnits(data))
      .catch(error => console.error("Ошибка при получении данных:", error));
      
    const saved = JSON.parse(localStorage.getItem('rucode_progress') || '[]')
    setCompletedUnits(saved)
  }, [])

  const isUnlocked = (unit, index) => {
    if (index === 0) return true;
    const previousUnit = units[index - 1];
    return !!(previousUnit && completedUnits.includes(previousUnit.id));
  }

  return (
    <div className="min-h-screen font-sans flex flex-col items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <div className="w-full max-w-md p-4 flex justify-between items-center border-b dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20 shadow-sm">
        <div className="font-black text-xl tracking-wider text-green-600 dark:text-green-400">RUCODE 🐍</div>
        <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl hover:scale-110 transition-transform">
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-1 font-bold text-orange-500"><span>🔥</span> <span>0</span></div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto p-4">
        {units.length > 0 ? (
          <div 
            className="relative" 
            style={{ height: `${units.length * layout.verticalSpacing}px` }}
          >
            <svg className="absolute top-0 left-0 w-full h-full z-0" viewBox={`0 0 ${layout.containerWidth} ${units.length * layout.verticalSpacing}`}>
              <motion.path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                initial={{ strokeDashoffset: pathLength }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
              />
            </svg>
            
            {units.map((unit, index) => {
              const unlocked = isUnlocked(unit, index);
              const completed = completedUnits.includes(unit.id);
              const isEven = index % 2 === 0;

              const positionStyle = {
                top: `${index * layout.verticalSpacing}px`,
                left: `calc(50% + ${isEven ? -layout.horizontalOffset : layout.horizontalOffset}px)`,
                transform: 'translateX(-50%)'
              };

              return (
                <motion.div
                  key={unit.id}
                  className="absolute z-10 flex flex-col items-center"
                  style={positionStyle}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => unlocked ? navigate(`/lesson/${unit.id}`) : null}
                    disabled={!unlocked}
                    className={`w-28 h-28 rounded-full border-b-8 flex items-center justify-center group shadow-xl transition-all
                      ${completed ? 'bg-green-500 border-green-700' : unlocked ? 'bg-blue-500 border-blue-700' : 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600'}`}
                  >
                    <span className="text-5xl filter drop-shadow-md">
                      {completed ? '✅' : (unlocked ? (index === 0 ? '⭐' : '🚀') : '🔒')}
                    </span>
                    {unlocked && (
                      <div className="absolute -bottom-12 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-lg font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border dark:border-gray-600">
                        {unit.title}
                        <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-700 rotate-45"></div>
                      </div>
                    )}
                  </motion.button>
                  <h3 className={`mt-3 font-bold uppercase text-sm tracking-widest ${unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {unit.title}
                  </h3>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Загрузка карты...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;