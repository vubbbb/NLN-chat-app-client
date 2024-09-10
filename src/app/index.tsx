import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import SetupProfileScreen from "./screens/SetupProfile";
import ContactsScreen from "./screens/ContactsScreen";
import ChatScreen from "./screens/ChatScreen";
import { Image } from "react-native";
import LoginScreen from "./screens/Login";

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
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Login">
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
            title: route.params.user.name,
            headerBackTitle: 'Trở về',
            headerRight: () => (
              <Image
                source={{ uri: route.params.user.uri }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
