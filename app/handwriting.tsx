import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Image as ImageIcon, Square, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/context/UserContext';
import { analyzeHandwriting } from '../src/services/gemini';

export default function HandwritingScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { logActivity } = useUser();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingStepIndex, setSpeakingStepIndex] = useState<number | null>(null);

    const severityColor = (s: string) => {
        return { mild: theme.colors.primary, moderate: '#F59E0B', notable: theme.colors.error }[s] || theme.colors.textSecondary;
    };

    const buildSpeechScript = (res: any) => {
        const parts = [res.encouragement];
        if (res.topStrength) parts.push(`Your top strength is: ${res.topStrength}.`);
        if (res.flaws?.length) {
            parts.push(`I noticed ${res.flaws.length} area${res.flaws.length > 1 ? 's' : ''} to work on.`);
            res.flaws.forEach((f: any, i: number) => parts.push(`Area ${i + 1}: ${f.type}. ${f.detail}`));
        } else {
            parts.push('No major issues found! Your handwriting looks great!');
        }
        if (res.correctionSteps?.length) {
            parts.push("Here are some steps to improve:");
            res.correctionSteps.forEach((step: string, i: number) => parts.push(`Step ${i + 1}: ${step}`));
        }
        if (res.practiceHint) parts.push(`Tip for next time: ${res.practiceHint}`);
        parts.push('Keep up the amazing work!');
        return parts.join('  ');
    };

    const handleReadAloud = () => {
        if (!result) return;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setSpeakingStepIndex(null);
            setIsSpeaking(true);
            Speech.speak(buildSpeechScript(result), {
                rate: 0.85, pitch: 1.1,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false)
            });
        }
    };

    const handleReadStep = (stepText: string, index: number) => {
        if (speakingStepIndex === index) {
            Speech.stop();
            setSpeakingStepIndex(null);
        } else {
            Speech.stop();
            setIsSpeaking(false);
            setSpeakingStepIndex(index);
            Speech.speak(stepText, {
                rate: 0.85, pitch: 1.1,
                onDone: () => setSpeakingStepIndex(null),
                onStopped: () => setSpeakingStepIndex(null),
                onError: () => setSpeakingStepIndex(null)
            });
        }
    };

    const pickImage = async (useCamera = false) => {
        try {
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                setError(`Permission to access ${useCamera ? 'camera' : 'camera roll'} is required!`);
                return;
            }

            setError('');
            setResult(null);

            const res = useCamera
                ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: true });

            if (!res.canceled && res.assets[0].base64) {
                setImageUri(res.assets[0].uri);
                const cleanBase64 = res.assets[0].base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                handleAnalyze(cleanBase64);
            }
        } catch (err) {
            setError('An error occurred picking the image.');
        }
    };

    const handleAnalyze = async (base64Image: string) => {
        setLoading(true);
        setError('');
        try {
            const parsed = await analyzeHandwriting(base64Image);
            setResult(parsed);
            logActivity('handwriting');
        } catch (err: any) {
            setError(err.message || 'Failed to analyze handwriting.');
        } finally {
            setLoading(false);
        }
    };

    const hasFlaws = Array.isArray(result?.flaws) && result.flaws.length > 0;

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Handwriting Analysis</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>
                <Text style={styles(theme).description}>
                    Take a photo of your handwriting. Dyscover will analyze it and give you friendly feedback and tips.
                </Text>

                <View style={styles(theme).buttonRow}>
                    <TouchableOpacity style={styles(theme).actionBtn} onPress={() => pickImage(true)}>
                        <Camera color={theme.colors.white} size={24} />
                        <Text style={styles(theme).actionBtnText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles(theme).actionBtn, styles(theme).secondaryBtn]} onPress={() => pickImage(false)}>
                        <ImageIcon color={theme.colors.primary} size={24} />
                        <Text style={[styles(theme).actionBtnText, { color: theme.colors.primary }]}>Upload Image</Text>
                    </TouchableOpacity>
                </View>

                {error ? <Text style={styles(theme).errorText}>{error}</Text> : null}

                {imageUri && !result && !loading && (
                    <Image source={{ uri: imageUri }} style={styles(theme).previewImage} resizeMode="cover" />
                )}

                {loading ? (
                    <View style={styles(theme).loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles(theme).loadingText}>Analyzing handwriting...</Text>
                    </View>
                ) : result ? (
                    <View style={styles(theme).resultSection}>
                        {imageUri && <Image source={{ uri: imageUri }} style={styles(theme).previewImage} resizeMode="cover" />}

                        <TouchableOpacity style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]} onPress={handleReadAloud}>
                            {isSpeaking ? <Square color={theme.colors.white} size={18} fill={theme.colors.white} /> : <Volume2 color={theme.colors.primary} size={18} />}
                            <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</Text>
                        </TouchableOpacity>

                        <View style={styles(theme).encourageBanner}>
                            <Text style={styles(theme).emoji}>🌟</Text>
                            <Text style={styles(theme).encourageTxt}>{result.encouragement}</Text>
                        </View>

                        {result.topStrength && (
                            <View style={styles(theme).strengthCard}>
                                <View style={styles(theme).strengthRow}>
                                    <CheckCircle2 size={18} color="#059669" />
                                    <Text style={styles(theme).strengthLbl}>TOP STRENGTH</Text>
                                </View>
                                <Text style={styles(theme).strengthTxt}>{result.topStrength}</Text>
                            </View>
                        )}

                        <Text style={styles(theme).sectionHead}>
                            {hasFlaws ? `${result.flaws.length} Area${result.flaws.length > 1 ? 's' : ''} to Work On` : '✅ No major issues found!'}
                        </Text>

                        {hasFlaws ? (
                            result.flaws.map((f: any, i: number) => (
                                <View key={`flaw-${i}`} style={styles(theme).flawWrap}>
                                    <View style={styles(theme).flawHeader}>
                                        <View style={[styles(theme).flawBadge, { backgroundColor: severityColor(f.severity) + '20', borderColor: severityColor(f.severity) + '50' }]}>
                                            <AlertCircle size={12} color={severityColor(f.severity)} />
                                            <Text style={[styles(theme).flawBadgeTxt, { color: severityColor(f.severity) }]}>{f.type}</Text>
                                        </View>
                                        <Text style={[styles(theme).flawSev, { color: severityColor(f.severity) }]}>{f.severity.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles(theme).flawDetail}>{f.detail}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles(theme).noFlaws}>Your handwriting looks great — keep it up!</Text>
                        )}

                        {result.correctionSteps && result.correctionSteps.length > 0 && (
                            <View style={styles(theme).correctionCard}>
                                <Text style={styles(theme).correctionLbl}>📝 STEP-BY-STEP CORRECTION</Text>
                                {result.correctionSteps.map((step: string, i: number) => (
                                    <View key={i} style={styles(theme).correctionStepRow}>
                                        <View style={styles(theme).correctionStepNumber}>
                                            <Text style={styles(theme).correctionStepNumberTxt}>{i + 1}</Text>
                                        </View>
                                        <Text style={styles(theme).correctionStepTxt}>{step}</Text>
                                        <TouchableOpacity
                                            style={styles(theme).stepTtsBtn}
                                            onPress={() => handleReadStep(step, i)}
                                        >
                                            {speakingStepIndex === i ? (
                                                <Square color={theme.colors.error} size={16} fill={theme.colors.error} />
                                            ) : (
                                                <Volume2 color={theme.colors.primary} size={16} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {result.practiceHint && (
                            <View style={styles(theme).hintCard}>
                                <Text style={styles(theme).hintLbl}>💡 TRY THIS NEXT TIME</Text>
                                <Text style={styles(theme).hintTxt}>{result.practiceHint}</Text>
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backBtn: { padding: 4 },
    headerTitle: { ...theme.typography.h2, fontSize: 20, color: theme.colors.textPrimary },
    content: { padding: theme.spacing.lg },
    description: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, textAlign: 'center' },
    buttonRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md },
    secondaryBtn: { backgroundColor: theme.colors.primary + '15' },
    actionBtnText: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.white, fontSize: 16 },
    previewImage: { width: '100%', height: 200, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    loadingContainer: { alignItems: 'center', marginTop: theme.spacing.xl },
    loadingText: { ...theme.typography.caption, marginTop: theme.spacing.sm, color: theme.colors.textPrimary },
    errorText: { textAlign: 'center', marginBottom: theme.spacing.md, ...theme.typography.caption, color: '#EF4444' },
    resultSection: { marginTop: theme.spacing.sm },
    ttsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 99, backgroundColor: theme.colors.primary + '15', marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.primary + '40' },
    ttsBtnActive: { backgroundColor: theme.colors.primary },
    ttsBtnText: { ...theme.typography.body, color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
    ttsBtnTextActive: { color: theme.colors.white },
    encourageBanner: { backgroundColor: theme.colors.success + '15', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.success + '40' },
    emoji: { fontSize: 24 },
    encourageTxt: { ...theme.typography.body, flex: 1, color: theme.colors.success, fontSize: 15 },
    strengthCard: { backgroundColor: theme.colors.success + '15', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.success + '40' },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    strengthLbl: { ...theme.typography.caption, color: theme.colors.success, fontSize: 11, fontWeight: 'bold' },
    strengthTxt: { ...theme.typography.body, fontSize: 15, color: theme.colors.success },
    sectionHead: { ...theme.typography.h3, marginBottom: theme.spacing.md, color: theme.colors.textPrimary },
    noFlaws: { ...theme.typography.body, color: theme.colors.success, marginBottom: theme.spacing.lg },
    flawWrap: { marginBottom: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
    flawHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    flawBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
    flawBadgeTxt: { ...theme.typography.caption, fontSize: 11, fontWeight: 'bold' },
    flawSev: { ...theme.typography.caption, fontSize: 10, fontWeight: 'bold' },
    flawDetail: { ...theme.typography.body, fontSize: 15, color: theme.colors.textSecondary },
    hintCard: { backgroundColor: theme.colors.tertiary + '15', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.tertiary + '40' },
    hintLbl: { ...theme.typography.caption, color: theme.colors.tertiary, fontSize: 11, marginBottom: 6, fontWeight: 'bold' },
    hintTxt: { ...theme.typography.body, fontSize: 15, color: theme.colors.tertiary },
    correctionCard: { backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.primary + '30' },
    correctionLbl: { ...theme.typography.caption, color: theme.colors.primary, fontSize: 11, marginBottom: 12, fontWeight: 'bold' },
    correctionStepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
    correctionStepNumber: { backgroundColor: theme.colors.primary, borderRadius: 12, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    correctionStepNumberTxt: { color: theme.colors.white, fontSize: 10, fontWeight: 'bold' },
    correctionStepTxt: { ...theme.typography.body, fontSize: 15, color: theme.colors.textPrimary, flex: 1 },
    stepTtsBtn: { padding: 4, marginLeft: 8 },
});
