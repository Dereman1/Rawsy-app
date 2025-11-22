import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
