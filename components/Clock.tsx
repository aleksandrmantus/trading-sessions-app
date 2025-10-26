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
            <div className="inline-flex items-center gap-2.5">
                <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-2xl font-medium">
                    {timeString}
                </h1>
                
                <button 
                    onClick={onTimezoneClick}
                    className="inline-flex items-center h-5 group rounded-md px-1.5 transition-colors duration-150 bg-zinc-200/60 dark:bg-zinc-700/40 hover:bg-zinc-200 dark:hover:bg-zinc-700/70"
                    style={{ transform: 'translateY(2px)' }}
                    aria-label={`Current timezone: ${timezoneAbbr}. Click to change.`}
                >
                    <span className="text-xs font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
                        {timezoneAbbr}
                    </span>
                </button>

                <span 
                    className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400/80"
                    style={{ transform: 'translateY(2px)' }}
                >
                    {dayString}
                </span>
            </div>
        );
    }

    // --- NORMAL MODE: FIXED VERSION ---
    const { timezoneDisplay } = useMemo(() => {
        try {
            const display = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
            return { timezoneDisplay: display };
        } catch (error) {
            console.error("Invalid Timezone for offset:", timezone);
            return { timezoneDisplay: timezone.replace(/_/g, ' ') };
        }
    }, [timezone]);
    
    const dateString = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone: timezone,
        }).format(time);
    }, [time, timezone]);

    return (
        <div className="text-center space-y-2">
            {/* 1. Large clock (non-clickable) */}
            <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-6xl lg:text-7xl font-light">
                {timeString}
            </h1>
            
            {/* 2. Date string (non-clickable) */}
            <p className="font-sans text-lg text-zinc-500 dark:text-zinc-400 -mt-1">
                {dateString}
            </p>

            {/* 3. Timezone button (only clickable part) */}
            <button 
                onClick={onTimezoneClick}
                className="w-full max-w-xs mx-auto rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors py-1.5 text-sm mt-1 font-mono"
                aria-label={`Current timezone: ${timezoneDisplay}. Click to change.`}
            >
                {timezoneDisplay} ({timezoneAbbr})
            </button>
        </div>
    );
};

export default Clock;