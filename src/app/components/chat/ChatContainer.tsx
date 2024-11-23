import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { User, Contact, Message } from "../../type/type";
import { SocketContext } from "../../context/SocketContext";
import { GET_MESSAGES_ROUTE } from "../../utils/constants";
import apiClient from "../../lib/api-client";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icon

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
  const flatListRef = useRef<FlatList>(null); // Tham chiếu FlatList
  const [sending, setSending] = useState(false);

  // Hàm cuộn xuống dưới cùng danh sách tin nhắn
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

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
      setSending(false);
      scrollToBottom();
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
        scrollToBottom();
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
        );
        setLoading(false);
        scrollToBottom();
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
        ref={flatListRef} // Thêm tham chiếu vào đây
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
        onContentSizeChange={scrollToBottom}
      />

      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
        <TextInput
          placeholder="Nhập tin nhắn"
          value={message}
          onChangeText={setMessage}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            padding: 10,
            marginRight: 10,
          }}
        />

        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 50, height: 50, borderRadius: 50, marginRight: 10 }}
          />
        ) : file ? (
          <Text>{file.name}</Text>
        ) : null}

        <TouchableOpacity onPress={pickImage} style={{ marginRight: 10 }}>
          <Icon name="photo" size={24} color="blue" />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickDocument} style={{ marginRight: 10 }}>
          <Icon name="attach-file" size={24} color="blue" />
        </TouchableOpacity>

        {sending ? (
          <Text>Đang...</Text>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (image) {
                updateFileToCloudinaryAndSend(image, "image");
                setImage(null);
                setImageLoading(true);
                setSending(true);
              } else if (file) {
                updateFileToCloudinaryAndSend(
                  file.uri,
                  file.mimeType as string
                );
                setFile(null);
                setSending(true);
              } else if (message.trim()) {
                sendMessage(undefined, "text");
              }
            }}
          >
            <Icon name="send" size={24} color="blue" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ChatContainer;
