import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BentoCardProps {
    children: ReactNode;
    style?: ViewStyle;
    glowColor?: string;
    onPress?: () => void;
}

export const BentoCard = ({ children, style, glowColor, onPress }: BentoCardProps) => {
    const { theme } = useTheme();
    const CardContainer = onPress ? TouchableOpacity : View;

    return (
        <View style={[styles(theme).outerGlowContainer, style]}>
            {glowColor && (
                <View
                    style={[
                        styles(theme).glowEffect,
                        { backgroundColor: glowColor }
                    ]}
                />
            )}
            <CardContainer
                style={styles(theme).card}
                activeOpacity={onPress ? 0.8 : 1}
                onPress={onPress}
            >
                {children}
            </CardContainer>
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    outerGlowContainer: {
        position: 'relative',
        marginVertical: theme.spacing.sm,
    },
    glowEffect: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: theme.borderRadius.xl,
        opacity: 0.15,
        // Add simple outer glow using shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 3,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        // Standard Card shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    }
});
