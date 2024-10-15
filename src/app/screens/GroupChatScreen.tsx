import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, GroupMessage } from "../type/type";
import { SocketContext } from "../context/SocketContext";
import apiClient from "../lib/api-client";
import { GET_GROUP_MESSAGES_ROUTE } from "../utils/constants";

type Props = NativeStackScreenProps<RootStackParamList, "GroupChatScreen">;

const GroupChatScreen: React.FC<Props> = ({ route }) => {
  const { group, userInfo } = route.params;
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getGroupMessages = async () => {
      console.log("Getting group messages: ", group._id);
      try {
        const response = await apiClient.post(GET_GROUP_MESSAGES_ROUTE, {
          params: { groupID: group._id },
        });
        if (response.status === 200) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error retrieving group messages", error);
      }
    };
    getGroupMessages();
  }, [group]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_group_message", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log("New message received: ", newMessage);
      });
      return () => {
        socket.off("receive_group_message");
      };
    }
  }, [socket]);

  const sendMessage = async () => {
    if (!socket) return;
    const groupId = group._id;
    const newMessage = {
      groupId,
      sender: userInfo.userID,
      content: message,
      messageType: "text",
      fileUrl: "",
      groupID: groupId,
    };
    socket.emit("send_group_message", newMessage);
    setMessage("");
  };

  const renderMessage = ({ item }: { item: GroupMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender.nickname === userInfo.nickname
          ? styles.sentMessage
          : styles.receivedMessage,
      ]}
    >
      {item.sender.nickname !== userInfo.nickname && (
        <Text style={styles.sender}>{item.sender.nickname}: </Text>
      )}
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
        />
        <TextInput
          placeholder="Nhập tin nhắn"
          value={message}
          onChangeText={setMessage}
          // style={styles.input}
          className="border-2 p-2 m-2 mt-0 rounded-xl bg-gray-200"
          onSubmitEditing={sendMessage} // Gửi tin nhắn khi nhấn enter
          returnKeyType="send" // Hiển thị nút gửi trên bàn phím
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  messageContainer: {
    flexDirection: "column",
    marginBottom: 5,
    maxWidth: "80%",
  },
  sender: {
    fontWeight: "bold",
    marginLeft: 5,
  },
  content: {
    marginLeft: -5,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  sentMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  receivedMessage: {
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-start",
    marginVertical: 5,
    paddingHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});

export default GroupChatScreen;
