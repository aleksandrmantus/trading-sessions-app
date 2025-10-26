import { type TradingSession } from './types';

export const DEFAULT_SESSIONS: TradingSession[] = [
    { id: 'syd', name: 'Sydney', market: 'Australia', utcStartHour: 22, utcEndHour: 7, color: 'bg-violet-500' },
    { id: 'tok', name: 'Tokyo', market: 'Asia', utcStartHour: 0, utcEndHour: 9, color: 'bg-rose-500' },
    { id: 'lon', name: 'London', market: 'Europe', utcStartHour: 8, utcEndHour: 17, color: 'bg-cyan-500' },
    { id: 'nyc', name: 'New York', market: 'N. America', utcStartHour: 13, utcEndHour: 22, color: 'bg-emerald-500' }
];

export const SESSION_COLORS = [
    { name: 'Violet', class: 'bg-violet-500' },
    { name: 'Rose', class: 'bg-rose-500' },
    { name: 'Cyan', class: 'bg-cyan-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Sky', class: 'bg-sky-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Lime', class: 'bg-lime-500' },
    { name: 'Pink', class: 'bg-pink-500' },
];

function getLocalTimezoneData() {
    try {
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offsetInMinutes = new Date().getTimezoneOffset();
        const offsetInHours = -offsetInMinutes / 60;
        
        const sign = offsetInHours >= 0 ? '+' : '-';
        const absHours = Math.abs(offsetInHours);
        const hours = Math.floor(absHours);
        const minutes = Math.round((absHours - hours) * 60);
        
        const gmtString = `GMT${sign}${hours}${minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : ''}`;

        return {
            value: 'local',
            label: `${systemTimezone.replace(/_/g, ' ')} (${gmtString})`,
            gmt: gmtString
        };
    } catch (e) {
        // Fallback for older environments
        return { value: 'local', label: 'Local System Time', gmt: 'Local' };
    }
}
export const LOCAL_TIMEZONE_DATA = getLocalTimezoneData();


export const TIMEZONES: string[] = [
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/New_York',
    'Asia/Dubai',
    'Asia/Hong_Kong',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/Berlin',
    'Europe/London',
    'UTC',
].sort();