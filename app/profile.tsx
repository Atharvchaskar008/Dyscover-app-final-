import { useRouter } from 'expo-router';
import { ArrowLeft, LogOut, Settings, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { logoutUser } from '../src/services/firebase';

export default function ProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logoutUser();
            // The router will automatically redirect to Login via our RouteGuard in _layout
        } catch (error) {
            console.error('Logout Failed', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const displayName = user?.displayName || 'Learner';
    const email = user?.email || 'Not signed in';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>

                <View style={styles(theme).profileHeader}>
                    <View style={styles(theme).avatarCircle}>
                        <Text style={styles(theme).avatarText}>{initial}</Text>
                    </View>
                    <Text style={styles(theme).userName}>{displayName}</Text>
                    <Text style={styles(theme).userEmail}>{email}</Text>
                </View>

                <BentoCard>
                    <TouchableOpacity style={styles(theme).menuItem}>
                        <View style={styles(theme).menuIcon}>
                            <User color={theme.colors.textPrimary} size={20} />
                        </View>
                        <Text style={styles(theme).menuText}>Account Details</Text>
                    </TouchableOpacity>

                    <View style={styles(theme).divider} />

                    <TouchableOpacity style={styles(theme).menuItem}>
                        <View style={styles(theme).menuIcon}>
                            <Settings color={theme.colors.textPrimary} size={20} />
                        </View>
                        <Text style={styles(theme).menuText}>Preferences</Text>
                    </TouchableOpacity>

                    <View style={styles(theme).divider} />

                    <TouchableOpacity style={styles(theme).menuItem} onPress={handleLogout} disabled={isLoggingOut}>
                        <View style={styles(theme).menuIcon}>
                            <LogOut color={theme.colors.error} size={20} />
                        </View>
                        <Text style={[styles(theme).menuText, { color: theme.colors.error }]}>
                            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                        </Text>
                    </TouchableOpacity>
                </BentoCard>

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
    profileHeader: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarText: {
        ...theme.typography.h1,
        color: '#FFFFFF', // Forced white instead of theme.colors.white to avoid dark mode conflicts
        fontSize: 40,
    },
    userName: {
        ...theme.typography.h2,
        marginBottom: 4,
        color: theme.colors.textPrimary,
    },
    userEmail: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    menuText: {
        ...theme.typography.body,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 4,
    }
});
