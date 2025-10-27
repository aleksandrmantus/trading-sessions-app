
import React, { useState, useEffect, useMemo } from 'react';
import { TIMEZONES } from './constants';
import { type TradingSession, type SessionStatus, type SessionDetails } from './types';
import SessionCard from './components/SessionCard';
import Timeline, { type TooltipData } from './components/Timeline';
import Clock from './components/Clock';
import { PlusIcon, GitHubIcon, EnvelopeIcon } from './components/Icons';
import { useSessions, useLocalStorage } from './hooks';
import SessionModal from './components/SessionModal';
import ControlDeck, { type TradingSchedule } from './components/ControlDeck';
import TimezoneModal from './components/TimezoneModal';

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

    const MIN_15_IN_MS = 15 * 60 * 1000;
    const MIN_30_IN_MS = 30 * 60 * 1000;
    const MIN_60_IN_MS = 60 * 60 * 1000;

    if (nowMs >= openMs && nowMs < closeMs) {
        const diff = closeMs - nowMs;
        if (diff <= MIN_30_IN_MS) {
            return { status: 'active-closing', countdown: `Closes in ${formatCountdown(diff)}` };
        }
        return { status: 'active', countdown: `Closes in ${formatCountdown(diff)}` };
    }

    const diffToOpen = openMs - nowMs;
    if (diffToOpen > 0 && diffToOpen <= MIN_60_IN_MS) {
        if (diffToOpen <= MIN_15_IN_MS) {
            return { status: 'upcoming-soon', countdown: `Opens in ${formatCountdown(diffToOpen)}` };
        }
        return { status: 'upcoming', countdown: `Opens in ${formatCountdown(diffToOpen)}` };
    }

    const nextOpenDiff = diffToOpen > 0 ? diffToOpen : diffToOpen + 24 * 60 * 60 * 1000;
    return { status: 'closed', countdown: `Opens in ${formatCountdown(nextOpenDiff)}` };
}

const getLocalIntervals = (session: TradingSession, now: Date, timezone: string): { start: number; end: number }[] => {
    const utcOffset = (() => {
        try {
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            return Math.round((tzDate.getTime() - utcDate.getTime()) / (15 * 60 * 1000)) * 0.25;
        } catch { return 0; }
    })();

    const startUTC = session.utcStartHour;
    const endUTC = session.utcEndHour;
    const duration = endUTC >= startUTC ? endUTC - startUTC : (24 - startUTC) + endUTC;
    if (duration === 0) return [];
    if (duration >= 24) return [{ start: 0, end: 24 }];

    const localStart = (startUTC + utcOffset);
    const startMod = (localStart % 24 + 24) % 24;
    const endMod = ((localStart + duration) % 24 + 24) % 24;

    if (startMod === endMod) {
        return [{ start: 0, end: 24 }];
    }
    
    if (startMod < endMod) {
         return [{ start: startMod, end: endMod }];
    } else { 
         return [{ start: startMod, end: 24 }, { start: 0, end: endMod }];
    }
};


