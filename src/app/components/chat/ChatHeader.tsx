import React from "react";
import { View, Text, Image } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Contact } from "../../type/type";
type ChatHeaderProps = {
  contact: Contact; // Thêm userInfo vào props
};
const ChatHeader: React.FC<ChatHeaderProps> = ({ contact }) => {
  return (
    <View>
      <View className=" justify-center">
        <Image source={{ uri: contact.picture }} />
      </View>
    </View>
  );
};

export default ChatHeader;
