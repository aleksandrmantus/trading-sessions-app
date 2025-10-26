
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
            second: isCompact ? undefined : '2-digit', // Hide seconds in compact mode
            hour12: false,
            timeZone: timezone,
        }).format(time);
    }, [time, timezone, isCompact]);

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
        <div className={isCompact ? "text-left" : "text-center"}>
            <h1 className={`
                font-mono text-zinc-900 dark:text-zinc-100 tracking-tight
                transition-all duration-300
                ${isCompact ? 'text-2xl font-medium' : 'text-6xl lg:text-7xl font-light'}
            `}>
                {timeString}
            </h1>
            {!isCompact && (
                <button 
                    onClick={onTimezoneClick}
                    className="w-full rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors py-1 text-sm mt-1 font-mono"
                    aria-label={`Current timezone: ${timezoneDisplay}. Click to change.`}
                >
                    {timezoneDisplay} ({timezoneAbbr})
                </button>
            )}
        </div>
    );
};

export default Clock;
