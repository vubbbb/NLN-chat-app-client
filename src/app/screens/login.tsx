import React, { useEffect, useState } from "react";
import { View, Text, Image, Button, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { useGoogleAuth, User, Auth } from "../services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const {
    request,
    response,
    promptAsync,
    login,
    getAuth,
    getUserData,
    logout,
  } = useGoogleAuth();

  const checkAuth = async () => {
    const storedAuth = await getAuth();
    setAuth(storedAuth);
  };

  useEffect(() => {
    if (response?.type === "success") {
      login().then((authData) => {
        setAuth(authData);
        navigation.navigate("ContactsScreen");
      });
    }
  }, [response]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-center text-xl">Xin chào!</Text>
      <Text className="text-center text-xl">
        Chào mừng bạn đến với CTU Message
      </Text>
      <View className="mt-8">
        <Image
          className="w-32 h-32"
          source={require("../../../assets/images/LOGO_CTU.png")}
        />
      </View>
      <View className="m-8">
        <Image
          className="w-[280px] h-[168px]"
          source={require("../../../assets/images/login_logo.png")}
        />
      </View>
      <View className="m-8">
        <Button
          title={"Đăng nhập bằng mail"}
          onPress={() => {
            checkAuth();
            if (auth !== null) {
              promptAsync({
                useProxy: true,
                showInRecents: true,
                projectNameForProxy: "@vubinh69/ctu-message-slug",
              });
            } else {
              promptAsync({
                useProxy: true,
                showInRecents: true,
                projectNameForProxy: "@vubinh69/ctu-message-slug",
              });
            }
          }}
        />
      </View>
    </View>
  );
}
