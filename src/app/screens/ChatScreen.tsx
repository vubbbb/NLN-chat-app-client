import React, { useState, useEffect } from "react";
import { View, Text, Image, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type/type";
import ChatHeader from "../components/chat/ChatHeader";
import ChatContainer from "../components/chat/ChatContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../type/type";
import { Contact } from "../type/type";

type Props = NativeStackScreenProps<RootStackParamList, "ChatScreen">;

const ChatScreen: React.FC<Props> = ({ route }) => {
  const { contact } = route.params;
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const getUserDataFromStorage = async () => {
      const userDataString = await AsyncStorage.getItem("userInfo");
      if (userDataString) {
        const userData: User = JSON.parse(userDataString);
        setUserInfo(userData);
      }
    };
    getUserDataFromStorage();
  }, []);
  if (!userInfo) {
    return <Text>Loading...</Text>;
  }
  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <ChatHeader contact={contact} />
      <ChatContainer userInfo={userInfo} contact={contact} />
    </SafeAreaView>
  );
};

export default ChatScreen;
