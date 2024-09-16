import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SetupProfileScreen from "./screens/SetupProfile";
import ContactsScreen from "./screens/ContactsScreen";
import ChatScreen from "./screens/ChatScreen";
import { Image, ActivityIndicator, View } from "react-native"; // Thêm ActivityIndicator
import LoginScreen from "./screens/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Định nghĩa kiểu cho các màn hình trong trình điều hướng
export type RootStackParamList = {
  Login: undefined;
  SetupProfile: undefined;
  ContactsScreen: undefined;
  ChatScreen: {
    user: { id: number; name: string; email: string; uri: string };
  };
};

// Tạo Stack Navigator với kiểu đã định nghĩa
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true); // Thêm trạng thái loading
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Kiểm tra trạng thái đăng nhập

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("auth");
        if (storedAuth) {
          setIsLoggedIn(true); // Đã đăng nhập
          console.log("User is logged in");
        }
      } catch (error) {
        console.error("Error reading auth data from AsyncStorage:", error);
      } finally {
        setIsLoading(false); // Hoàn tất kiểm tra
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // Hiển thị vòng quay loading trong khi kiểm tra trạng thái đăng nhập
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer independent>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "ContactsScreen" : "Login"}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetupProfile"
          component={SetupProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactsScreen"
          component={ContactsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
