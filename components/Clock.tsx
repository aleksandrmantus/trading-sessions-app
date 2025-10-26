import React, { useMemo } from 'react';

interface ClockProps {
    time: Date;
    timezone: string;
    onTimezoneClick: () => void;
    isCompact: boolean;
    isTimezonePickerVisible?: boolean;
}

const Clock: React.FC<ClockProps> = ({ time, timezone, onTimezoneClick, isCompact, isTimezonePickerVisible }) => {
    const isLocalTime = timezone === 'local';

    const timeString = useMemo(() => {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: isCompact ? undefined : '2-digit',
            hour12: false,
            timeZone: isLocalTime ? undefined : timezone,
        }).format(time);
    }, [time, timezone, isCompact, isLocalTime]);

    const dayString = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: isLocalTime ? undefined : timezone,
        }).format(time);
    }, [time, timezone, isLocalTime]);

    const { timezoneDisplay, timezoneAbbr } = useMemo(() => {
        const tzForFormatting = isLocalTime ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone;
        try {
            const parts = new Intl.DateTimeFormat('en-US', { timeZone: tzForFormatting, timeZoneName: 'short' }).formatToParts(time);
            const abbr = parts.find(part => part.type === 'timeZoneName')?.value || tzForFormatting;
            const display = tzForFormatting.split('/').pop()?.replace(/_/g, ' ') || tzForFormatting;
            return { timezoneDisplay: isLocalTime ? 'Local' : display, timezoneAbbr: abbr };
        } catch (e) {
            return { timezoneDisplay: isLocalTime ? 'Local' : timezone, timezoneAbbr: 'N/A' };
        }
    }, [time, timezone, isLocalTime]);

    // --- COMPACT MODE ---
    if (isCompact) {
        return (
            <div className="inline-flex items-baseline gap-2.5">
                <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-2xl font-medium">
                    {timeString}
                </h1>
                
                {isTimezonePickerVisible && (
                    <span 
                        onClick={onTimezoneClick}
                        className="text-sm font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-150 cursor-pointer"
                        aria-label={`Current timezone: ${timezoneAbbr}. Click to change.`}
                    >
                        {timezoneAbbr}
                    </span>
                )}

                <span className="text-sm font-semibold tracking-wider text-zinc-400 dark:text-zinc-500">
                    {dayString}
                </span>
            </div>
        );
    }

    // --- NORMAL MODE ---
    const dateString = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone: isLocalTime ? undefined : timezone,
        }).format(time);
    }, [time, timezone, isLocalTime]);

    return (
        <div className="text-center space-y-2">
            <h1 className="font-mono text-zinc-900 dark:text-zinc-100 tracking-tight text-6xl lg:text-7xl font-light">
                {timeString}
            </h1>
            
            <p className="font-sans text-lg text-zinc-500 dark:text-zinc-400 -mt-1">
                {dateString}
            </p>

            {isTimezonePickerVisible && (
                 <button 
                    onClick={onTimezoneClick}
                    className="inline-block mx-auto rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors px-3 py-1.5 text-sm mt-1 font-mono"
                    aria-label={`Current timezone: ${timezoneDisplay}. Click to change.`}
                >
                    {timezoneDisplay} ({timezoneAbbr})
                </button>
            )}
        </div>
    );
};

export default Clock;