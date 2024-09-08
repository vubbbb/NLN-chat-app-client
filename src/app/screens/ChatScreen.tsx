import React from "react";
import { View, Text, Image, Button, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import ChatHeader from "../components/chat/ChatHeader";
import ChatContainer from "../components/chat/ChatContainer";
import ChatFooter from "../components/chat/ChatFooter";

type Props = NativeStackScreenProps<RootStackParamList, "ChatScreen">;

const ChatScreen: React.FC<Props> = ({ route }) => {
  const { user } = route.params;
  return (
    <SafeAreaView className='items-center justify-center flex-1'>
        <ChatHeader user={user}/>
        <ChatContainer />
        <ChatFooter />
    </SafeAreaView>
  );
};

export default ChatScreen;
