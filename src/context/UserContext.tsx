import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
    hearts: number;
    xp: number;
    streak: number;
    storiesRead: number;
    badges: number;
    activeDates: string[]; // Store YYYY-MM-DD strings
    deductHeart: () => void;
    addXP: (amount: number) => void;
    resetHearts: () => void;
    refreshStreak: () => void;
    logActivity: (type?: 'story' | 'handwriting') => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEYS = {
    HEARTS: '@dyscover_hearts',
    XP: '@dyscover_xp',
    STREAK: '@dyscover_streak',
    STORIES_READ: '@dyscover_stories_read',
    BADGES: '@dyscover_badges',
    ACTIVE_DATES: '@dyscover_active_dates',
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [hearts, setHearts] = useState(5);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(1);
    const [storiesRead, setStoriesRead] = useState(0);
    const [badges, setBadges] = useState(0);
    const [activeDates, setActiveDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedHearts = await AsyncStorage.getItem(STORAGE_KEYS.HEARTS);
                const storedXp = await AsyncStorage.getItem(STORAGE_KEYS.XP);
                const storedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
                const storedStories = await AsyncStorage.getItem(STORAGE_KEYS.STORIES_READ);
                const storedBadges = await AsyncStorage.getItem(STORAGE_KEYS.BADGES);
                const storedDates = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DATES);

                if (storedHearts !== null) setHearts(parseInt(storedHearts, 10));
                if (storedXp !== null) setXp(parseInt(storedXp, 10));
                if (storedStreak !== null) setStreak(parseInt(storedStreak, 10));
                if (storedStories !== null) setStoriesRead(parseInt(storedStories, 10));
                if (storedBadges !== null) setBadges(parseInt(storedBadges, 10));
                if (storedDates) {
                    try {
                        const parsed = JSON.parse(storedDates);
                        if (Array.isArray(parsed)) setActiveDates(parsed);
                    } catch (e) { }
                }
            } catch (error) {
                console.error('Failed to load user data', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const updateStorage = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error(`Failed to save ${key} to storage`, error);
        }
    };

    const deductHeart = () => {
        setHearts(prev => {
            const next = Math.max(0, prev - 1);
            updateStorage(STORAGE_KEYS.HEARTS, next.toString());
            return next;
        });
    };

    const addXP = (amount: number) => {
        setXp(prev => {
            const next = prev + amount;
            updateStorage(STORAGE_KEYS.XP, next.toString());
            // Naive badge logic: 1 badge per 100 xp
            const newBadges = Math.floor(next / 100);
            if (newBadges !== badges) {
                setBadges(newBadges);
                updateStorage(STORAGE_KEYS.BADGES, newBadges.toString());
            }
            return next;
        });
    };

    const resetHearts = () => {
        setHearts(5);
        updateStorage(STORAGE_KEYS.HEARTS, '5');
    };

    const refreshStreak = () => {
        setStreak(prev => {
            const next = prev + 1;
            updateStorage(STORAGE_KEYS.STREAK, next.toString());
            return next;
        });
    };

    const logActivity = (type?: 'story' | 'handwriting') => {
        const today = new Date().toISOString().split('T')[0];

        setActiveDates(prev => {
            if (!prev.includes(today)) {
                const updatedDates = [...prev, today];
                updateStorage(STORAGE_KEYS.ACTIVE_DATES, JSON.stringify(updatedDates));
                refreshStreak(); // Bump streak if it's a new day of activity
                return updatedDates;
            }
            return prev;
        });

        if (type === 'story') {
            setStoriesRead(prev => {
                const next = prev + 1;
                updateStorage(STORAGE_KEYS.STORIES_READ, next.toString());
                return next;
            });
            addXP(20);
        } else if (type === 'handwriting') {
            addXP(15);
        } else {
            addXP(5);
        }
    };

    return (
        <UserContext.Provider value={{
            hearts, xp, streak, storiesRead, badges, activeDates,
            deductHeart, addXP, resetHearts, refreshStreak, logActivity, isLoading
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