const App: React.FC = () => {
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('market-sessions-theme', 'dark');
    const [isCompact, setIsCompact] = useLocalStorage<boolean>('market-sessions-compact-mode', false);
    const [now, setNow] = useState(new Date());
    const [selectedTimezone, setSelectedTimezone] = useLocalStorage<string>('market-sessions-timezone', 'local');
    const { sessions, addSession, updateSession, deleteSession, resetSessions } = useSessions();
    const [sessionModalState, setSessionModalState] = useState<{isOpen: boolean; sessionToEdit: TradingSession | null}>({ isOpen: false, sessionToEdit: null });
    const [timezoneModalOpen, setTimezoneModalOpen] = useState(false);
    const [showGoldenHours, setShowGoldenHours] = useLocalStorage<boolean>('market-sessions-golden-hours', true);
    const [showMarketPulse, setShowMarketPulse] = useLocalStorage<boolean>('market-sessions-market-pulse', true);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [tradingSchedule, setTradingSchedule] = useLocalStorage<TradingSchedule>('market-sessions-trading-schedule', 'weekdays');
    const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
    
    const effectiveTimezone = useMemo(() => {
        if (selectedTimezone === 'local') {
            try {
                return Intl.DateTimeFormat().resolvedOptions().timeZone;
            } catch (e) {
                return 'UTC'; // Fallback
            }
        }
        return selectedTimezone;
    }, [selectedTimezone]);


    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSetTooltip = (data: TooltipData | null) => {
        setTooltip(data);
    };
    
    const handleSessionFocusToggle = (sessionId: string) => {
        setFocusedSessionId(prevId => (prevId === sessionId ? null : sessionId));
    };

    const sessionDetails: SessionDetails[] = useMemo(() => {
        const localDate = new Date(now.toLocaleString('en-US', { timeZone: effectiveTimezone }));
        const dayOfWeek = localDate.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (tradingSchedule === 'weekdays' && isWeekend) {
            return [];
        }

        const nowInMinutes = localDate.getHours() * 60 + localDate.getMinutes();

        const overlaps = new Array(24 * 60).fill(0);
        sessions.forEach(session => {
            const intervals = getLocalIntervals(session, now, effectiveTimezone);
            intervals.forEach(({ start, end }) => {
                const startMinute = Math.floor(start * 60);
                const endMinute = Math.floor(end * 60);
                for (let i = startMinute; i < endMinute; i++) {
                    const minuteIndex = i % (24*60);
                    overlaps[minuteIndex]++;
                }
            });
        });

        return sessions.map((session: TradingSession) => {
            const findCurrentOrNextSession = (now: Date, session: TradingSession): {open: Date, close: Date} => {
                const durationHours = session.utcEndHour >= session.utcStartHour
                    ? session.utcEndHour - session.utcStartHour
                    : (24 - session.utcStartHour) + session.utcEndHour;

                let open = new Date(now);
                open.setUTCHours(session.utcStartHour, 0, 0, 0);
                let close = new Date(open);
                close.setUTCHours(close.getUTCHours() + durationHours);

                if (now.getTime() >= close.getTime()) {
                    open.setDate(open.getDate() + 1);
                    close.setDate(close.getDate() + 1);
                    return { open, close };
                }
                
                if (now.getTime() < open.getTime()) {
                    const openYesterday = new Date(open);
                    openYesterday.setDate(openYesterday.getDate() - 1);
                    
                    const closeForYesterdayOpen = new Date(openYesterday);
                    closeForYesterdayOpen.setUTCHours(closeForYesterdayOpen.getUTCHours() + durationHours);

                    if (now.getTime() >= openYesterday.getTime() && now.getTime() < closeForYesterdayOpen.getTime()) {
                        return { open: openYesterday, close: closeForYesterdayOpen };
                    }
                }

                return { open, close };
            };
            
            const { open, close } = findCurrentOrNextSession(now, session);
            const { status, countdown } = getSessionStatus(now, open, close);

            const formatter = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: effectiveTimezone,
                hour12: false,
            });

            let isOverlappingNow = false;
            if (status === 'active' || status === 'active-closing') {
                isOverlappingNow = overlaps[nowInMinutes] > 1;
            }

            return {
                ...session,
                status,
                countdown,
                localOpenTime: formatter.format(open),
                localCloseTime: formatter.format(close),
                isOverlapping: isOverlappingNow,
            };
        });
    }, [now, effectiveTimezone, sessions, tradingSchedule]);
    
    const isTimezonePickerVisible = sessionDetails.length > 0;

    const handleSaveSession = (sessionData: TradingSession | Omit<TradingSession, 'id'>) => {
        if ('id' in sessionData) {
            updateSession(sessionData);
        } else {
            addSession(sessionData);
        }
        setSessionModalState({ isOpen: false, sessionToEdit: null });
    };
    
    const handleResetSessions = () => {
        if (window.confirm('Are you sure you want to reset all sessions to their defaults? This cannot be undone.')) {
            resetSessions();
        }
    };

    const handleEdit = (session: TradingSession) => {
        setSessionModalState({ isOpen: true, sessionToEdit: session });
    };

    const handleDelete = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            deleteSession(sessionId);
        }
    };
    
    return (
        <div 
            className={`min-h-screen grid grid-rows-[1fr_auto] text-zinc-800 dark:text-zinc-200 font-sans ${isCompact ? 'compact' : ''}`}
            onClick={(e) => {
                if (!(e.target as HTMLElement).closest('.session-card, .timeline-bar, .control-deck-menu')) {
                    setFocusedSessionId(null);
                }
            }}
        >
            <div className="max-w-xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <main className="space-y-3">
                    {isCompact ? (
                        // --- COMPACT MODE ---
                        // A single "Smart Status Bar" that combines Clock and Controls
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20 p-2 px-4 transition-all duration-300">
                            <Clock
                                time={now}
                                timezone={selectedTimezone}
                                onTimezoneClick={() => setTimezoneModalOpen(true)}
                                isCompact={true}
                                isTimezonePickerVisible={isTimezonePickerVisible}
                            />
                            <ControlDeck
                                theme={theme}
                                onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                isCompact={isCompact}
                                onCompactToggle={() => setIsCompact(!isCompact)}
                                onResetSessions={handleResetSessions}
                                showGoldenHours={showGoldenHours}
                                onGoldenHoursToggle={() => setShowGoldenHours(!showGoldenHours)}
                                showMarketPulse={showMarketPulse}
                                onMarketPulseToggle={() => setShowMarketPulse(!showMarketPulse)}
                                tradingSchedule={tradingSchedule}
                                onTradingScheduleChange={setTradingSchedule}
                            />
                        </div>
                    ) : (
                        // --- NORMAL MODE ---
                        // Two separate blocks for controls and clock
                        <>
                            <ControlDeck
                                theme={theme}
                                onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                isCompact={isCompact}
                                onCompactToggle={() => setIsCompact(!isCompact)}
                                onResetSessions={handleResetSessions}
                                showGoldenHours={showGoldenHours}
                                onGoldenHoursToggle={() => setShowGoldenHours(!showGoldenHours)}
                                showMarketPulse={showMarketPulse}
                                onMarketPulseToggle={() => setShowMarketPulse(!showMarketPulse)}
                                tradingSchedule={tradingSchedule}
                                onTradingScheduleChange={setTradingSchedule}
                            />
                            <div className="bg-white dark:bg-zinc-900 shadow-md dark:shadow-lg shadow-black/5 dark:shadow-black/20 rounded-xl p-6 transition-colors border border-zinc-200/80 dark:border-zinc-800">
                                <Clock
                                    time={now}
                                    timezone={selectedTimezone}
                                    onTimezoneClick={() => setTimezoneModalOpen(true)}
                                    isCompact={false}
                                    isTimezonePickerVisible={isTimezonePickerVisible}
                                />
                            </div>
                        </>
                    )}

                    {sessionDetails.length > 0 && (
                        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20 ${isCompact ? 'p-2' : 'p-3'}`}>
                            <Timeline 
                                sessions={sessions}
                                sessionDetails={sessionDetails} 
                                now={now} 
                                timezone={effectiveTimezone} 
                                isCompact={isCompact}
                                showGoldenHours={showGoldenHours}
                                showMarketPulse={showMarketPulse}
                                tooltip={tooltip}
                                onSetTooltip={handleSetTooltip}
                                focusedSessionId={focusedSessionId}
                                onSessionBarClick={handleSessionFocusToggle}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        {sessionDetails.length > 0 ? (
                            <>
                                {sessionDetails.map((session, index) => (
                                   <SessionCard
                                        key={session.id}
                                        session={session}
                                        onEdit={() => handleEdit(session)}
                                        onDelete={() => handleDelete(session.id)}
                                        isCompact={isCompact}
                                        showGoldenHours={showGoldenHours}
                                        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                                        isFocused={focusedSessionId === session.id}
                                        isDimmed={focusedSessionId !== null && focusedSessionId !== session.id}
                                        onFocusToggle={() => handleSessionFocusToggle(session.id)}
                                   />
                                ))}
                                <div className="flex justify-center pt-2">
                                    <button 
                                        onClick={() => setSessionModalState({ isOpen: true, sessionToEdit: null })} 
                                        className="group flex items-center justify-center gap-x-2 w-auto px-4 py-2 border border-zinc-300/70 dark:border-zinc-700/70 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-200"
                                        aria-label="Add Session"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span className="text-sm">Add Session</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20">
                                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                                    Markets are Closed
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">
                                    Your view is filtered to "Weekdays Only".{' '}
                                    <button 
                                        onClick={() => {
                                            setTradingSchedule('24/7');
                                        }} 
                                        className="font-medium text-zinc-800 dark:text-zinc-100 hover:underline focus:outline-none"
                                    >
                                        Switch to 24/7 Mode
                                    </button>
                                    {' '}to see all sessions.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <footer className="max-w-xl mx-auto w-full p-4 sm:p-6 lg:p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400/80">
                <div className="text-center sm:text-left">
                    <p>&copy; {new Date().getFullYear()} Market Sessions</p>
                    <p className="text-zinc-400 dark:text-zinc-500/80">All times are converted to your selected timezone.</p>
                </div>
                <div className="flex items-center gap-x-4">
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">mantus</span>
                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="flex items-center gap-x-3">
                        <a 
                            href="https://github.com/aleksandrmantus/trading-sessions-app" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label="GitHub Repository" 
                            className="transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:scale-110"
                        >
                            <GitHubIcon className="w-5 h-5" />
                        </a>
                        <a 
                            href="mailto:aleksandr@mantus.ru" 
                            aria-label="Send Email" 
                            className="transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:scale-110"
                        >
                            <EnvelopeIcon className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </footer>
            
            <SessionModal 
                isOpen={sessionModalState.isOpen}
                onClose={() => setSessionModalState({ isOpen: false, sessionToEdit: null })}
                onSave={handleSaveSession}
                session={sessionModalState.sessionToEdit}
                sessions={sessions}
                // FIX: Pass the effectiveTimezone to the SessionModal
                localTimezone={effectiveTimezone}
            />
            <TimezoneModal
                isOpen={timezoneModalOpen}
                onClose={() => setTimezoneModalOpen(false)}
                onSelect={setSelectedTimezone}
                currentTimezone={selectedTimezone}
            />
        </div>
    );
};

export default App;
