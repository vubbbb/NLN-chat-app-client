import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { User, Contact, Message } from "../../type/type";
import { SocketContext } from "../../context/SocketContext";
import { GET_MESSAGES_ROUTE } from "../../utils/constants";
import apiClient from "../../lib/api-client";

interface ChatContainerProps {
  userInfo: User;
  contact: Contact;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ userInfo, contact }) => {
  const [message, setMessage] = useState(""); // Dữ liệu tin nhắn nhập vào
  const [messages, setMessages] = useState<any[]>([]); // Danh sách tin nhắn
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const socket = useContext(SocketContext); // Lấy socket từ context

  // Hàm gửi tin nhắn
  const sendMessage = () => {
    if (message.trim() && socket) {
      const messageData = {
        sender: userInfo.userID, // ID người gửi
        receiver: contact._id, // ID người nhận
        content: message, // Nội dung tin nhắn
        messageType: "text",
        fileURL: undefined,
      };

      // Gửi tin nhắn qua socket
      socket.emit("sendMessage", messageData);

      // Thêm tin nhắn vào danh sách hiển thị
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, fromSelf: true },
      ]);
      setMessage(""); // Xóa nội dung sau khi gửi
    }
  };

  // Lắng nghe sự kiện nhận tin nhắn
  useEffect(() => {
    if (socket) {
      socket.on("recieveMessage", (messageData) => {
        // Thêm fromSelf vào tin nhắn nhận được
        if (messageData.sender._id === contact._id) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...messageData, fromSelf: false },
          ]);
        }
      });
    } else {
      console.log("Socket not available");
    }
    // Cleanup: ngắt kết nối socket khi component unmount
    return () => {
      socket?.off("recieveMessage");
    };
  }, [socket]);

  // Lấy tin nhắn từ server
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get(GET_MESSAGES_ROUTE, {
          params: {
            user1: userInfo.userID,
            user2: contact._id,
          },
        });
        setMessages(
          response.data.map((msg: Message) => ({
            ...msg,
            fromSelf: msg.sender === userInfo.userID,
          }))
        ); // Thêm fromSelf
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };
    if (userInfo.userID && contact._id) {
      fetchMessages();
    }
  }, [userInfo.userID, contact._id]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: item.fromSelf ? "flex-end" : "flex-start", // Sử dụng fromSelf
                marginVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: item.fromSelf ? "#DCF8C6" : "#FFFFFF",
                  padding: 10,
                  borderRadius: 10,
                  maxWidth: "80%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 16, color: "#000" }}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
        />
        <TextInput
          placeholder="Nhập tin nhắn"
          value={message}
          onChangeText={setMessage}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          onSubmitEditing={sendMessage} // Gửi tin nhắn khi nhấn enter
          returnKeyType="send" // Hiển thị nút gửi trên bàn phím
        />
      </View>
  );
};

export default ChatContainer;
