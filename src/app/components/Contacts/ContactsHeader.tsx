import React from "react";
import { View, Text, Image, Button, TextInput } from "react-native";
import { useState, useEffect } from "react";
import apiClient from "../../lib/api-client";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/app/index";
import { GET_USER_INFO } from "../../utils/constants";
import { useGoogleAuth, User, Auth } from "../../services/auth.service";

type ChatHeaderProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
  userInfo: User; // Thêm userInfo vào props
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ navigation, userInfo }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout, getAuth } = useGoogleAuth();

  useEffect(() => {
    const getUserInfo = () => {
      setUser(userInfo);
    };
    getUserInfo();
  }, []);

  return (
    <View>
      <View className="flex flex-row w-[100vw] items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center">
          <Image
            className="w-12 h-12 rounded-full"
            source={require("../../../../assets/images/in_app_logo.png")}
          />
          <Text className="ml-4 text-lg font-semibold">CTU Message</Text>
          <Button
            title="/\"
            onPress={async () => {
              // logout().then(() => {
              //   navigation.navigate("Login");
              // });
              logout();
              navigation.navigate("Login");
            }}
          />
        </View>
        <View className="flex flex-row items-center">
          <View className="items-center justify-center flex flex-row">
            <View className="items-end mr-2">
              <Text>Xin chào</Text>
              {/* <Text>{userInfo.name}</Text> */}
            </View>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text>{error}</Text>
            ) : (
              user && (
                <View>
                  <Image
                    source={{ uri: user.picture }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      marginRight: 5,
                    }}
                  />
                </View>
              )
            )}
          </View>
        </View>
      </View>
      <View className="p-4 bg-white border-b border-gray-200 flex flex-row items-center justify-center">
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="gray"
          className="bg-gray-100 border-[1px] border-gray-300 rounded-3xl h-[50px] w-[250px] text-center"
        />
        <Button title="Tìm kiếm" />
      </View>
    </View>
  );
};

export default ChatHeader;
