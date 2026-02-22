import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Book, Flame } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { ProgressCalendar } from '../src/components/ProgressCalendar';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/context/UserContext';

export default function StatsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { streak, storiesRead, badges } = useUser();

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Your Progress</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>

                <View style={styles(theme).statsRow}>
                    <BentoCard style={styles(theme).statCard} glowColor="#EF4444">
                        <Flame color="#EF4444" size={28} style={styles(theme).statIcon} />
                        <Text style={styles(theme).statValue}>{streak}</Text>
                        <Text style={styles(theme).statLabel}>Day Streak</Text>
                    </BentoCard>

                    <BentoCard style={styles(theme).statCard} glowColor="#3B82F6">
                        <Book color="#3B82F6" size={28} style={styles(theme).statIcon} />
                        <Text style={styles(theme).statValue}>{storiesRead}</Text>
                        <Text style={styles(theme).statLabel}>Stories Read</Text>
                    </BentoCard>

                    <BentoCard style={styles(theme).statCard} glowColor="#F59E0B">
                        <Award color="#F59E0B" size={28} style={styles(theme).statIcon} />
                        <Text style={styles(theme).statValue}>{badges}</Text>
                        <Text style={styles(theme).statLabel}>Badges</Text>
                    </BentoCard>
                </View>

                <View style={styles(theme).calendarSection}>
                    <Text style={styles(theme).sectionTitle}>ACTIVITY CALENDAR</Text>
                    <ProgressCalendar />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        color: theme.colors.textPrimary,
    },
    content: {
        padding: theme.spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    statIcon: {
        marginBottom: theme.spacing.sm,
    },
    statValue: {
        ...theme.typography.h1,
        fontSize: 24,
        marginBottom: 2,
        color: theme.colors.textPrimary,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    calendarSection: {
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontSize: 12,
        marginBottom: theme.spacing.md,
        marginLeft: 4,
    }
});
