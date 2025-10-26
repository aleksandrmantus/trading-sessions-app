
import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { type TradingSession, type SessionDetails } from '../types';

export interface TooltipData {
    content: SessionDetails;
    x: number;
    y: number;
}
interface TimelineProps {
    sessions: TradingSession[];
    sessionDetails: SessionDetails[];
    now: Date;
    timezone: string;
    isCompact: boolean;
    showGoldenHours: boolean;
    showMarketPulse: boolean;
    tooltip: TooltipData | null;
    onSetTooltip: (data: TooltipData | null) => void;
}

const getLocalIntervals = (session: TradingSession, offset: number): { start: number; end: number }[] => {
    const startUTC = session.utcStartHour;
    const endUTC = session.utcEndHour;
    const duration = endUTC >= startUTC ? endUTC - startUTC : (24 - startUTC) + endUTC;
    if (duration === 0) return [];
    if (duration >= 24) return [{ start: 0, end: 24 }];
    const localStart = startUTC + offset;
    const startMod = (localStart % 24 + 24) % 24;
    const endMod = ((localStart + duration) % 24 + 24) % 24;
    if (startMod === endMod) return [{ start: 0, end: 24 }];
    if (startMod < endMod) {
        return [{ start: startMod, end: endMod }];
    } else {
        return [{ start: startMod, end: 24 }, { start: 0, end: endMod }];
    }
};

const doIntervalsOverlap = (i1: { start: number; end: number }, i2: { start: number; end: number }): boolean => {
    return Math.max(i1.start, i2.start) < Math.min(i1.end, i2.end);
};

const statusStyles: Record<SessionDetails['status'], { text: string }> = {
    Active: { text: 'text-green-600 dark:text-green-300' },
    Upcoming: { text: 'text-yellow-600 dark:text-yellow-300' },
    Closed: { text: 'text-zinc-500 dark:text-zinc-400' },
};

