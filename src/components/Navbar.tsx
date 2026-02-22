import { Href, usePathname, useRouter } from 'expo-router';
import { BarChart2, Home, Moon, UploadCloud } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ activeTab = 'home', onTabChange }: { activeTab?: 'home' | 'features', onTabChange?: (tab: 'home' | 'features') => void }) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    // Derived active tab based on route if not controlled
    const isStats = pathname === '/stats';
    const isUpload = pathname === '/upload';
    const isHome = pathname === '/' && activeTab === 'home';
    const isFeatures = pathname === '/' && activeTab === 'features';
    return (
        <View style={styles(theme).container}>
            {/* Brand */}
            <View style={styles(theme).brand}>
                <Text style={styles(theme).logoText}>DYSCOVER</Text>
                <Text style={styles(theme).subtitle}>INCLUSIVE SUPPORT</Text>
            </View>

            {/* Nav Actions (Simulated Dock) */}
            <View style={styles(theme).actions}>
                <TouchableOpacity
                    style={[styles(theme).iconBtn, isHome && styles(theme).activeBtn]}
                    onPress={() => {
                        if (pathname !== '/') router.push('/');
                        else onTabChange?.('home');
                    }}
                >
                    <Home color={isHome ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles(theme).iconBtn, isUpload && styles(theme).activeBtn]}
                    onPress={() => router.push('/upload' as Href)}
                >
                    <UploadCloud color={isUpload ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles(theme).iconBtn, isStats && styles(theme).activeBtn]}
                    onPress={() => router.push('/stats' as Href)}
                >
                    <BarChart2 color={isStats ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles(theme).iconBtn} onPress={toggleTheme}>
                    <Moon color={isDark ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles(theme).avatarBtn} onPress={() => router.push('/profile' as Href)}>
                    <Text style={styles(theme).avatarText}>L</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 50,
    },
    brand: {
        flexDirection: 'column',
    },
    logoText: {
        ...theme.typography.h1,
        fontSize: 20,
        letterSpacing: 0,
        color: theme.colors.textPrimary,
    },
    subtitle: {
        ...theme.typography.caption,
        fontSize: 10,
        letterSpacing: 2,
        color: theme.colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBtn: {
        backgroundColor: theme.colors.primary + '20',
    },
    avatarBtn: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.circle,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing.xs,
    },
    avatarText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    }
});
