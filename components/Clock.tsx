
import React, { useMemo } from 'react';

interface ClockProps {
    time: Date;
    timezone: string;
    onTimezoneClick: () => void;
    isCompact: boolean;
}

const Clock: React.FC<ClockProps> = ({ time, timezone, onTimezoneClick, isCompact }) => {
    const timezoneAbbr = useMemo(() => {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'short',
            }).formatToParts(time);
            return parts.find(part => part.type === 'timeZoneName')?.value || timezone;
        } catch (e) {
            return timezone;
        }
    }, [time, timezone]);

    const timeString = useMemo(() => {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: isCompact ? undefined : '2-digit',
            hour12: false,
            timeZone: timezone,
        }).format(time);
    }, [time, timezone, isCompact]);

    if (isCompact) {
        // --- COMPACT MODE: FINAL POLISHED VERSION ---
        return (
            <button 
                onClick={onTimezoneClick} 
                className="inline-flex items-baseline gap-2 rounded-lg p-1.5 -ml-1.5 transition-colors duration-150 group hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                aria-label={`Current time: ${timeString} in ${timezoneAbbr}. Click to change timezone.`}
            >
                <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-2xl font-medium">
                    {timeString}
                </h1>
                <span 
                    className="text-xs font-semibold tracking-wider bg-zinc-200/60 dark:bg-zinc-700/40 text-zinc-600 dark:text-zinc-400 rounded-md px-1.5 py-0.5 transition-colors duration-150 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700/70"
                    style={{ transform: 'translateY(-1px)' }} 
                >
                    {timezoneAbbr}
                </span>
            </button>
        );
    }

    // --- NORMAL MODE ---
    const { timezoneDisplay } = useMemo(() => {
        try {
            const display = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
            return { timezoneDisplay: display };
        } catch (error) {
            console.error("Invalid Timezone for offset:", timezone);
            return { timezoneDisplay: timezone.replace(/_/g, ' ') };
        }
    }, [timezone]);
    
    return (
        <div className="text-center">
            <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-6xl lg:text-7xl font-light">
                {timeString}
            </h1>
            <button 
                onClick={onTimezoneClick}
                className="w-full rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors py-1 text-sm mt-1 font-mono"
                aria-label={`Current timezone: ${timezoneDisplay}. Click to change.`}
            >
                {timezoneDisplay} ({timezoneAbbr})
            </button>
        </div>
    );
};

export default Clock;
