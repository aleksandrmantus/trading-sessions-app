import React, { useMemo, useState } from 'react';
import { type TradingSession, type SessionDetails } from '../types';

interface TimelineProps {
    sessions: SessionDetails[];
    now: Date;
}

const getIntervals = (session: TradingSession): { start: number; end: number }[] => {
    if (session.utcEndHour > session.utcStartHour) {
        return [{ start: session.utcStartHour, end: session.utcEndHour }];
    }
    return [
        { start: session.utcStartHour, end: 24 },
        { start: 0, end: session.utcEndHour },
    ];
};

const doIntervalsOverlap = (i1: { start: number; end: number }, i2: { start: number; end: number }): boolean => {
    return Math.max(i1.start, i2.start) < Math.min(i1.end, i2.end);
};

const doSessionsOverlap = (s1: TradingSession, s2: TradingSession): boolean => {
    const intervals1 = getIntervals(s1);
    const intervals2 = getIntervals(s2);
    for (const i1 of intervals1) {
        for (const i2 of intervals2) {
            if (doIntervalsOverlap(i1, i2)) {
                return true;
            }
        }
    }
    return false;
};

const statusStyles: Record<SessionDetails['status'], { text: string }> = {
    Active: { text: 'text-green-300' },
    Upcoming: { text: 'text-yellow-300' },
    Closed: { text: 'text-zinc-400' },
};

const Timeline: React.FC<TimelineProps> = ({ sessions, now }) => {
    const [tooltip, setTooltip] = useState<{
        content: SessionDetails;
        x: number;
        y: number;
    } | null>(null);
    
    const currentUTCHour = now.getUTCHours() + now.getUTCMinutes() / 60;
    const markerPosition = (currentUTCHour / 24) * 100;

    const { sessionLevels, levelCount } = useMemo(() => {
        const levels: SessionDetails[][] = [];
        const sortedSessions = [...sessions].sort((a, b) => a.utcStartHour - b.utcStartHour);
        const sessionsWithLevels: (SessionDetails & { level: number })[] = [];

        sortedSessions.forEach(session => {
            let placedLevel = -1;
            for (let i = 0; i < levels.length; i++) {
                if (!levels[i].some(placedSession => doSessionsOverlap(session, placedSession))) {
                    levels[i].push(session);
                    placedLevel = i;
                    break;
                }
            }
            if (placedLevel === -1) {
                placedLevel = levels.length;
                levels.push([session]);
            }
            sessionsWithLevels.push({ ...session, level: placedLevel });
        });

        return { sessionLevels: sessionsWithLevels, levelCount: Math.max(1, levels.length) };
    }, [sessions]);
    
    const overlapIntervals = useMemo(() => {
        const resolution = 24 * 60; // Check every minute
        const activeCounts = new Array(resolution).fill(0);
        
        sessions.forEach(session => {
            const intervals = getIntervals(session);
            intervals.forEach(({ start, end }) => {
                const startMinute = Math.floor(start * 60);
                const endMinute = Math.ceil(end * 60);
                for (let i = startMinute; i < endMinute; i++) {
                    activeCounts[i % resolution]++;
                }
            });
        });

        const overlaps: {start: number, end: number}[] = [];
        let currentOverlap: {start: number, end: number} | null = null;
        for (let i = 0; i < resolution; i++) {
            if (activeCounts[i] > 1) {
                if (!currentOverlap) {
                    currentOverlap = { start: i, end: i + 1 };
                } else {
                    currentOverlap.end = i + 1;
                }
            } else {
                if (currentOverlap) {
                    overlaps.push({start: currentOverlap.start / 60, end: currentOverlap.end / 60});
                    currentOverlap = null;
                }
            }
        }
        if (currentOverlap) {
            overlaps.push({start: currentOverlap.start / 60, end: currentOverlap.end / 60});
        }
        return overlaps;
    }, [sessions]);

    const BAR_HEIGHT = 12; // Adjusted from 16 to 12
    const BAR_GAP = 8;
    const containerHeight = levelCount * (BAR_HEIGHT + BAR_GAP) - BAR_GAP;

    const renderSessionBar = (session: SessionDetails & { level: number }, key: string, start: number, duration: number) => (
        <div
            key={key}
            className={`absolute h-3 ${session.color} rounded-full transition-all duration-300 transform hover:scale-y-110 cursor-pointer z-[5]`} // h-4 to h-3
            style={{
                top: `${session.level * (BAR_HEIGHT + BAR_GAP)}px`,
                left: `${(start / 24) * 100}%`,
                width: `${(duration / 24) * 100}%`,
            }}
            onMouseMove={(e) => setTooltip({ content: session, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setTooltip(null)}
        ></div>
    );

    return (
        <div className="w-full">
            {tooltip && (
                <div
                    className="fixed bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 text-white p-3 rounded-lg text-sm z-50 pointer-events-none transition-opacity duration-200 shadow-2xl shadow-black/50 animate-fade-in"
                    style={{ 
                        animationDuration: '150ms',
                        top: tooltip.y + 15, 
                        left: tooltip.x + 15,
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${tooltip.content.color}`}></div>
                        <h4 className="font-bold text-base text-zinc-100">{tooltip.content.name}</h4>
                    </div>
                    <div className="space-y-1 text-xs font-mono text-zinc-300">
                        <p><span className="text-zinc-500 mr-1">UTC:</span>   {String(tooltip.content.utcStartHour).padStart(2, '0')}:00 - {String(tooltip.content.utcEndHour).padStart(2, '0')}:00</p>
                        <p><span className="text-zinc-500 mr-1">Local:</span> {tooltip.content.localOpenTime} - {tooltip.content.localCloseTime}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-700/50">
                        <p className={`text-xs font-medium ${statusStyles[tooltip.content.status].text}`}>{tooltip.content.countdown}</p>
                    </div>
                </div>
            )}

            <div className="bg-zinc-950/50 rounded-lg p-4">
                <div className="relative" style={{ height: `${containerHeight}px` }}>
                    {/* Overlap highlights */}
                    {overlapIntervals.map((interval, index) => (
                        <div
                            key={`overlap-${index}`}
                            className="absolute top-0 h-full bg-white/5 rounded-md"
                            style={{
                                left: `${(interval.start / 24) * 100}%`,
                                width: `${((interval.end - interval.start) / 24) * 100}%`,
                            }}
                        ></div>
                    ))}
                    {/* Session bars */}
                    {sessionLevels.map((session) => {
                        const intervals = getIntervals(session);
                        return intervals.map((interval, index) => renderSessionBar(
                            session,
                            `${session.name}-${index}`,
                            interval.start,
                            interval.end - interval.start
                        ));
                    })}
                     
                    {/* Current time marker - Brighter & Thicker Line */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-[calc(100%+16px)] w-1.5 pointer-events-none z-10" // w-1 to w-1.5
                        style={{ left: `${markerPosition}%` }}
                        title="Current UTC Time"
                    >
                        <div className="h-full w-full bg-zinc-100 rounded-full"></div>
                    </div>
                </div>

                {/* Hour labels */}
                <div className="w-full flex justify-between text-xs text-zinc-400 pt-3">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                </div>
            </div>
        </div>
    );
};

export default Timeline;