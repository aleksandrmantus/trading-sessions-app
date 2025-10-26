import React, { useState, useRef, useEffect } from 'react';
import { 
    SunIcon, MoonIcon, ListBulletIcon, LayersIcon, PulseIcon, Cog6ToothIcon, 
    EllipsisHorizontalIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon
} from './Icons';

export type TradingSchedule = 'weekdays' | '24/7';

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
    tradingSchedule: TradingSchedule;
    onTradingScheduleChange: (schedule: TradingSchedule) => void;
}

const MenuItem: React.FC<{onClick: () => void, children: React.ReactNode, className?: string}> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/50 rounded-lg transition-colors duration-150 ${className}`}>
        {children}
    </button>
);

const MenuToggle: React.FC<{isActive?: boolean, onClick: () => void, children: React.ReactNode}> = ({ isActive = false, onClick, children }) => (
    <MenuItem onClick={onClick} className={isActive ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : ''}>
        {children}
    </MenuItem>
);

const ControlDeck: React.FC<ControlDeckProps> = ({ 
    theme, onThemeToggle, isCompact, onCompactToggle, onResetSessions, 
    showGoldenHours, onGoldenHoursToggle, showMarketPulse, onMarketPulseToggle,
    tradingSchedule, onTradingScheduleChange
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<'display' | 'schedule' | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setActiveSubMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) setActiveSubMenu(null);
    };

    const closeAllMenus = () => {
        setIsMenuOpen(false);
        setActiveSubMenu(null);
    };

    const renderMenuContent = () => (
        <>
            {activeSubMenu === 'display' && (
                <div className="space-y-1">
                    <MenuItem onClick={() => setActiveSubMenu(null)}>
                        <div className="flex items-center gap-3"><ChevronLeftIcon className="w-5 h-5" /><span>Back</span></div>
                    </MenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700/50 my-1"></div>
                    <MenuToggle isActive={showGoldenHours} onClick={onGoldenHoursToggle}>
                        <div className="flex items-center gap-3"><LayersIcon className="w-5 h-5" /><span>Show Overlaps</span></div>
                    </MenuToggle>
                    <MenuToggle isActive={showMarketPulse} onClick={onMarketPulseToggle}>
                        <div className="flex items-center gap-3"><PulseIcon className="w-5 h-5" /><span>Market Pulse</span></div>
                    </MenuToggle>
                </div>
            )}
            {activeSubMenu === 'schedule' && (
                <div className="space-y-1">
                    <MenuItem onClick={() => setActiveSubMenu(null)}>
                        <div className="flex items-center gap-3"><ChevronLeftIcon className="w-5 h-5" /><span>Back</span></div>
                    </MenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700/50 my-1"></div>
                    <MenuToggle isActive={tradingSchedule === 'weekdays'} onClick={() => onTradingScheduleChange('weekdays')}>
                        <div className="flex items-center gap-3"><span>Weekdays Only (Mon-Fri)</span></div>
                    </MenuToggle>
                    <MenuToggle isActive={tradingSchedule === '24/7'} onClick={() => onTradingScheduleChange('24/7')}>
                        <div className="flex items-center gap-3"><span>24/7 (Includes Weekends)</span></div>
                    </MenuToggle>
                </div>
            )}
            {activeSubMenu === null && (
                <div className="space-y-1">
                    <MenuToggle isActive={theme === 'dark'} onClick={onThemeToggle}>
                        <div className="flex items-center gap-3">{theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}<span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span></div>
                    </MenuToggle>
                    <MenuToggle isActive={isCompact} onClick={onCompactToggle}>
                        <div className="flex items-center gap-3"><ListBulletIcon className="w-5 h-5" /><span>Compact View</span></div>
                    </MenuToggle>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700/50 my-1"></div>
                    <MenuItem onClick={() => setActiveSubMenu('display')}>
                        <div className="flex items-center gap-3"><span>Display Options</span></div>
                        <ChevronRightIcon className="w-4 h-4 text-zinc-400" />
                    </MenuItem>
                    <MenuItem onClick={() => setActiveSubMenu('schedule')}>
                        <div className="flex items-center gap-3"><span>Trading Schedule</span></div>
                        <ChevronRightIcon className="w-4 h-4 text-zinc-400" />
                    </MenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700/50 my-1"></div>
                    <button onClick={() => { onResetSessions(); closeAllMenus(); }} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                         <Cog6ToothIcon className="w-5 h-5"/>
                         <span>Reset Sessions</span>
                    </button>
                </div>
            )}
        </>
    );

    if (isCompact) {
        return (
            <div className="relative" ref={menuRef}>
                <button onClick={handleMenuToggle} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Open settings menu">
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                </button>

                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl shadow-2xl p-2 z-50 animate-fade-in" style={{ animationDuration: '0.15s' }}>
                        {renderMenuContent()}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 rounded-xl shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20`}>
          <div className="flex justify-end items-center">
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={handleMenuToggle}
                    className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Open controls menu"
                >
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in" style={{ animationDuration: '0.15s' }}>
                      {renderMenuContent()}
                  </div>
                )}
            </div>
          </div>
        </div>
    );
};

export default ControlDeck;