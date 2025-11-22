import { View } from "react-native";
import { Text, Button } from "react-native-paper";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text variant="headlineMedium">Hello World 👋</Text>
      <Button style={{ marginTop: 20 }} mode="contained">
        Click Me
      </Button>
    </View>
  );
}
