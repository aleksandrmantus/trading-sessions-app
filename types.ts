
export interface TradingSession {
    id: string;
    name: string;
    market: string;
    utcStartHour: number;
    utcEndHour: number;
    color: string;
}

export type SessionStatus = 'Active' | 'Upcoming' | 'Closed';

export interface SessionDetails extends TradingSession {
    status: SessionStatus;
    countdown: string;
    localOpenTime: string;
    localCloseTime: string;
}