import { Check, Lock, Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LearningNodeProps {
    id: number;
    status: 'locked' | 'active' | 'completed';
    onPress: () => void;
    offsetX?: number; // For the winding path effect
}

export const LearningNode = ({ id, status, onPress, offsetX = 0 }: LearningNodeProps) => {
    const { theme } = useTheme();
    const isCompleted = status === 'completed';
    const isActive = status === 'active';
    const isLocked = status === 'locked';

    const getNodeColor = () => {
        if (isCompleted) return theme.colors.nodeCompleted;
        if (isActive) return theme.colors.primary;
        return theme.colors.nodeDefault;
    };

    const getShadowColor = () => {
        if (isCompleted) return '#C79A00'; // Darker yellow
        if (isActive) return '#D32F2F';    // Darker red
        return '#A9A9A9';
    };

    return (
        <View style={[styles(theme).container, { marginLeft: offsetX }]}>
            <TouchableOpacity
                style={[
                    styles(theme).node,
                    {
                        backgroundColor: getNodeColor(),
                        borderBottomColor: getShadowColor(),
                        borderBottomWidth: isActive || isCompleted ? 6 : 4,
                        opacity: isLocked ? 0.7 : 1,
                    }
                ]}
                onPress={onPress}
                disabled={isLocked}
                activeOpacity={0.8}
            >
                {isCompleted && <Check color={theme.colors.white} size={32} strokeWidth={3} />}
                {isActive && <Star color={theme.colors.white} size={32} strokeWidth={3} fill={theme.colors.white} />}
                {isLocked && <Lock color={theme.colors.white} size={28} strokeWidth={2.5} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    node: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.circle,
        justifyContent: 'center',
        alignItems: 'center',
        // Crown/3D like effect common in Duolingo
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    }
});
