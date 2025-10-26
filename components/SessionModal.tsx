import React, { useState, useEffect, useMemo } from 'react';
import { type TradingSession } from '../types';
import { SESSION_COLORS } from '../constants';
import { XMarkIcon } from './Icons';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: TradingSession | Omit<TradingSession, 'id'>) => void;
    session: TradingSession | null;
    sessions: TradingSession[];
    localTimezone: string;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, session, sessions, localTimezone }) => {
    const [name, setName] = useState('');
    const [market, setMarket] = useState('');
    const [startHourDisplay, setStartHourDisplay] = useState('8');
    const [endHourDisplay, setEndHourDisplay] = useState('17');
    const [color, setColor] = useState(SESSION_COLORS[0].class);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Derive numeric values from string display state for calculations.
    // Default to 0 if the string is empty or invalid.
    const startHour = parseInt(startHourDisplay, 10) || 0;
    const endHour = parseInt(endHourDisplay, 10) || 0;


    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (session) {
                setName(session.name);
                setMarket(session.market);
                setStartHourDisplay(String(session.utcStartHour));
                setEndHourDisplay(String(session.utcEndHour));
                setColor(session.color);
            } else {
                setName('');
                setMarket('');
                setStartHourDisplay('8');
                setEndHourDisplay('17');
                setColor(SESSION_COLORS[0].class);
            }
            setErrors({});
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, session]);

    const { localTimeDisplay, overlapWarning } = useMemo(() => {
        const now = new Date();
        let localDisplay = '';
        let warning = '';

        try {
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: localTimezone }));
            const offset = (tzDate.getTime() - utcDate.getTime()) / (3600 * 1000);
            
            const localStart = (startHour + offset + 24) % 24;
            const localEnd = (endHour + offset + 24) % 24;

            const formatLocalTime = (localHour: number) => {
                const h = Math.floor(localHour);
                const m = Math.round((localHour % 1) * 60);
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            };
            localDisplay = `${formatLocalTime(localStart)} - ${formatLocalTime(localEnd)}`;

            const sessionEndHour = endHour >= startHour ? endHour : endHour + 24;
            for (const s of sessions) {
                if (session && s.id === session.id) continue;
                const existingEndHour = s.utcEndHour >= s.utcStartHour ? s.utcEndHour : s.utcEndHour + 24;
                if (Math.max(startHour, s.utcStartHour) < Math.min(sessionEndHour, existingEndHour)) {
                    warning = `May overlap with "${s.name}" session.`;
                    break;
                }
            }
        } catch (e) { console.error("Error calculating local time:", e); }

        return { localTimeDisplay: localDisplay, overlapWarning: warning };
    }, [startHour, endHour, localTimezone, sessions, session]);
    
    const isFormValid = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Session name cannot be empty.';
        if (!market.trim()) newErrors.market = 'Market/Region cannot be empty.';
        
        if (startHourDisplay.trim() === '' || endHourDisplay.trim() === '') {
            newErrors.time = 'Time cannot be empty.';
        } else if (startHour === endHour) {
            newErrors.time = 'Start and end time cannot be the same.';
        }

        const isDuplicate = sessions.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase() && s.id !== session?.id);
        if (isDuplicate) newErrors.name = 'A session with this name already exists.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleTimeInputChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        // Allow the input to be empty
        if (value === '') {
            setter('');
            return;
        }

        // Only allow numeric input
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            setter('');
            return;
        }

        const num = parseInt(numericValue, 10);
        
        if (num > 23) {
            setter('23');
        } else if (num < 0) {
            setter('0');
        } else {
            // Set the value as a string. This correctly handles leading zeros,
            // e.g., if user types '7' when '0' is present, the value becomes '07',
            // which parseInt converts to 7, and we set the state to '7'.
            setter(String(num));
        }
    };

    const handleTimeInputBlur = (setter: React.Dispatch<React.SetStateAction<string>>) => {
        // If the user leaves the input empty, default it to '0' for valid calculations.
        setter(currentValue => (currentValue.trim() === '' ? '0' : currentValue));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            const sessionData = { name: name.trim(), market: market.trim(), utcStartHour: startHour, utcEndHour: endHour, color };
            onSave(session ? { ...sessionData, id: session.id } : sessionData);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 bg-zinc-900/80 backdrop-blur-sm animate-fade-in"
            style={{ animationDuration: '0.2s' }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800/95 border border-zinc-200 dark:border-zinc-700 w-full max-w-md rounded-2xl shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/30 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-5 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {session ? 'Edit Session' : 'Add New Session'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors" aria-label="Close modal">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="p-5 flex-grow overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Session Name</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 block w-full rounded-lg bg-zinc-100 dark:bg-zinc-700/50 border-zinc-300 dark:border-zinc-600 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-blue-500/40 dark:focus:ring-white/50 ${errors.name ? 'border-red-500/50 ring-1 ring-red-500/50' : ''}`} placeholder="e.g., London"/>
                                {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 text-center">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="market" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Market / Region</label>
                                <input id="market" type="text" value={market} onChange={(e) => setMarket(e.target.value)} className={`mt-1 block w-full rounded-lg bg-zinc-100 dark:bg-zinc-700/50 border-zinc-300 dark:border-zinc-600 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-blue-500/40 dark:focus:ring-white/50 ${errors.market ? 'border-red-500/50 ring-1 ring-red-500/50' : ''}`} placeholder="e.g., Europe"/>
                                {errors.market && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 text-center">{errors.market}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Session Time (UTC)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="start-time" className="text-xs text-zinc-500">Start Time</label>
                                        <input type="number" id="start-time" value={startHourDisplay} 
                                            onChange={e => handleTimeInputChange(e.target.value, setStartHourDisplay)}
                                            onBlur={() => handleTimeInputBlur(setStartHourDisplay)}
                                            className="mt-1 w-full rounded-lg bg-zinc-100 dark:bg-zinc-700/50 border-zinc-300 dark:border-zinc-600 px-3 py-2 text-center text-zinc-900 dark:text-white focus:border-blue-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-blue-500/40 dark:focus:ring-white/50" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end-time" className="text-xs text-zinc-500">End Time</label>
                                        <input type="number" id="end-time" value={endHourDisplay} 
                                            onChange={e => handleTimeInputChange(e.target.value, setEndHourDisplay)}
                                            onBlur={() => handleTimeInputBlur(setEndHourDisplay)}
                                            className="mt-1 w-full rounded-lg bg-zinc-100 dark:bg-zinc-700/50 border-zinc-300 dark:border-zinc-600 px-3 py-2 text-center text-zinc-900 dark:text-white focus:border-blue-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-blue-500/40 dark:focus:ring-white/50"
                                        />
                                    </div>
                                </div>
                                <div className="relative h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-3 overflow-hidden">
                                    <div className="absolute h-full bg-zinc-400 dark:bg-zinc-500 rounded-full" style={{
                                        left: `${(Math.max(0, Math.min(23, startHour)) / 24) * 100}%`,
                                        width: `${(((endHour >= startHour ? endHour - startHour : (24 - startHour) + endHour) / 24) * 100)}%`
                                    }}></div>
                                </div>
                                <div className="w-full flex justify-between text-xs text-zinc-500 mt-1 font-mono">
                                    <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-100 dark:bg-zinc-700/40 rounded-lg p-3 text-center text-xs space-y-1">
                                <p className="font-mono text-zinc-800 dark:text-zinc-300">UTC: {String(startHour).padStart(2, '0')}:00 - {String(endHour).padStart(2, '0')}:00</p>
                                <p className="font-mono text-zinc-500 dark:text-zinc-400">Local: {localTimeDisplay}</p>
                                {errors.time && <p className="text-red-500 dark:text-red-400 font-medium">{errors.time}</p>}
                                {overlapWarning && !errors.time && <p className="text-amber-500 dark:text-amber-400 font-medium">{overlapWarning}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Color</label>
                                <div className="mt-2 flex flex-wrap gap-3">
                                    {SESSION_COLORS.map(c => (
                                        <button type="button" key={c.class} onClick={() => setColor(c.class)} className={`h-7 w-7 rounded-full transition-transform duration-150 ${c.class} ${color === c.class ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-zinc-800' : 'hover:scale-110'}`} aria-label={`Select color ${c.name}`}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <footer className="pt-6 flex justify-end items-center gap-4">
                            <button type="button" onClick={onClose} className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 dark:text-zinc-800 dark:bg-white rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 active:bg-zinc-600 dark:active:bg-zinc-300 active:scale-95 transition-all">
                                {session ? 'Update Session' : 'Save Session'}
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SessionModal;