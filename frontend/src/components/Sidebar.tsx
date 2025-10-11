import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/markets', name: 'Markets', icon: '📈' },
    { path: '/ai-insights', name: 'AI Insights', icon: '🤖' },
    { path: '/profile', name: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Logo/Brand - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-3xl font-bold text-black tracking-tight">FinTrack</h1>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-12 h-12 bg-black rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl focus:outline-none group"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="fixed top-20 right-8 z-50 w-80 bg-white rounded-2xl shadow-2xl border-t-4 border-black overflow-hidden animate-slideIn">
            <div className="p-6">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-black rounded-full"></div>
                Navigation
              </h2>
              
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                        isActive
                          ? 'bg-black text-white border-black shadow-xl'
                          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-black text-black hover:shadow-lg'
                      }`
                    }
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-base">{item.name}</span>
                    <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                ))}
              </nav>

              {/* Footer Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    DS
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">Dennis Sharon</p>
                    <p className="text-xs text-gray-600">dennis.sharon@email.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
