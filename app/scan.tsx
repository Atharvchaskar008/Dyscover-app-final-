import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowLeft, Camera, Image as ImageIcon, Square, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { extractTextFromImage, runVisionOCR } from '../src/services/gemini';

export default function ScanScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string | null>(null);
    const [explain, setExplain] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scanErr, setScanErr] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const pickImage = async (useCamera = false) => {
        try {
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                setScanErr(`Permission to access ${useCamera ? 'camera' : 'camera roll'} is required!`);
                return;
            }

            setScanErr('');
            setOcrText(null);
            setExplain(null);

            const res = useCamera
                ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: true });

            if (!res.canceled && res.assets[0].base64) {
                setImageUri(res.assets[0].uri);
                const cleanBase64 = res.assets[0].base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                handleScan(cleanBase64);
            }
        } catch (err) {
            setScanErr('An error occurred picking the image.');
        }
    };

    const handleScan = async (base64Image: string) => {
        setScanning(true);
        setScanErr('');
        try {
            // First, run Google Vision OCR
            const text = await runVisionOCR(base64Image);
            if (!text) throw new Error('No text found. Try a clearer photo with good lighting.');
            setOcrText(text);

            // Then use Gemini to analyze the text and restructure
            const simplification = await extractTextFromImage(`Re-read this in very simple language. Explain difficult words simply. Use short sentences. Be warm and encouraging:\n\n${text}`);
            if (!simplification) throw new Error('Gemini returned no response.');
            setExplain(simplification);
        } catch (err: any) {
            setScanErr(err.message || 'Failed to scan image.');
        } finally {
            setScanning(false);
        }
    };

    const handleReadAloud = () => {
        if (!explain) return;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(explain, {
                rate: 0.85, pitch: 1.1,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false)
            });
        }
    };

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Quick Scan</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>
                <Text style={styles(theme).description}>
                    Photo of any text → Google Vision reads it → Gemini explains it simply.
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

                {scanErr ? <Text style={styles(theme).errorText}>{scanErr}</Text> : null}

                {imageUri && !explain && !scanning && (
                    <Image source={{ uri: imageUri }} style={styles(theme).previewImage} resizeMode="cover" />
                )}

                {scanning ? (
                    <View style={styles(theme).loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles(theme).loadingText}>Scanning Document...</Text>
                    </View>
                ) : explain ? (
                    <View style={styles(theme).resultSection}>
                        {imageUri && <Image source={{ uri: imageUri }} style={styles(theme).previewImageSmall} resizeMode="cover" />}

                        {ocrText && (
                            <View style={styles(theme).ocrCard}>
                                <Text style={styles(theme).ocrLbl}>📄 TEXT FOUND (VISION API)</Text>
                                <Text style={styles(theme).ocrTxt}>{ocrText}</Text>
                            </View>
                        )}

                        {explain && (
                            <View style={styles(theme).explainCard}>
                                <View style={styles(theme).explainHeader}>
                                    <Text style={styles(theme).explainLbl}>🤖 GEMINI EXPLAINS</Text>
                                    <TouchableOpacity style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]} onPress={handleReadAloud}>
                                        {isSpeaking ? <Square color={theme.colors.white} size={14} fill={theme.colors.white} /> : <Volume2 color={theme.colors.primary} size={14} />}
                                        <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>{isSpeaking ? 'Stop' : 'Hear'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles(theme).explainTxt}>{explain}</Text>
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
    previewImageSmall: { width: '100%', height: 120, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg },
    loadingContainer: { alignItems: 'center', marginTop: theme.spacing.xl },
    loadingText: { ...theme.typography.caption, marginTop: theme.spacing.sm, color: theme.colors.textPrimary },
    errorText: { textAlign: 'center', marginBottom: theme.spacing.md, ...theme.typography.caption, color: '#EF4444' },
    resultSection: { marginTop: theme.spacing.sm },
    ocrCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    ocrLbl: { ...theme.typography.caption, fontSize: 10, marginBottom: 8, color: theme.colors.textSecondary, fontWeight: 'bold' },
    ocrTxt: { ...theme.typography.body, fontSize: 13, lineHeight: 20, color: theme.colors.textSecondary },
    explainCard: { backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.primary + '30' },
    explainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    explainLbl: { ...theme.typography.caption, fontSize: 11, color: theme.colors.primary, fontWeight: 'bold' },
    explainTxt: { ...theme.typography.body, fontSize: 16, lineHeight: 28, color: theme.colors.textPrimary },
    ttsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: theme.colors.primary + '15' },
    ttsBtnActive: { backgroundColor: theme.colors.primary },
    ttsBtnText: { ...theme.typography.caption, color: theme.colors.primary, fontSize: 11, fontWeight: 'bold' },
    ttsBtnTextActive: { color: theme.colors.white },
});
