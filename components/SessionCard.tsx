import React from 'react';
import { type SessionDetails, type SessionStatus } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface SessionCardProps {
    session: SessionDetails;
    onEdit: () => void;
    onDelete: () => void;
    isCompact: boolean;
    showGoldenHours: boolean;
    style?: React.CSSProperties;
}

const statusStyles: Record<SessionStatus, { dot: string; text: string; bg: string }> = {
    Active: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
    Upcoming: { dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-300', bg: 'bg-yellow-500/10 dark:bg-yellow-500/15' },
    Closed: { dot: 'bg-zinc-500', text: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-500/10 dark:bg-zinc-500/15' },
};

const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete, isCompact, showGoldenHours, style }) => {
    const styles = statusStyles[session.status];
    const isActive = session.status === 'Active';

    return (
        <div 
            className={`group bg-white dark:bg-zinc-900 rounded-xl shadow-md dark:shadow-lg shadow-black/5 dark:shadow-black/20 flex items-center space-x-4 transition-all duration-300 animate-fade-in ${isActive ? 'border-emerald-500/30 dark:border-emerald-500/50 shadow-emerald-500/5 dark:shadow-emerald-500/10' : 'border-zinc-200/80 dark:border-zinc-800'} border ${isCompact ? 'p-3' : 'p-4'}`}
            style={style}
        >
            <div className={`w-2 rounded-full ${session.color} ${isCompact ? 'h-12' : 'h-16'}`}></div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className={`font-bold text-zinc-900 dark:text-zinc-100 ${isCompact ? 'text-base' : 'text-lg'}`}>{session.name}</h3>
                    <div className="flex items-center gap-x-2">
                        {showGoldenHours && session.isOverlapping && (
                            <div className="text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full">
                                <span>Overlap</span>
                            </div>
                        )}
                        <div className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-x-1.5 ${styles.bg} ${styles.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                            {session.status}
                        </div>
                    </div>
                </div>
                {!isCompact && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{session.market} Session</p>
                )}
                <div className={`flex justify-between items-center text-sm ${isCompact ? 'mt-1' : 'mt-2'}`}>
                    <p className="font-mono text-zinc-600 dark:text-zinc-300">
                        {session.localOpenTime} - {session.localCloseTime}
                    </p>
                    
                    <div className="relative h-7 flex items-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono transition-opacity duration-200 group-hover:opacity-0">
                            {session.countdown}
                        </p>

                        <div className="absolute right-0 flex items-center space-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                            <button onClick={onEdit} aria-label={`Edit ${session.name} session`} className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={onDelete} aria-label={`Delete ${session.name} session`} className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionCard;