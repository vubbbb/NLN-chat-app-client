import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, Button, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type/type";
import { useGoogleAuth } from "../services/auth.service";
import { User, Auth } from "../type/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_INFO, SIGNUP_ROUTE } from "../utils/constants";
import apiClient from "../lib/api-client";
import { SocketContext } from "../context/SocketContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(false);
  const socket = useContext(SocketContext);
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

  const handleLogin = async () => {
    const response = await apiClient.post(SIGNUP_ROUTE, {
      email: user?.email,
      nickname: user?.name,
      profileSetup: false,
      picture: user?.picture,
    });
    const userSetupState = response.data.user.setupProfile;
    const userReponse = response.data.user;

    console.log("User setup state: ", userSetupState);
    if (userSetupState) {
      // 1. Lấy dữ liệu hiện tại của item từ AsyncStorage
      const item = await AsyncStorage.getItem("userInfo");

      // 2. Parse dữ liệu nếu item đã tồn tại
      let parsedItem = item ? JSON.parse(item) : {};

      // 3. Thêm trường mới vào object
      parsedItem.nickname = userReponse.nickname; // Thêm trường nickname
      parsedItem.userID = userReponse.userID; // Thêm trường userID

      console.log("Parsed item: ", parsedItem.userID);
      // 4. Lưu lại object đã cập nhật vào AsyncStorage
      await AsyncStorage.setItem("userInfo", JSON.stringify(parsedItem)).then(
        () => {
          navigation.reset({
            index: 0, // Chỉ giữ một màn hình trong stack
            routes: [{ name: "ContactsScreen" }], // Đặt ContactsScreen là màn hình gốc
          });
        }
      );
    } else {
      navigation.reset({
        index: 0, // Chỉ giữ một màn hình trong stack
        routes: [{ name: "SetupProfile" }], // Đặt ContactsScreen là màn hình gốc
      });
    }
    if (socket) {
      socket.connect();
      console.log("Socket connected");
      // Đăng ký userID sau khi kết nối
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);
      login().then((userData) => {
        setUser(userData || undefined);
        console.log("User data: set");
      });
    }
  }, [response]);

  useEffect(() => {
    if (user?.email !== undefined || user?.email !== null) {
      console.log("post request");
      handleLogin();
    }
  }, [user]);

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
        {loading ? (
          <Text>Đang...</Text>
        ) : (
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
                setLoading(true);
              } else {
                promptAsync({
                  useProxy: true,
                  showInRecents: true,
                  projectNameForProxy: "@vubinh69/ctu-message-slug",
                });
                setLoading(true);
              }
            }}
          />
        )}
      </View>
    </View>
  );
}
