import React, { useState, useEffect, useMemo } from 'react';
import { TIMEZONES } from './constants';
import { type TradingSession, type SessionStatus, type SessionDetails } from './types';
import SessionCard from './components/SessionCard';
import Timeline from './components/Timeline';
import Clock from './components/Clock';
import { GlobeIcon, ChevronDownIcon, PlusIcon } from './components/Icons';
import { useSessions } from './hooks';
import SessionModal from './components/SessionModal';

function formatCountdown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getSessionStatus(now: Date, openTime: Date, closeTime: Date): { status: SessionStatus; countdown: string } {
    const nowMs = now.getTime();
    const openMs = openTime.getTime();
    const closeMs = closeTime.getTime();

    if (nowMs >= openMs && nowMs < closeMs) {
        const diff = closeMs - nowMs;
        return { status: 'Active', countdown: `Closes in ${formatCountdown(diff)}` };
    }

    const diffToOpen = openMs - nowMs;
    // Highlight upcoming sessions within 2 hours
    if (diffToOpen > 0 && diffToOpen <= 2 * 60 * 60 * 1000) { 
         return { status: 'Upcoming', countdown: `Opens in ${formatCountdown(diffToOpen)}` };
    }

    // Handle sessions that are further out or have passed for the day
    const nextOpenDiff = diffToOpen > 0 ? diffToOpen : diffToOpen + 24 * 60 * 60 * 1000;
    return { status: 'Closed', countdown: `Opens in ${formatCountdown(nextOpenDiff)}` };
}

const App: React.FC = () => {
    const [now, setNow] = useState(new Date());
    const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
    const { sessions, addSession, updateSession, deleteSession } = useSessions();
    const [modalState, setModalState] = useState<{isOpen: boolean; sessionToEdit: TradingSession | null}>({ isOpen: false, sessionToEdit: null });

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const sessionDetails: SessionDetails[] = useMemo(() => {
        return sessions.map((session: TradingSession) => {
            const findNextSession = (startOffset: number): {open: Date, close: Date} => {
                const open = new Date(now);
                open.setUTCHours(session.utcStartHour, 0, 0, 0);
                open.setUTCDate(open.getUTCDate() + startOffset);
                
                const close = new Date(open);
                const durationHours = session.utcEndHour >= session.utcStartHour
                    ? session.utcEndHour - session.utcStartHour
                    : (24 - session.utcStartHour) + session.utcEndHour;
                close.setUTCHours(close.getUTCHours() + durationHours);

                if (close.getTime() < now.getTime()) {
                    return findNextSession(startOffset + 1);
                }
                return { open, close };
            };
            
            const { open, close } = findNextSession(0);
            const { status, countdown } = getSessionStatus(now, open, close);

            const formatter = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: selectedTimezone,
                hour12: false,
            });

            return {
                ...session,
                status,
                countdown,
                localOpenTime: formatter.format(open),
                localCloseTime: formatter.format(close),
            };
        });
    }, [now, selectedTimezone, sessions]);

    const handleSaveSession = (sessionData: TradingSession | Omit<TradingSession, 'id'>) => {
        if ('id' in sessionData) {
            updateSession(sessionData);
        } else {
            addSession(sessionData);
        }
        setModalState({ isOpen: false, sessionToEdit: null });
    };

    const handleEdit = (session: TradingSession) => {
        setModalState({ isOpen: true, sessionToEdit: session });
    };

    const handleDelete = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            deleteSession(sessionId);
        }
    };
    
    return (
        <div className="min-h-screen text-zinc-800 dark:text-zinc-200 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="max-w-xl mx-auto">
                <main className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/20 p-6">
                        <Clock time={now} timezone={selectedTimezone} />
                        <div className="mt-6 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <GlobeIcon className="w-5 h-5 text-zinc-400" />
                            </div>
                            <select
                                value={selectedTimezone}
                                onChange={(e) => setSelectedTimezone(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700/80 transition-colors text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-3 pl-11 appearance-none"
                                aria-label="Select timezone"
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz} value={tz} className="bg-zinc-800 text-white">{tz.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/20 p-4 sm:p-6">
                        <Timeline sessions={sessionDetails} now={now} />
                    </div>

                    <div className="space-y-3">
                        {sessionDetails.map((session, index) => (
                           <SessionCard
                                key={session.id}
                                session={session}
                                onEdit={() => handleEdit(session)}
                                onDelete={() => handleDelete(session.id)}
                                style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                           />
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => setModalState({ isOpen: true, sessionToEdit: null })} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 transition-all duration-200">
                           <PlusIcon className="w-4 h-4" /> Add Session
                        </button>
                    </div>
                </main>

                <footer className="text-center mt-12 text-xs text-zinc-500">
                    <p>All times are converted to your selected timezone.</p>
                    <p>&copy; {new Date().getFullYear()} Market Sessions. All rights reserved.</p>
                </footer>
            </div>
            <SessionModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, sessionToEdit: null })}
                onSave={handleSaveSession}
                session={modalState.sessionToEdit}
            />
        </div>
    );
};

export default App;