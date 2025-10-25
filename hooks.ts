import { useState, useEffect } from 'react';
import { type TradingSession } from './types';
import { DEFAULT_SESSIONS } from './constants';

const LOCAL_STORAGE_KEY = 'trading-sessions-v2';

// Generic hook to persist state in localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue] as const;
}

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
    
    const resetSessions = () => {
        setSessions(DEFAULT_SESSIONS);
    };

    return { sessions, addSession, updateSession, deleteSession, resetSessions };
}