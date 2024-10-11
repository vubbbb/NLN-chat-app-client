import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TextInput, StyleSheet } from "react-native";
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
        item.sender.userID === userInfo.userID ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      {item.sender.userID !== userInfo.userID && (
        <Text style={styles.sender}>{item.sender.nickname}: </Text>
      )}
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
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
        style={styles.input}
        onSubmitEditing={sendMessage} // Gửi tin nhắn khi nhấn enter
        returnKeyType="send" // Hiển thị nút gửi trên bàn phím
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 5,
    maxWidth: '80%', // Giới hạn độ rộng
  },
  sender: {
    fontWeight: "bold",
  },
  content: {
    marginLeft: 5,
    padding: 10,
    borderRadius: 5,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6", // Màu nền cho tin nhắn của người gửi
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0", // Màu nền cho tin nhắn của người nhận
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});

export default GroupChatScreen;
