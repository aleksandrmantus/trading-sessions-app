import React, { useState, useEffect } from 'react';
import { type TradingSession } from '../types';
import { SESSION_COLORS } from '../constants';
import { XMarkIcon } from './Icons';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: TradingSession | Omit<TradingSession, 'id'>) => void;
    session: TradingSession | null;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, session }) => {
    const [name, setName] = useState('');
    const [market, setMarket] = useState('');
    const [utcStartHour, setUtcStartHour] = useState('8');
    const [utcEndHour, setUtcEndHour] = useState('17');
    const [color, setColor] = useState(SESSION_COLORS[0].class);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session) {
            setName(session.name);
            setMarket(session.market);
            setUtcStartHour(String(session.utcStartHour));
            setUtcEndHour(String(session.utcEndHour));
            setColor(session.color);
        } else {
            // Reset form for new session
            setName('');
            setMarket('');
            setUtcStartHour('8');
            setUtcEndHour('17');
            setColor(SESSION_COLORS[0].class);
        }
        setError('');
    }, [session, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = parseInt(utcStartHour, 10);
        const end = parseInt(utcEndHour, 10);

        if (!name.trim() || !market.trim()) {
            setError('Name and Market fields are required.');
            return;
        }
        if (isNaN(start) || isNaN(end) || start < 0 || start > 23 || end < 0 || end > 23) {
            setError('Hours must be between 0 and 23.');
            return;
        }
        
        const sessionData = {
            name: name.trim(),
            market: market.trim(),
            utcStartHour: start,
            utcEndHour: end,
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
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 w-full max-w-md rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-6 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{session ? 'Edit Session' : 'Add New Session'}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Session Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" placeholder="e.g., Frankfurt" />
                    </div>
                     <div>
                        <label htmlFor="market" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Market / Region</label>
                        <input type="text" id="market" value={market} onChange={e => setMarket(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" placeholder="e.g., Europe" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="startHour" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">UTC Start Hour</label>
                            <input type="number" id="startHour" value={utcStartHour} onChange={e => setUtcStartHour(e.target.value)} min="0" max="23" required className="w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="endHour" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">UTC End Hour</label>
                            <input type="number" id="endHour" value={utcEndHour} onChange={e => setUtcEndHour(e.target.value)} min="0" max="23" required className="w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {SESSION_COLORS.map(c => (
                                <button key={c.class} type="button" onClick={() => setColor(c.class)} className={`w-8 h-8 rounded-full ${c.class} transition-transform hover:scale-110 ${color === c.class ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-blue-500' : ''}`} aria-label={`Select color ${c.name}`}></button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">Save Session</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionModal;