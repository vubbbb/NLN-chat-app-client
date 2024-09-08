import React from "react";
import { View, Text, Image, Button, TextInput } from "react-native";
import { useState, useEffect } from "react";
import apiClient from "@/src/app/lib/api-client";
import {
  GET_USER_INFO,
  UPDATE_PROFILE_ROUTE,
  ADD_PROFILE_IMAGE_ROUTE,
} from "@/src/app/utils/constants";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  color?: number;
  profileSetup?: boolean;
}

const ChatHeader = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Bắt đầu với false vì chưa tải dữ liệu
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<User>(GET_USER_INFO, {
          params: {
            userID: "66b1822240322af42cd5add9",
          },
        });
        setUser(response.data);
      } catch (error) {
        setError((error as Error).message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (!user?.image) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [user, setUser]);

  return (
    <View>
      <View className="flex flex-row w-[100vw] items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center">
          <Image
            className="w-12 h-12 rounded-full"
            source={require("@/assets/images/in app logo.png")}
          />
          <Text className="ml-4 text-lg font-semibold">CTU Message</Text>
        </View>
        <View className="flex flex-row items-center">
          <View className="items-center justify-center flex flex-row">
            <View className="items-end mr-2">
              <Text>Xin chào</Text>
              <Text>
                {user && user.firstName ? user.firstName : "Người dùng"}
              </Text>
            </View>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text>{error}</Text>
            ) : (
              user && (
                <View>
                  <Image
                    source={{ uri: image ? image : user.image }}
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
