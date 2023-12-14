import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, Dispatch<SetStateAction<T>>] {
    const state = useState<T>(() => {
        try {
            const value = localStorage.getItem(key);
            if (value) return JSON.parse(value) as T;
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }

        return defaultState;
    });
    const value = key ? state[0] : defaultState;

    const isFirstRenderRef = useRef(true);
    useEffect(() => {
        if (!key) return;

        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        try {
            if (value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }
    }, [value, key]);

    return state;
}
