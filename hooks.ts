import { useState, useEffect } from 'react';
import { type TradingSession } from './types';
import { DEFAULT_SESSIONS } from './constants';

const LOCAL_STORAGE_KEY = 'trading-sessions-v2';

export function useSessions() {
    const [sessions, setSessions] = useState<TradingSession[]>(() => {
        try {
            const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (item) {
                const parsed = JSON.parse(item);
                // Basic validation to ensure stored data has the new `id` field
                if (Array.isArray(parsed) && parsed.every(s => 'id' in s)) {
                    return parsed;
                }
            }
            return DEFAULT_SESSIONS;
        } catch (error) {
            console.error("Failed to load sessions from localStorage", error);
            return DEFAULT_SESSIONS;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error("Failed to save sessions to localStorage", error);
        }
    }, [sessions]);

    const addSession = (sessionData: Omit<TradingSession, 'id'>) => {
        const newSession: TradingSession = { ...sessionData, id: crypto.randomUUID() };
        setSessions(prev => [...prev, newSession]);
    };

    const updateSession = (updatedSession: TradingSession) => {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    const deleteSession = (sessionId: string) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    };
    
    return { sessions, addSession, updateSession, deleteSession };
}