
import React, { useMemo } from 'react';

interface ClockProps {
    time: Date;
    timezone: string;
}

const Clock: React.FC<ClockProps> = ({ time, timezone }) => {
    const formattedTime = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone
        }).format(time);
    }, [time, timezone]);

    const timezoneOffset = useMemo(() => {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'short',
            });
            const parts = formatter.formatToParts(time);
            const tzNamePart = parts.find(part => part.type === 'timeZoneName');
            return tzNamePart ? tzNamePart.value : '';
        } catch (error) {
            return 'Invalid Timezone';
        }
    }, [time, timezone]);

    return (
        <div className="text-center">
            <h2 className="text-6xl sm:text-7xl font-light tracking-tight text-zinc-100 font-mono">
                {formattedTime}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{timezone.replace(/_/g, ' ')} ({timezoneOffset})</p>
        </div>
    );
};

export default Clock;
