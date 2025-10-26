import React from 'react';
import { 
    SunIcon, MoonIcon, ListBulletIcon, LayersIcon, PulseIcon, Cog6ToothIcon, EllipsisHorizontalIcon
} from './Icons';

interface ControlDeckProps {
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    isCompact: boolean;
    onCompactToggle: () => void;
    onResetSessions: () => void;
    showGoldenHours: boolean;
    onGoldenHoursToggle: () => void;
    showMarketPulse: boolean;
    onMarketPulseToggle: () => void;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
    onCloseMenu: () => void;
    menuContainerRef: React.RefObject<HTMLDivElement>;
}

const MenuRow: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; isActive?: boolean }> = ({ onClick, icon, label, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors duration-150
            ${isActive ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/50'}`
        }
    >
        <span className="w-5 h-5">{icon}</span>
        <span>{label}</span>
    </button>
);


const ControlDeck: React.FC<ControlDeckProps> = ({ menuContainerRef, isMenuOpen, onMenuToggle, onCloseMenu, ...props }) => {
  return (
    <div className={`relative ${isMenuOpen ? 'z-50' : 'z-30'} bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20`}>
      <div className="flex justify-end items-center">
        <div className="relative" ref={menuContainerRef}>
            <button 
                onClick={onMenuToggle}
                className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Open controls menu"
            >
                <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in" style={{ animationDuration: '0.15s' }}>
                  <div className="space-y-1">
                      <MenuRow onClick={props.onThemeToggle} icon={props.theme === 'light' ? <MoonIcon/> : <SunIcon/>} label={props.theme === 'light' ? 'Dark Mode' : 'Light Mode'} />
                      <MenuRow onClick={props.onCompactToggle} icon={<ListBulletIcon/>} label="Compact View" isActive={props.isCompact} />
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
                  <div className="space-y-1">
                      <MenuRow onClick={props.onGoldenHoursToggle} icon={<LayersIcon/>} label="Show Overlaps" isActive={props.showGoldenHours} />
                      <MenuRow onClick={props.onMarketPulseToggle} icon={<PulseIcon/>} label="Market Pulse" isActive={props.showMarketPulse} />
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
                   <div className="p-1">
                      <button 
                          onClick={() => { props.onResetSessions(); onCloseMenu(); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                          <Cog6ToothIcon className="w-5 h-5"/>
                          <span>Reset Sessions</span>
                      </button>
                  </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;