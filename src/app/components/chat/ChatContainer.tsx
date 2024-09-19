import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import { useSocket } from "../../context/SocketContext";
import { User, Contact } from "../../type/type";

interface ChatContainerProps {
  userInfo: User;
  contact: Contact;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ userInfo, contact }) => {
  const socket = useSocket(); // Lấy socket từ context
  const [message, setMessage] = useState(""); // Dữ liệu tin nhắn nhập vào
  const [messages, setMessages] = useState<any[]>([]); // Danh sách tin nhắn

  // Hàm gửi tin nhắn
  const sendMessage = () => {
    if (message.trim() && socket) {
      const messageData = {
        sender: userInfo.userID, // ID người gửi
        receiver: contact._id, // ID người nhận
        content: message, // Nội dung tin nhắn
      };

      // Gửi tin nhắn qua socket
      socket.emit("sendMessage", messageData);

      // Thêm tin nhắn vào danh sách hiển thị
      setMessages([...messages, { ...messageData, fromSelf: true }]);
      setMessage(""); // Xóa nội dung sau khi gửi
    }
  };

  // Lắng nghe sự kiện nhận tin nhắn
  useEffect(() => {
    if (socket) {
      console.log("Listening for messages");

      socket.on("recieveMessage", (messageData) => {
        if (
          messageData.sender === contact._id ||
          messageData.receiver === userInfo.userID
        ) {
          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      });
    } else{
      console.log("Socket not available");
    }
    // Cleanup: ngắt kết nối socket khi component unmount
    return () => {
      socket?.off("recieveMessage");
    };
  }, [socket, contact._id, userInfo.userID]);
  // socket, contact._id

  return (
    <View>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ color: item.fromSelf ? "blue" : "green" }}>
            {item.content}
          </Text>
        )}
      />

      <TextInput
        placeholder="Nhập tin nhắn"
        value={message}
        onChangeText={setMessage}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Button title="Gửi" onPress={sendMessage} />
    </View>
  );
};

export default ChatContainer;
