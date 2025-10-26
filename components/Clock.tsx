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

    const dayString = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: timezone,
        }).format(time);
    }, [time, timezone]);

    if (isCompact) {
        return (
            <div className="inline-flex items-baseline gap-2.5 rounded-lg p-1.5 -ml-1.5">
                <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-2xl font-medium">
                    {timeString}
                </h1>
                
                <button 
                    onClick={onTimezoneClick}
                    className="group rounded-md px-1.5 py-0.5 transition-colors duration-150 bg-zinc-200/60 dark:bg-zinc-700/40 hover:bg-zinc-200 dark:hover:bg-zinc-700/70"
                    style={{ transform: 'translateY(-1px)' }}
                    aria-label={`Current timezone: ${timezoneAbbr}. Click to change.`}
                >
                    <span className="text-xs font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
                        {timezoneAbbr}
                    </span>
                </button>

                <span 
                    className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400/80"
                    style={{ transform: 'translateY(-1px)' }}
                >
                    {dayString}
                </span>
            </div>
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
    
    const fullDayString = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            timeZone: timezone,
        }).format(time);
    }, [time, timezone]);

    return (
        <div className="text-center">
            <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-6xl lg:text-7xl font-light">
                {timeString}
            </h1>
            <button 
                onClick={onTimezoneClick}
                className="w-full rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors py-1 text-sm mt-1 font-mono"
                aria-label={`Current day: ${fullDayString}. Current timezone: ${timezoneDisplay}. Click to change.`}
            >
                {fullDayString} &middot; {timezoneDisplay} ({timezoneAbbr})
            </button>
        </div>
    );
};

export default Clock;