const Timeline: React.FC<TimelineProps> = ({ sessions, sessionDetails, now, timezone, isCompact, showGoldenHours, showMarketPulse, tooltip, onSetTooltip }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0, transition: 'opacity 0.2s, transform 0.2s' });

    const utcOffset = useMemo(() => {
        try {
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            return (tzDate.getTime() - utcDate.getTime()) / (3600 * 1000);
        } catch (e) { return 0; }
    }, [now, timezone]);

    const currentUTCHourWithMinutes = now.getUTCHours() + now.getUTCMinutes() / 60;
    const normalizedLocalHour = (currentUTCHourWithMinutes + utcOffset + 24) % 24;
    const markerPosition = (normalizedLocalHour / 24) * 100;

    useLayoutEffect(() => {
        if (tooltip && tooltipRef.current) {
            const { width, height } = tooltipRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;
            const margin = 15;
            let top = tooltip.y + margin;
            let left = tooltip.x + margin;
            if (left + width > innerWidth - margin) left = tooltip.x - width - margin;
            if (top + height > innerHeight - margin) top = tooltip.y - height - margin;
            setTooltipStyle({
                opacity: 1,
                transform: `translate(${left}px, ${top}px)`,
                transition: 'opacity 0.2s, transform 0.2s',
            });
        } else {
            setTooltipStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [tooltip]);

    const { sessionLevels, levelCount } = useMemo(() => {
        const levels: (SessionDetails & { intervals: { start: number; end: number }[] })[][] = [];
        const sortedSessions = [...sessionDetails].sort((a, b) => a.utcStartHour - b.utcStartHour);
        const sessionsWithLevels: (SessionDetails & { level: number })[] = [];

        sortedSessions.forEach(session => {
            const sessionIntervals = getLocalIntervals(session, utcOffset);
            let placedLevel = -1;

            for (let i = 0; i < levels.length; i++) {
                const levelOccupied = levels[i].some(placedSession => {
                    return sessionIntervals.some(interval1 => 
                        placedSession.intervals.some(interval2 => doIntervalsOverlap(interval1, interval2))
                    );
                });

                if (!levelOccupied) {
                    levels[i].push({ ...session, intervals: sessionIntervals });
                    placedLevel = i;
                    break;
                }
            }

            if (placedLevel === -1) {
                placedLevel = levels.length;
                levels.push([{ ...session, intervals: sessionIntervals }]);
            }
            sessionsWithLevels.push({ ...session, level: placedLevel });
        });
        return { sessionLevels: sessionsWithLevels, levelCount: Math.max(1, levels.length) };
    }, [sessionDetails, utcOffset]);

    const goldenHourIntervals = useMemo(() => {
        if (!showGoldenHours) return [];
        const activeSessions = sessionDetails.filter(s => s.status === 'Active');
        const resolution = 24 * 60;
        const activeCounts = new Array(resolution).fill(0);
        activeSessions.forEach(session => {
            const intervals = getLocalIntervals(session, utcOffset);
            intervals.forEach(({ start, end }) => {
                const startMinute = Math.floor(start * 60);
                const endMinute = Math.ceil(end * 60);
                for (let i = startMinute; i < endMinute; i++) {
                    activeCounts[i % resolution]++;
                }
            });
        });
        const overlaps: { start: number, end: number }[] = [];
        let currentOverlap: { start: number, end: number } | null = null;
        for (let i = 0; i < resolution; i++) {
            if (activeCounts[i] > 1) {
                if (!currentOverlap) currentOverlap = { start: i, end: i + 1 };
                else currentOverlap.end = i + 1;
            } else {
                if (currentOverlap) {
                    overlaps.push({ start: currentOverlap.start / 60, end: currentOverlap.end / 60 });
                    currentOverlap = null;
                }
            }
        }
        if (currentOverlap) {
            overlaps.push({ start: currentOverlap.start / 60, end: currentOverlap.end / 60 });
        }
        return overlaps;
    }, [sessionDetails, utcOffset, showGoldenHours]);
    
    const isCurrentlyGoldenHour = useMemo(() => {
        if (!showGoldenHours) return false;
        return goldenHourIntervals.some(interval => 
            normalizedLocalHour >= interval.start && normalizedLocalHour < interval.end
        );
    }, [goldenHourIntervals, normalizedLocalHour, showGoldenHours]);

    const BAR_HEIGHT = isCompact ? 8 : 12;
    const BAR_GAP = isCompact ? 4 : 8;
    const containerHeight = levelCount * (BAR_HEIGHT + BAR_GAP) - (levelCount > 0 ? BAR_GAP : 0);

    const renderSessionBar = (session: SessionDetails & { level: number }, key: string, interval: { start: number, end: number }) => {
        const isCurrentlyActiveBar = normalizedLocalHour >= interval.start && normalizedLocalHour < interval.end;
        const shouldPulse = isCurrentlyActiveBar && showMarketPulse;

        return (
            <div
                key={key}
                className={`absolute rounded-full transition-all duration-300 cursor-pointer group ${isCompact ? 'h-2' : 'h-3'} ${isCurrentlyActiveBar ? 'z-20' : 'z-10'}`}
                style={{
                    top: `${session.level * (BAR_HEIGHT + BAR_GAP)}px`,
                    left: `${(interval.start / 24) * 100}%`,
                    width: `${((interval.end - interval.start) / 24) * 100}%`,
                }}
                onMouseMove={(e) => onSetTooltip({ content: session, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => onSetTooltip(null)}
            >
                <div className={`absolute inset-0 rounded-full ${session.color} transition-transform duration-300 group-hover:scale-y-125 ${shouldPulse ? 'animate-market-pulse' : ''}`}></div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div ref={tooltipRef} className="fixed top-0 left-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white p-3 rounded-lg text-sm z-40 pointer-events-none shadow-2xl" style={tooltipStyle}>
                {tooltip && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${tooltip.content.color}`}></div>
                            <h4 className="font-bold text-base">{tooltip.content.name}</h4>
                        </div>
                        <div className="space-y-1 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                            <p><span className="text-zinc-400 dark:text-zinc-500 mr-1">UTC:</span> {String(tooltip.content.utcStartHour).padStart(2, '0')}:00 - {String(tooltip.content.utcEndHour).padStart(2, '0')}:00</p>
                            <p><span className="text-zinc-400 dark:text-zinc-500 mr-1">Local:</span> {tooltip.content.localOpenTime} - {tooltip.content.localCloseTime}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-700/50">
                            <p className={`text-xs font-medium ${statusStyles[tooltip.content.status].text}`}>{tooltip.content.countdown}</p>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-950/50 rounded-lg p-2">
                <div className="relative" style={{ height: `${containerHeight}px` }}>
                    {sessionLevels.map((session) => {
                        const intervals = getLocalIntervals(session, utcOffset);
                        return intervals.map((interval, index) => renderSessionBar(session, `${session.id}-${index}`, interval));
                    })}

                    <div className="absolute top-[-8px] -translate-x-1/2 h-[calc(100%+8px)] w-1.5 pointer-events-none z-30" style={{ left: `${markerPosition}%` }}>
                        <div className={`h-full w-full rounded-full shadow-lg transition-colors duration-300 bg-zinc-800 dark:bg-zinc-100`}></div>
                        {isCurrentlyGoldenHour && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 animate-golden-hour-pulse"></div>
                        )}
                    </div>
                </div>

                <div className="w-full flex justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 font-mono">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
