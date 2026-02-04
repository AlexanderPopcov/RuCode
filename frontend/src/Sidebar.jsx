import { useNavigate, useLocation } from 'react-router-dom'

function Sidebar({ theme, toggleTheme }) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: '🏠', label: 'Обучение', path: '/' },
    { icon: '🏆', label: 'Лидеры', path: '/leaderboard' }, // Пока заглушка
    { icon: '🛒', label: 'Магазин', path: '/shop' },       // Пока заглушка
    { icon: '👤', label: 'Профиль', path: '/profile' },    // Пока заглушка
  ]

  return (
    <div className="hidden md:flex flex-col w-64 h-screen border-r bg-white dark:bg-gray-900 dark:border-gray-800 fixed left-0 top-0 p-6 z-20">
      {/* Логотип */}
      <div className="text-3xl font-black text-green-600 dark:text-green-500 mb-10 tracking-wider flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        RUCODE 🐍
      </div>

      {/* Меню */}
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all
              ${location.pathname === item.path 
                ? 'bg-blue-100 text-blue-500 border-2 border-blue-200 dark:bg-gray-800 dark:text-blue-400 dark:border-gray-700' 
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border-2 border-transparent'}
            `}
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Переключатель темы (Внизу) */}
      <button 
        onClick={toggleTheme}
        className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all border-2 border-transparent uppercase tracking-widest text-sm"
      >
        <span className="text-2xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
        {theme === 'dark' ? 'Светлая' : 'Темная'}
      </button>
    </div>
  )
}

export default Sidebar