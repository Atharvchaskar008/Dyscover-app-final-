import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { BookOpen, FileText, Scan, Sparkles, Square, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { Navbar } from '../src/components/Navbar';
import { ProgressCalendar } from '../src/components/ProgressCalendar';
import { useTheme } from '../src/context/ThemeContext';
import { analyzeContent, simplifyText } from '../src/services/gemini';

export default function HomeScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [simplifiedText, setSimplifiedText] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [loadingType, setLoadingType] = useState<'simplify' | 'analyze' | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [wordLabInput, setWordLabInput] = useState('');
    const [error, setError] = useState('');

    const handleSimplify = async () => {
        if (!inputText.trim()) return;
        setLoadingType('simplify');
        setError('');

        try {
            const result = await simplifyText(inputText);
            setSimplifiedText(result.simplified);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingType(null);
        }
    };

    const handleAnalyze = async () => {
        const textToAnalyze = simplifiedText || inputText;
        if (!textToAnalyze.trim()) return;
        setLoadingType('analyze');
        setError('');

        try {
            const result = await analyzeContent(textToAnalyze);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingType(null);
        }
    };

    const handleReadAloud = async () => {
        const textToRead = simplifiedText || inputText;
        if (!textToRead) return;

        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        // iOS and Android will pick their default best voices for English. 
        // We slow the rate down slightly for dyslexia-friendliness.
        Speech.speak(textToRead, {
            language: 'en-US',
            pitch: 1.05,
            rate: 0.85,
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: (e) => {
                console.error('Speech error', e);
                setIsSpeaking(false);
            }
        });
    };

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <Navbar />
            <ScrollView contentContainerStyle={styles(theme).content}>

                <View style={styles(theme).header}>
                    <Text style={[styles(theme).welcomeText, { color: theme.colors.textPrimary }]}>Welcome Back, Learner</Text>
                    <Text style={[styles(theme).subtitleText, { color: theme.colors.textSecondary }]}>Paste your notes below to make them easier to read.</Text>
                </View>

                {/* Quick Word Lab Stub */}
                <BentoCard
                    glowColor={theme.colors.primary}
                    onPress={() => router.push('/word-lab' as any)}
                >
                    <View style={styles(theme).bentoHeader}>
                        <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Sparkles color={theme.colors.primary} size={24} />
                        </View>
                        <View style={styles(theme).bentoHeaderText}>
                            <Text style={[styles(theme).bentoTitle, { color: theme.colors.textPrimary }]}>Quick Word Lab</Text>
                            <Text style={[styles(theme).bentoSubtitle, { color: theme.colors.textSecondary }]}>Type one word to see its rhythm & syllables.</Text>
                        </View>
                    </View>
                    <View style={styles(theme).wordLabInputArea}>
                        <TextInput
                            style={styles(theme).wordLabInput}
                            placeholder="e.g. Beautiful, Rhythm..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={wordLabInput}
                            onChangeText={setWordLabInput}
                        />
                        <TouchableOpacity
                            style={styles(theme).wordLabBtn}
                            onPress={() => {
                                if (wordLabInput.trim()) {
                                    router.push({ pathname: '/word-lab', params: { word: wordLabInput.trim() } } as any);
                                } else {
                                    router.push('/word-lab' as any);
                                }
                            }}
                        >
                            <Text style={styles(theme).wordLabBtnText}>Explore →</Text>
                        </TouchableOpacity>
                    </View>
                </BentoCard>

                {/* Input Area */}
                <View style={styles(theme).inputArea}>
                    <TextInput
                        style={styles(theme).textArea}
                        multiline
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Paste difficult text or notes here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        textAlignVertical="top"
                    />

                    <View style={styles(theme).actionButtonsRow}>
                        <TouchableOpacity
                            style={styles(theme).secondaryBtn}
                            onPress={handleAnalyze}
                            disabled={loadingType !== null || !inputText.trim()}
                        >
                            {loadingType === 'analyze' ? (
                                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
                            ) : (
                                <Text style={styles(theme).secondaryBtnText}>Analyze</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles(theme).primaryBtn, (!inputText.trim() || loadingType !== null) && styles(theme).btnDisabled]}
                            onPress={handleSimplify}
                            disabled={loadingType !== null || !inputText.trim()}
                        >
                            {loadingType === 'simplify' ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                            ) : (
                                <Text style={styles(theme).primaryBtnText}>Simplify Text</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {error ? (
                    <View style={styles(theme).errorBox}>
                        <Text style={styles(theme).errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Results Section */}
                {(simplifiedText || analysis) ? (
                    <View style={styles(theme).resultsSection}>
                        {simplifiedText ? (
                            <BentoCard glowColor={theme.colors.primary}>
                                <View style={styles(theme).resultHeader}>
                                    <Text style={[styles(theme).resultTitle, { color: theme.colors.primary }]}>Simplified Version</Text>

                                    <TouchableOpacity
                                        style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]}
                                        onPress={handleReadAloud}
                                    >
                                        {isSpeaking ? (
                                            <Square color={theme.colors.white} size={16} fill={theme.colors.white} />
                                        ) : (
                                            <Volume2 color={theme.colors.primary} size={16} />
                                        )}
                                        <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>
                                            {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles(theme).resultContent}>{simplifiedText}</Text>
                            </BentoCard>
                        ) : null}

                        {analysis ? (
                            <BentoCard glowColor="#3B82F6">
                                <View style={styles(theme).resultHeader}>
                                    <Text style={[styles(theme).resultTitle, { color: '#3B82F6' }]}>AI Analysis</Text>

                                    <TouchableOpacity
                                        style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive, { backgroundColor: '#3B82F615' }]}
                                        onPress={async () => {
                                            if (isSpeaking) {
                                                Speech.stop();
                                                setIsSpeaking(false);
                                                return;
                                            }
                                            setIsSpeaking(true);
                                            const speakText = analysis.analysis + (analysis.correctionSteps && analysis.correctionSteps.length > 0 ? ' Here are steps to improve: ' + analysis.correctionSteps.join('. ') : '');
                                            Speech.speak(speakText, {
                                                language: 'en-US',
                                                pitch: 1.05,
                                                rate: 0.85,
                                                onDone: () => setIsSpeaking(false),
                                                onStopped: () => setIsSpeaking(false),
                                                onError: () => setIsSpeaking(false)
                                            });
                                        }}
                                    >
                                        {isSpeaking ? (
                                            <Square color={theme.colors.white} size={16} fill={theme.colors.white} />
                                        ) : (
                                            <Volume2 color="#3B82F6" size={16} />
                                        )}
                                        <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive, { color: isSpeaking ? theme.colors.white : '#3B82F6' }]}>
                                            {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles(theme).resultContent}>{analysis.analysis}</Text>

                                {analysis.correctionSteps && analysis.correctionSteps.length > 0 && (
                                    <View style={styles(theme).correctionCard}>
                                        <Text style={styles(theme).correctionLbl}>📝 STEP-BY-STEP PROCEDURE</Text>
                                        {analysis.correctionSteps.map((step: string, i: number) => (
                                            <View key={i} style={styles(theme).correctionStepRow}>
                                                <View style={styles(theme).correctionStepNumber}>
                                                    <Text style={styles(theme).correctionStepNumberTxt}>{i + 1}</Text>
                                                </View>
                                                <Text style={styles(theme).correctionStepTxt}>{step}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </BentoCard>
                        ) : null}
                    </View>
                ) : null}

                {/* Quick Tools */}
                <View style={styles(theme).quickToolsSection}>
                    <Text style={styles(theme).sectionHeading}>{"THIS MONTH'S PROGRESS"}</Text>
                    <ProgressCalendar />
                </View>

                <View style={styles(theme).quickToolsSection}>
                    <Text style={styles(theme).sectionHeading}>QUICK TOOLS</Text>
                    <View style={styles(theme).toolsGrid}>
                        <BentoCard
                            glowColor={theme.colors.primary}
                            style={styles(theme).toolCard}
                            onPress={() => router.push('/upload' as any)}
                        >
                            <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.primary + '15', marginBottom: theme.spacing.sm }]}>
                                <FileText color={theme.colors.primary} size={24} />
                            </View>
                            <Text style={styles(theme).toolTitle}>Read Worksheet</Text>
                            <Text style={styles(theme).toolSubtitle}>Convert images to text</Text>
                        </BentoCard>

                        <BentoCard
                            glowColor={theme.colors.secondary}
                            style={styles(theme).toolCard}
                            onPress={() => router.push('/handwriting' as any)}
                        >
                            <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.secondary + '15', marginBottom: theme.spacing.sm }]}>
                                <BookOpen color={theme.colors.secondary} size={24} />
                            </View>
                            <Text style={styles(theme).toolTitle}>Handwriting</Text>
                            <Text style={styles(theme).toolSubtitle}>Analyze your script</Text>
                        </BentoCard>

                        <BentoCard
                            glowColor={theme.colors.tertiary}
                            style={styles(theme).toolCard}
                            onPress={() => router.push('/scan' as any)}
                        >
                            <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.tertiary + '15', marginBottom: theme.spacing.sm }]}>
                                <Scan color={theme.colors.tertiary} size={24} />
                            </View>
                            <Text style={styles(theme).toolTitle}>Quick Scan</Text>
                            <Text style={styles(theme).toolSubtitle}>Snap text & get explanations</Text>
                        </BentoCard>
                    </View>
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
    content: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl * 2,
        paddingBottom: 40,
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    welcomeText: {
        ...theme.typography.h1,
    },
    subtitleText: {
        ...theme.typography.body,
        marginTop: 4,
    },
    bentoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    bentoHeaderText: {
        flex: 1,
    },
    bentoTitle: {
        ...theme.typography.h2,
    },
    bentoSubtitle: {
        ...theme.typography.caption,
    },
    wordLabInputArea: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    wordLabInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: 16,
        ...theme.typography.body,
    },
    wordLabBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        justifyContent: 'center',
        borderRadius: theme.borderRadius.md,
    },
    wordLabBtnText: {
        ...theme.typography.body,
        color: theme.colors.white,
    },
    inputArea: {
        marginTop: theme.spacing.lg,
        position: 'relative',
    },
    textArea: {
        backgroundColor: theme.colors.white,
        color: theme.colors.textPrimary,
        height: 200,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        paddingBottom: 64, // Space for buttons
        ...theme.typography.body,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionButtonsRow: {
        position: 'absolute',
        bottom: theme.spacing.md,
        right: theme.spacing.md,
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    primaryBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: 9999,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryBtnText: {
        ...theme.typography.body,
        color: theme.colors.white,
    },
    secondaryBtn: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: 9999,
    },
    secondaryBtnText: {
        ...theme.typography.body,
        fontSize: 14,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.md,
    },
    errorText: {
        ...theme.typography.caption,
        color: '#EF4444',
    },
    resultsSection: {
        marginTop: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    resultTitle: {
        ...theme.typography.h2,
        fontSize: 18,
    },
    ttsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    ttsBtnActive: {
        backgroundColor: '#EF4444',
    },
    ttsBtnText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontSize: 12,
    },
    ttsBtnTextActive: {
        color: theme.colors.white,
    },
    resultContent: {
        ...theme.typography.body,
        fontSize: 18,
        lineHeight: 28,
        color: theme.colors.textPrimary,
    },
    quickToolsSection: {
        marginTop: theme.spacing.xl,
    },
    sectionHeading: {
        ...theme.typography.caption,
        fontSize: 12,
        marginBottom: theme.spacing.md,
        marginLeft: 4,
        color: theme.colors.textSecondary,
    },
    toolsGrid: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    toolCard: {
        flex: 1,
    },
    toolTitle: {
        ...theme.typography.body,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    toolSubtitle: {
        ...theme.typography.caption,
        fontSize: 12,
        marginTop: 2,
        color: theme.colors.textSecondary,
    },
    correctionCard: { backgroundColor: '#3B82F610', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: theme.spacing.md, borderWidth: 1, borderColor: '#3B82F630' },
    correctionLbl: { ...theme.typography.caption, color: '#3B82F6', fontSize: 11, marginBottom: 12, fontWeight: 'bold' },
    correctionStepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
    correctionStepNumber: { backgroundColor: '#3B82F6', borderRadius: 12, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    correctionStepNumberTxt: { color: theme.colors.white, fontSize: 10, fontWeight: 'bold' },
    correctionStepTxt: { ...theme.typography.body, fontSize: 15, color: theme.colors.textPrimary, flex: 1 },
});
