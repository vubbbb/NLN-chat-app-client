import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Image,
  Linking,
} from "react-native";
import { User, Contact, Message } from "../../type/type";
import { SocketContext } from "../../context/SocketContext";
import { GET_MESSAGES_ROUTE } from "../../utils/constants";
import apiClient from "../../lib/api-client";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

interface ChatContainerProps {
  userInfo: User;
  contact: Contact;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ userInfo, contact }) => {
  const [message, setMessage] = useState(""); // Dữ liệu tin nhắn nhập vào
  const [messages, setMessages] = useState<any[]>([]); // Danh sách tin nhắn
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const socket = useContext(SocketContext); // Lấy socket từ context
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
  const [image, setImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const pickImage = async () => {
    // Yêu cầu quyền truy cập
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Mở thư viện ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const fileUri = result.assets[0].uri;
      if (fileUri) {
        setImage(fileUri);
        setImageLoading(false);
      }
    }
  };

  // Cloudinary configuration
  const CLOUD_NAME = "dkashxvw8";
  const UPLOAD_PRESET = "ml_default";

  // Hàm chọn file tài liệu
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Hỗ trợ tất cả các loại file
      });

      if (result.canceled) {
        console.log("User cancelled document picker");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        // Lưu file đã chọn vào state
        setFile(result.assets[0]);
        console.log("Document picked:", result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  // Hàm upload file lên Cloudinary
  const updateFileToCloudinaryAndSend = async (
    fileUri: string,
    fileType: string
  ) => {
    const formData = new FormData();

    formData.append("file", {
      uri: fileUri,
      type: fileType, // Loại MIME động
      name: `uploaded-file.${fileType.split("/")[1]}`, // Tên file dựa trên loại MIME
    } as any);

    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, // Endpoint `auto` cho phép nhận diện loại file tự động
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data.secure_url) {
        console.log("File uploaded successfully:", response.data.secure_url);
        sendMessage(response.data.secure_url, "file");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Hàm gửi tin nhắn
  const sendMessage = (fileURL: any, fileType: any) => {
    if (socket) {
      const messageData = {
        sender: userInfo.userID, // ID người gửi
        receiver: contact._id, // ID người nhận
        content: message.trim() ? message : undefined, // Nội dung tin nhắn
        messageType: fileURL === undefined ? "text" : fileType, // Loại tin nhắn
        fileURL: fileURL,
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
      socket.on("receiveMessage", (messageData) => {
        console.log("New message received   d: ", messageData.sender._id);
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
      socket?.off("receiveMessage");
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
        );
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
              justifyContent: item.fromSelf ? "flex-end" : "flex-start",
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
              {item.messageType !== "text" && item.fileURL ? (
                <View>
                  {/* Kiểm tra nếu là hình ảnh, hiển thị ảnh */}
                  {item.fileURL.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <Image
                      source={{ uri: item.fileURL }}
                      style={{ width: 200, height: 200, borderRadius: 10 }}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        textDecorationLine: "underline",
                        color: "blue",
                      }}
                    >
                      {/* Hiển thị link tải file nếu không phải ảnh */}
                      <Text onPress={() => Linking.openURL(item.fileURL)}>
                        Tải file
                      </Text>
                    </Text>
                  )}
                </View>
              ) : (
                // Hiển thị nội dung tin nhắn văn bản
                <Text style={{ fontSize: 16, color: "#000" }}>
                  {item.content}
                </Text>
              )}
            </View>
          </View>
        )}
      />

      <TextInput
        placeholder="Nhập tin nhắn"
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={() => sendMessage(undefined, "text")}
        returnKeyType="send"
        className="border-2 p-2 m-2 mt-0 rounded-xl bg-gray-200"
      />
      <Button title="Chọn file" onPress={pickDocument} />
      <Button title="Chọn anh" onPress={pickImage} />
      <Button
        title="Gửi"
        onPress={() => {
          if (file && file.uri) {
            const fileType = file.mimeType || "application/octet-stream"; // Xác định loại MIME
            updateFileToCloudinaryAndSend(file.uri, fileType);
            setFile(null);
          } else if (image) {
            updateFileToCloudinaryAndSend(image, "file");
            setImage(null);
          }
           else {
            console.log("No file selected to send");
          }
        }}
      />
    </View>
  );
};

export default ChatContainer;
