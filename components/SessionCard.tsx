import React from 'react';
import { type SessionDetails, type SessionStatus } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface SessionCardProps {
    session: SessionDetails;
    onEdit: () => void;
    onDelete: () => void;
    style?: React.CSSProperties;
}

const statusStyles: Record<SessionStatus, { dot: string; text: string; bg: string }> = {
    Active: { dot: 'bg-green-400', text: 'text-green-300', bg: 'bg-green-500/15' },
    Upcoming: { dot: 'bg-yellow-400', text: 'text-yellow-300', bg: 'bg-yellow-500/15' },
    Closed: { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/15' },
};

const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete, style }) => {
    const styles = statusStyles[session.status];
    const isActive = session.status === 'Active';

    return (
        <div 
            className={`group bg-zinc-900 rounded-xl shadow-lg shadow-black/20 p-4 flex items-center space-x-4 transition-all duration-300 animate-fade-in ${isActive ? 'border-green-500/50 shadow-green-500/10' : 'border-zinc-800'} border`}
            style={style}
        >
            <div className={`w-2 h-16 rounded-full ${session.color}`}></div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-zinc-100">{session.name}</h3>
                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-x-1.5 ${styles.bg} ${styles.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                        {session.status}
                    </div>
                </div>
                <p className="text-sm text-zinc-400">{session.market} Session</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                    <p className="font-mono text-zinc-300">
                        {session.localOpenTime} - {session.localCloseTime}
                    </p>
                    
                    <div className="relative h-6 flex items-center"> {/* Container to manage the transition */}
                        {/* Countdown - visible by default, invisible on hover */}
                        <p className="text-xs text-zinc-400 font-mono transition-opacity duration-200 group-hover:opacity-0 group-hover:invisible">
                            {session.countdown}
                        </p>

                        {/* Buttons - invisible by default, visible on hover */}
                        <div className="absolute right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                            <button onClick={onEdit} aria-label={`Edit ${session.name} session`} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={onDelete} aria-label={`Delete ${session.name} session`} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-700 rounded-md transition-colors">
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