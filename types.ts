
export interface TradingSession {
    id: string;
    name: string;
    market: string;
    utcStartHour: number;
    utcEndHour: number;
    color: string;
}

export type SessionStatus = 'active' | 'active-closing' | 'upcoming' | 'upcoming-soon' | 'closed';

export interface SessionDetails extends TradingSession {
    status: SessionStatus;
    countdown: string;
    localOpenTime: string;
    localCloseTime: string;
    isOverlapping?: boolean;
}