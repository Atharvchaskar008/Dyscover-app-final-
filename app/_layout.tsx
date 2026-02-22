import { Slot, Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, TextInput, View, ActivityIndicator } from 'react-native';
import { UserProvider } from '../src/context/UserContext';
import { theme } from '../src/styles/theme';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';

// Force default text color globally for Web and Mobile components that don't explicitly declare one
interface CustomTextProps {
  style?: any;
  allowFontScaling?: boolean;
}

if (!(Text as any).defaultProps) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.style = [{ color: theme.colors.textPrimary }];

if (!(TextInput as any).defaultProps) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.style = [{ color: theme.colors.textPrimary }];

function RouteGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to app if already authenticated
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="word-lab" options={{ headerShown: false }} />
      <Stack.Screen name="handwriting" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      <Stack.Screen name="stories" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <RouteGuard />
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
