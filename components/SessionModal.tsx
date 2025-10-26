import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type TradingSession } from '../types';
import { SESSION_COLORS } from '../constants';
import { XMarkIcon } from './Icons';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: TradingSession | Omit<TradingSession, 'id'>) => void;
    session: TradingSession | null;
    sessions: TradingSession[];
}

const formatHour = (hour: number) => `${String(Math.floor(hour)).padStart(2, '0')}:00`;

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, session, sessions }) => {
    const [name, setName] = useState('');
    const [market, setMarket] = useState('');
    const [color, setColor] = useState(SESSION_COLORS[0].class);
    const [timeRange, setTimeRange] = useState({ start: 8, end: 17 });

    useEffect(() => {
        if (session) {
            setName(session.name);
            setMarket(session.market);
            setTimeRange({ start: session.utcStartHour, end: session.utcEndHour });
            setColor(session.color);
        } else {
            // Reset to default for a new session
            setName('');
            setMarket('');
            setTimeRange({ start: 8, end: 17 });
            setColor(SESSION_COLORS[0].class);
        }
    }, [session, isOpen]);

    const isFormValid = name.trim() !== '';

    const localTimeDisplay = useMemo(() => {
        try {
            const localOffset = new Date().getTimezoneOffset() / -60;
            const localStart = (timeRange.start + localOffset + 24) % 24;
            const localEnd = (timeRange.end + localOffset + 24) % 24;
            return `${formatHour(localStart)} - ${formatHour(localEnd)}`;
        } catch {
            return "N/A";
        }
    }, [timeRange]);

    const overlapWarning = useMemo(() => {
        const checkOverlap = (
            s1: { start: number, end: number },
            s2: { start: number, end: number }
        ): boolean => {
            const s1Intervals = s1.start < s1.end ? [s1] : [{ start: s1.start, end: 24 }, { start: 0, end: s1.end }];
            const s2Intervals = s2.start < s2.end ? [s2] : [{ start: s2.start, end: 24 }, { start: 0, end: s2.end }];
            return s1Intervals.some(i1 => s2Intervals.some(i2 => i1.start < i2.end && i1.end > i2.start));
        };

        const overlappingSession = sessions.find(s => {
            if (session && s.id === session.id) return false;
            return checkOverlap(timeRange, { start: s.utcStartHour, end: s.utcEndHour });
        });

        return overlappingSession ? `Warning: May overlap with "${overlappingSession.name}" session.` : null;
    }, [timeRange, sessions, session]);

    const handleTimeChange = (type: 'start' | 'end', value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 24) {
            return;
        }

        setTimeRange(prev => {
            if (type === 'start') {
                return { ...prev, start: Math.min(numericValue, prev.end) };
            } else {
                return { ...prev, end: Math.max(numericValue, prev.start) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const sessionData = {
            name: name.trim(),
            market: market.trim(),
            utcStartHour: timeRange.start,
            utcEndHour: timeRange.end,
            color
        };

        if (session) {
            onSave({ ...sessionData, id: session.id });
        } else {
            onSave(sessionData);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" style={{ animationDuration: '0.2s' }} onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl shadow-2xl shadow-black/30 p-6 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-6">{session ? 'Edit Session' : 'Add New Session'}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1.5">Session Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all" placeholder="e.g., Frankfurt" />
                        </div>
                        <div>
                            <label htmlFor="market" className="block text-sm font-medium text-zinc-400 mb-1.5">Market / Region</label>
                            <input type="text" id="market" value={market} onChange={e => setMarket(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all" placeholder="e.g., Europe" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="block text-sm font-medium text-zinc-400">Session Time (UTC)</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label htmlFor="start-time" className="block text-xs text-zinc-500 mb-1">Start Time</label>
                                <input type="number" id="start-time" value={timeRange.start} onChange={e => handleTimeChange('start', e.target.value)} min="0" max="24" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="end-time" className="block text-xs text-zinc-500 mb-1">End Time</label>
                                <input type="number" id="end-time" value={timeRange.end} onChange={e => handleTimeChange('end', e.target.value)} min="0" max="24" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all" />
                            </div>
                        </div>

                        <div className="relative w-full h-1.5 bg-zinc-700 rounded-full mt-3">
                            <div className="absolute h-1.5 bg-zinc-500 rounded-full" style={{ left: `${(timeRange.start / 24) * 100}%`, width: `${((timeRange.end - timeRange.start) / 24) * 100}%` }} />
                        </div>
                         <div className="flex justify-between text-xs font-mono text-zinc-500 px-1">
                            <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
                        </div>
                        
                        <div className="text-center space-y-1 bg-zinc-800/70 p-3 rounded-lg">
                            <p className="text-sm font-mono text-white"><span className="font-sans text-zinc-400">UTC: </span>{formatHour(timeRange.start)} - {formatHour(timeRange.end)}</p>
                            <p className="text-xs font-mono text-zinc-400"><span className="font-sans">Local: </span>{localTimeDisplay}</p>
                        </div>
                        {overlapWarning && (
                            <p className="text-center text-xs text-amber-500/90 -mt-2.5 pb-2">{overlapWarning}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-3">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {SESSION_COLORS.map(c => (
                                <button key={c.class} type="button" onClick={() => setColor(c.class)} className={`w-8 h-8 rounded-full ${c.class} transition-all duration-150 ${color === c.class ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white' : ''} hover:scale-110 focus:outline-none`} aria-label={`Select color ${c.name}`}></button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex justify-end items-center gap-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">Cancel</button>
                        <button type="submit" disabled={!isFormValid} className="px-5 py-2 rounded-lg text-sm font-medium bg-zinc-50 text-zinc-900 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 active:scale-[0.98]">
                            {session ? 'Update Session' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionModal;