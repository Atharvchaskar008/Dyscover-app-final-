import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { loginUser } from '../../src/services/firebase';

export default function LoginScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Please enter your email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loginUser(email.trim(), password);
            router.replace('/');
        } catch (err: any) {
            console.log(err.code);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid email or password. Please try again or Sign Up.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed login attempts. Please try again later.');
            } else {
                setError(err.message || 'Failed to sign in');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles(theme).container}>
            <View style={styles(theme).content}>
                <View style={styles(theme).headerContainer}>
                    <Text style={styles(theme).title}>Dyscover</Text>
                    <Text style={styles(theme).subtitle}>Welcome back! Let's continue learning.</Text>
                </View>

                {error ? (
                    <View style={styles(theme).errorContainer}>
                        <Text style={styles(theme).errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles(theme).formContainer}>
                    <Text style={styles(theme).label}>Email</Text>
                    <TextInput
                        style={styles(theme).input}
                        placeholder="your@email.com"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles(theme).label}>Password</Text>
                    <View style={styles(theme).passwordContainer}>
                        <TextInput
                            style={[styles(theme).input, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles(theme).eyeIcon}
                        >
                            {showPassword ? (
                                <EyeOff color={theme.colors.textSecondary} size={20} />
                            ) : (
                                <Eye color={theme.colors.textSecondary} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles(theme).primaryBtn}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles(theme).primaryBtnText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles(theme).secondaryBtn}
                        onPress={() => router.push('/signup')}
                        disabled={loading}
                    >
                        <Text style={styles(theme).secondaryBtnText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.xl,
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl * 1.5,
    },
    title: {
        ...theme.typography.h1,
        fontSize: 42,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        gap: theme.spacing.md,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.textPrimary,
        marginLeft: 4,
        marginBottom: -4,
    },
    input: {
        backgroundColor: theme.colors.white,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 14,
        ...theme.typography.body,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
    },
    eyeIcon: {
        padding: 4,
    },
    primaryBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.circle,
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    primaryBtnText: {
        ...theme.typography.body,
        color: theme.colors.white,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    secondaryBtnText: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    errorText: {
        color: '#EF4444',
        ...theme.typography.caption,
        textAlign: 'center',
    }
});
