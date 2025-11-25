import React from 'react';
import { Home, PlusCircle, PieChart, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'add' | 'progress' | 'settings';
  onNavigate: (tab: 'home' | 'add' | 'progress' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Review' },
    { id: 'add', icon: PlusCircle, label: 'Add' },
    { id: 'progress', icon: PieChart, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center transition-all duration-300 ${
              activeTab === item.id 
                ? 'text-gray-800 -translate-y-2' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 transition-colors ${activeTab === item.id ? 'bg-pastel-yellow' : 'bg-transparent'}`}>
                <item.icon size={24} />
            </div>
            <span className={`text-xs font-medium ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
