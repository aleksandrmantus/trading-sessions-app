import React, { useState, useMemo, useEffect } from 'react';
import { TIMEZONES } from '../constants';
import { XMarkIcon, SearchIcon } from './Icons';

interface TimezoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (timezone: string) => void;
    currentTimezone: string;
}

const TimezoneModal: React.FC<TimezoneModalProps> = ({ isOpen, onClose, onSelect, currentTimezone }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        // Reset search term when modal opens
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const groupedTimezones = useMemo(() => {
        const filtered = TIMEZONES.filter(tz => 
            tz.toLowerCase().replace(/_/g, ' ').includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, tz) => {
            const region = tz.split('/')[0];
            if (!acc[region]) {
                acc[region] = [];
            }
            acc[region].push(tz);
            return acc;
        }, {} as Record<string, string[]>);
    }, [searchTerm]);

    const handleSelect = (tz: string) => {
        onSelect(tz);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" 
            style={{ animationDuration: '0.2s' }} 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 w-full max-w-md h-[70vh] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white text-center">Select Timezone</h2>
                    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" aria-label="Close timezone selection">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <div className="relative mt-4">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a timezone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            aria-label="Search for a timezone"
                            autoFocus
                        />
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto">
                    {Object.keys(groupedTimezones).sort().map(region => (
                        <div key={region}>
                            <h3 className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 px-4 py-2 sticky top-0 backdrop-blur-sm">{region}</h3>
                            <ul>
                                {groupedTimezones[region].map(tz => (
                                    <li key={tz}>
                                        <button 
                                            onClick={() => handleSelect(tz)}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                                currentTimezone === tz 
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' 
                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            {tz.replace(/_/g, ' ')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {Object.keys(groupedTimezones).length === 0 && (
                        <p className="text-center text-zinc-500 dark:text-zinc-400 p-8">No timezones found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimezoneModal;
