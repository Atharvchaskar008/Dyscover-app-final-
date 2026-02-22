import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowLeft, Camera, Image as ImageIcon, Square, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { useTheme } from '../src/context/ThemeContext';
import { extractTextFromImage } from '../src/services/gemini';

export default function UploadScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleReadAloud = (text: string) => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(text, {
                rate: 0.85,
                pitch: 1.1,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false)
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
            setExtractedText('');

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({ aspect: [4, 3], quality: 0.8, base64: true })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], aspect: [4, 3], quality: 0.8, base64: true });

            if (!result.canceled && result.assets[0].base64) {
                setImageUri(result.assets[0].uri);

                // Web platforms include the data URI prefix (e.g. data:image/jpeg;base64,) which breaks Gemini
                const cleanBase64 = result.assets[0].base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                handleExtract(cleanBase64);
            }
        } catch (err) {
            setError('An error occurred picking the image.');
            console.error(err);
        }
    };

    const handleExtract = async (base64Image: string) => {
        setLoading(true);
        setError('');
        try {
            const text = await extractTextFromImage(base64Image);
            setExtractedText(text);
        } catch (err: any) {
            setError(err.message || 'Failed to extract text.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles(theme).container} edges={['top', 'bottom']}>
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(theme).backBtn}>
                    <ArrowLeft color={theme.colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Upload Worksheet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>
                <Text style={styles(theme).description}>
                    Take a photo of a worksheet or textbook page. Dyscover will read it and convert it into simple text.
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

                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles(theme).previewImage} resizeMode="cover" />
                )}

                {loading ? (
                    <View style={styles(theme).loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles(theme).loadingText}>Reading image...</Text>
                    </View>
                ) : extractedText ? (
                    <BentoCard glowColor={theme.colors.primary} style={styles(theme).resultCard}>
                        <View style={styles(theme).resultHeaderRow}>
                            <Text style={styles(theme).resultHeader}>Extracted Text</Text>
                            <TouchableOpacity
                                style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]}
                                onPress={() => handleReadAloud(extractedText)}
                            >
                                {isSpeaking ? (
                                    <Square color={theme.colors.white} size={14} fill={theme.colors.white} />
                                ) : (
                                    <Volume2 color={theme.colors.primary} size={14} />
                                )}
                                <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>
                                    Hear
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles(theme).resultText}>{extractedText}</Text>
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
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    secondaryBtn: {
        backgroundColor: theme.colors.primary + '15',
    },
    actionBtnText: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontSize: 16,
    },
    previewImage: {
        width: '100%',
        height: 250,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    loadingText: {
        ...theme.typography.caption,
        marginTop: theme.spacing.sm,
        color: theme.colors.textSecondary,
    },
    resultCard: {
        marginTop: theme.spacing.md,
    },
    resultHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    resultHeader: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        marginBottom: 0,
    },
    ttsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary + '15',
    },
    ttsBtnActive: {
        backgroundColor: theme.colors.primary,
    },
    ttsBtnText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    ttsBtnTextActive: {
        color: theme.colors.white,
    },
    resultText: {
        ...theme.typography.body,
        color: theme.colors.textPrimary,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        ...theme.typography.caption,
        color: '#EF4444',
    }
});
