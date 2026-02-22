import { Flame, Heart, Trophy } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export const Header = () => {
    const { hearts, xp, streak } = useUser();
    const { theme } = useTheme();

    return (
        <View style={styles(theme).container}>
            {/* Streak */}
            <View style={styles(theme).statContainer}>
                <Flame color={theme.colors.primary} size={24} />
                <Text style={styles(theme).statText}>{streak}</Text>
            </View>

            {/* XP */}
            <View style={styles(theme).statContainer}>
                <Trophy color={theme.colors.nodeCompleted} size={24} />
                <Text style={styles(theme).statText}>{xp}</Text>
            </View>

            {/* Hearts */}
            <View style={styles(theme).statContainer}>
                <Heart color={theme.colors.primary} size={24} fill={theme.colors.primary} />
                <Text style={styles(theme).statText}>{hearts}</Text>
            </View>
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        // Add simple shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    statText: {
        ...theme.typography.body,
        fontSize: 18,
        color: theme.colors.primary,
    }
});
