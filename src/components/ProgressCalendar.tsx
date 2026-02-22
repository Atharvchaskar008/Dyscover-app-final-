import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Dynamic Data based on the user's logged active dates
const getCalendarMatrix = (activeDates: string[]) => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    // JS getDay() is 0 for Sunday
    let startDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    // We want Monday = 0, Sunday = 6
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const matrix = [];
    let currentDay = 1;

    // Convert activeDates to a Set of just the day numbers belonging to THIS month
    const thisMonthPrefix = today.toISOString().substring(0, 8); // e.g. "2026-10-"
    const activeDaysSet = new Set(
        activeDates
            .filter(d => d.startsWith(thisMonthPrefix))
            .map(d => parseInt(d.substring(8, 10), 10))
    );

    for (let row = 0; row < 6; row++) {
        const week = [];
        for (let col = 0; col < 7; col++) {
            if ((row === 0 && col < startOffset) || currentDay > daysInMonth) {
                week.push(null);
            } else {
                let level = 0;
                if (activeDaysSet.has(currentDay)) {
                    level = 2; // Medium orange meaning active
                }

                week.push({ day: currentDay, level });
                currentDay++;
            }
        }
        matrix.push(week);
        if (currentDay > daysInMonth) break;
    }
    return matrix;
};

export const ProgressCalendar = () => {
    const { theme } = useTheme();
    const { activeDates } = useUser();

    const matrix = getCalendarMatrix(activeDates);

    // Get formatted current month name
    const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return '#FFE0C7'; // Soft orange
            case 2: return theme.colors.primary; // Medium orange
            case 3: return '#C2410C'; // Intense orange
            default: return 'transparent'; // Rest
        }
    };

    const getTextColor = (level: number) => {
        return level >= 2 ? theme.colors.white : theme.colors.textPrimary;
    };

    return (
        <View style={styles(theme).container}>
            <View style={styles(theme).header}>
                <Text style={styles(theme).headerSubtitle}>THIS MONTH</Text>
                <Text style={styles(theme).headerTitle}>{monthName}</Text>
            </View>

            <View style={styles(theme).grid}>
                {/* Weekday headers */}
                <View style={styles(theme).row}>
                    {weekDays.map((day, i) => (
                        <Text key={i} style={styles(theme).dayLabel}>{day}</Text>
                    ))}
                </View>

                {/* Calendar days */}
                {matrix.map((week, rIndex) => (
                    <View key={rIndex} style={styles(theme).row}>
                        {week.map((cell, cIndex) => (
                            <View
                                key={cIndex}
                                style={[
                                    styles(theme).cell,
                                    cell ? { backgroundColor: getLevelColor(cell.level) } : {}
                                ]}
                            >
                                {cell && (
                                    <Text style={[styles(theme).cellText, { color: getTextColor(cell.level) }]}>
                                        {cell.day}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles(theme).legend}>
                <Text style={styles(theme).legendText}>Rest</Text>
                <View style={[styles(theme).legendDot, { backgroundColor: theme.colors.border }]} />
                <View style={[styles(theme).legendDot, { backgroundColor: '#FFE0C7' }]} />
                <View style={[styles(theme).legendDot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles(theme).legendDot, { backgroundColor: '#C2410C' }]} />
                <Text style={[styles(theme).legendText, { marginLeft: 4 }]}>More focus</Text>
            </View>
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        marginBottom: theme.spacing.md,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        fontSize: 10,
        letterSpacing: 1,
        color: theme.colors.textSecondary,
    },
    headerTitle: {
        ...theme.typography.h2,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    grid: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        width: 32,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    cell: {
        width: 32,
        height: 32,
        borderRadius: theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border, // Use main border color for higher visibility
    },
    cellText: {
        ...theme.typography.body,
        fontSize: 14,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: theme.spacing.lg,
    },
    legendText: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textSecondary,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
    }
});
