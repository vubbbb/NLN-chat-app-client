import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SetupProfileScreen from "./screens/SetupProfile";
import ContactsScreen from "./screens/ContactsScreen";
import ChatScreen from "./screens/ChatScreen";
import GroupChatScreen from "./screens/GroupChatScreen";
import { Image, ActivityIndicator, View, KeyboardAvoidingView, Platform, Text} from "react-native"; // Thêm ActivityIndicator
import LoginScreen from "./screens/login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocketContext, socket } from "./context/SocketContext";
import { RootStackParamList, Contact } from "./type/type";




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
        <Text>Đang...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <SocketContext.Provider value={socket}>
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
            options={({ route }) => ({
              title: route.params.contact.nickname,
              headerBackTitle: "Trở về",
              headerBackTitleVisible: true,
              headerTitleAlign: "center",
              headerStyle: {backgroundColor: "grey"},
              headerRight: () => (
                <Image
                  source={{ uri: route.params.contact.picture }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
              ),
            })}
          />
          <Stack.Screen
            name="GroupChatScreen"
            component={GroupChatScreen}
            options={({ route }) => ({
              title: route.params.group.name,
              headerBackTitle: "Trở về",
              headerBackTitleVisible: true,
              headerTitleAlign: "center",
              headerStyle: {backgroundColor: "grey"},
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
    </KeyboardAvoidingView>
  );
}
