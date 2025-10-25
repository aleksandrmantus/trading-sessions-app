import React, { useMemo } from 'react';

interface ClockProps {
    time: Date;
    timezone: string;
    onTimezoneClick: () => void;
    isCompact: boolean;
}

const Clock: React.FC<ClockProps> = ({ time, timezone, onTimezoneClick, isCompact }) => {
    const timeString = useMemo(() => {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone,
        }).format(time);
    }, [time, timezone]);

    const { timezoneDisplay, timezoneAbbr } = useMemo(() => {
        try {
            const display = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
            const abbr = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'short',
            }).formatToParts(time).find(part => part.type === 'timeZoneName')?.value || '';
            return { timezoneDisplay: display, timezoneAbbr: abbr };
        } catch (error) {
            console.error("Invalid Timezone for offset:", timezone);
            return { timezoneDisplay: timezone.replace(/_/g, ' '), timezoneAbbr: 'Invalid' };
        }
    }, [time, timezone]);

    return (
        <div className="text-center">
            <h1 className={`text-zinc-900 dark:text-zinc-100 font-mono ${isCompact ? 'text-5xl' : 'text-6xl lg:text-7xl'}`}>
                {timeString}
            </h1>
            <button 
                onClick={onTimezoneClick}
                className={`w-full rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors py-1 text-sm font-mono ${isCompact ? 'mt-0' : 'mt-1'}`}
                aria-label={`Current timezone: ${timezoneDisplay}. Click to change.`}
            >
                {timezoneDisplay} ({timezoneAbbr})
            </button>
        </div>
    );
};

export default Clock;