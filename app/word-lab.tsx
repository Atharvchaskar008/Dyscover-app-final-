import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowLeft, Sparkles, Square, Volume2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { useTheme } from '../src/context/ThemeContext';
import { analyzeWord } from '../src/services/gemini';

interface WordAnalysis {
    word: string;
    syllables: string[];
    meaning: string;
    example: string;
}

export default function WordLabScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialWord = typeof params.word === 'string' ? params.word : '';

    const [inputText, setInputText] = useState(initialWord);
    const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialWord) {
            handleAnalyze(initialWord);
        }
    }, [initialWord]);

    const handleAnalyze = async (overrideWord?: string) => {
        const textToUse = overrideWord || inputText;
        const trimmed = textToUse.trim();
        if (!trimmed) return;

        // Extract first word only if they typed a sentence
        const singleWord = trimmed.split(/\s+/)[0];

        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const result = await analyzeWord(singleWord);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'Error analyzing word.');
        } finally {
            setLoading(false);
        }
    };

    const handleReadAloud = async (text: string) => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.05,
            rate: 0.7, // Very slow for spelling/syllables
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false)
        });
    };

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Quick Word Lab</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>
                <Text style={styles(theme).description}>
                    Type any challenging word. We will break it down into syllables and show you what it means.
                </Text>

                <View style={styles(theme).inputArea}>
                    <TextInput
                        style={styles(theme).input}
                        placeholder="e.g. Beautiful, Rhythm..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles(theme).generateBtn}
                        onPress={() => handleAnalyze()}
                        disabled={loading || !inputText.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} size="small" />
                        ) : (
                            <Sparkles color={theme.colors.white} size={20} />
                        )}
                    </TouchableOpacity>
                </View>

                {error ? <Text style={styles(theme).errorText}>{error}</Text> : null}

                {analysis ? (
                    <BentoCard glowColor="#F59E0B" style={styles(theme).resultCard}>

                        <View style={styles(theme).resultHeader}>
                            <Text style={styles(theme).wordTitle}>{analysis.word}</Text>
                            <TouchableOpacity
                                style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]}
                                onPress={() => handleReadAloud(`${analysis.word}. ${analysis.syllables.join(' ')}`)}
                            >
                                {isSpeaking ? (
                                    <Square color={theme.colors.white} size={14} fill={theme.colors.white} />
                                ) : (
                                    <Volume2 color="#F59E0B" size={14} />
                                )}
                                <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>
                                    Hear Word
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles(theme).section}>
                            <Text style={styles(theme).sectionTitle}>Syllables</Text>
                            <View style={styles(theme).syllableContainer}>
                                {analysis.syllables.map((syl, i) => (
                                    <React.Fragment key={i}>
                                        <TouchableOpacity
                                            style={styles(theme).syllableTag}
                                            onPress={() => handleReadAloud(syl)}
                                        >
                                            <Text style={styles(theme).syllableText}>{syl.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                        {i < analysis.syllables.length - 1 && (
                                            <Text style={styles(theme).syllableSeparator}>•</Text>
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>

                        <View style={styles(theme).divider} />

                        <View style={styles(theme).section}>
                            <Text style={styles(theme).sectionTitle}>Meaning</Text>
                            <Text style={styles(theme).bodyText}>{analysis.meaning}</Text>
                        </View>

                        <View style={styles(theme).divider} />

                        <View style={styles(theme).section}>
                            <Text style={styles(theme).sectionTitle}>Example</Text>
                            <Text style={[styles(theme).bodyText, { fontStyle: 'italic', color: theme.colors.textSecondary }]}>
                                &quot;{analysis.example}&quot;
                            </Text>
                        </View>

                    </BentoCard>
                ) : null}

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
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
    },
    inputArea: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.white,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        ...theme.typography.body,
        fontSize: 20, // larger for single words
    },
    generateBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: theme.borderRadius.md,
        width: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
        marginTop: theme.spacing.sm,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    wordTitle: {
        ...theme.typography.h1,
        fontSize: 32,
        color: '#D97706',
        textTransform: 'lowercase',
    },
    ttsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F59E0B15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    ttsBtnActive: {
        backgroundColor: '#EF4444',
    },
    ttsBtnText: {
        color: '#D97706',
        ...theme.typography.caption,
        fontSize: 10,
    },
    ttsBtnTextActive: {
        color: theme.colors.white,
    },
    section: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#D97706',
        marginBottom: 8,
    },
    syllableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    syllableTag: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: '#FDE68A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    syllableText: {
        ...theme.typography.h2,
        fontSize: 24,
        color: theme.colors.textPrimary,
    },
    syllableSeparator: {
        fontSize: 24,
        color: '#D1D5DB',
    },
    bodyText: {
        ...theme.typography.body,
        fontSize: 18,
        color: theme.colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        ...theme.typography.caption,
    }
});
