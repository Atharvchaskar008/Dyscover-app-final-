import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowLeft, BookOpen, Square, Volume2, Wand2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../src/components/BentoCard';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/context/UserContext';
import { generateStory } from '../src/services/gemini';

const SUGGESTED_TOPICS = ["Space Adventure", "A Brave Puppy", "The Magic Treehouse", "Under the Sea"];

export default function StoriesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { logActivity } = useUser();
    const [topic, setTopic] = useState('');
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (selectedTopic: string) => {
        if (!selectedTopic.trim()) return;

        setLoading(true);
        setError('');
        setStory('');
        setTopic(selectedTopic);

        try {
            const generated = await generateStory(selectedTopic);
            setStory(generated);
            logActivity('story');
        } catch (err: any) {
            setError(err.message || 'Error generating story.');
        } finally {
            setLoading(false);
        }
    };

    const handleReadAloud = async () => {
        if (!story) return;

        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        Speech.speak(story, {
            language: 'en-US',
            pitch: 1.1,
            rate: 0.85,
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
                <Text style={styles(theme).headerTitle}>Practice Stories</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles(theme).content}>
                <Text style={styles(theme).description}>
                    Type a topic below or pick a suggestion, and Dyscover will write a short, easy-to-read story just for you!
                </Text>

                <View style={styles(theme).inputArea}>
                    <TextInput
                        style={styles(theme).input}
                        placeholder="What should the story be about?"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={topic}
                        onChangeText={setTopic}
                    />
                    <TouchableOpacity
                        style={styles(theme).generateBtn}
                        onPress={() => handleGenerate(topic)}
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} size="small" />
                        ) : (
                            <Wand2 color={theme.colors.white} size={20} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles(theme).suggestionsContainer}>
                    {SUGGESTED_TOPICS.map(t => (
                        <TouchableOpacity key={t} style={styles(theme).suggestionPill} onPress={() => handleGenerate(t)}>
                            <Text style={styles(theme).suggestionText}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {error ? <Text style={styles(theme).errorText}>{error}</Text> : null}

                {story ? (
                    <BentoCard glowColor="#3B82F6" style={styles(theme).storyCard}>
                        <View style={styles(theme).storyHeader}>
                            <View style={styles(theme).storyIconHeader}>
                                <BookOpen color="#3B82F6" size={20} />
                                <Text style={styles(theme).storyTitle}>{topic} Story</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles(theme).ttsBtn, isSpeaking && styles(theme).ttsBtnActive]}
                                onPress={handleReadAloud}
                            >
                                {isSpeaking ? (
                                    <Square color={theme.colors.white} size={14} fill={theme.colors.white} />
                                ) : (
                                    <Volume2 color="#3B82F6" size={14} />
                                )}
                                <Text style={[styles(theme).ttsBtnText, isSpeaking && styles(theme).ttsBtnTextActive]}>
                                    {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles(theme).storyContent}>{story}</Text>
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
        marginBottom: theme.spacing.md,
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
    },
    generateBtn: {
        backgroundColor: '#3B82F6',
        borderRadius: theme.borderRadius.md,
        width: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    suggestionPill: {
        backgroundColor: '#3B82F615',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.circle,
    },
    suggestionText: {
        ...theme.typography.caption,
        color: theme.colors.textPrimary,
    },
    storyCard: {
        marginTop: theme.spacing.sm,
    },
    storyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.sm,
    },
    storyIconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    storyTitle: {
        ...theme.typography.h2,
        fontSize: 18,
        color: '#3B82F6',
        textTransform: 'capitalize',
    },
    ttsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#3B82F615',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    ttsBtnActive: {
        backgroundColor: '#EF4444',
    },
    ttsBtnText: {
        ...theme.typography.caption,
        fontSize: 10,
    },
    ttsBtnTextActive: {
        color: theme.colors.white,
    },
    storyContent: {
        ...theme.typography.body,
        fontSize: 18,
        lineHeight: 30,
        color: theme.colors.textPrimary,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        ...theme.typography.caption,
        color: '#EF4444',
    }
});
