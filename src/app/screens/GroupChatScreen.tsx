import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, GroupMessage } from "../type/type";
import { SocketContext } from "../context/SocketContext";
import apiClient from "../lib/api-client";
import { GET_GROUP_MESSAGES_ROUTE } from "../utils/constants";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = NativeStackScreenProps<RootStackParamList, "GroupChatScreen">;

const GroupChatScreen: React.FC<Props> = ({ route }) => {
  const { group, userInfo } = route.params;
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
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

  useEffect(() => {
    const getGroupMessages = async () => {
      console.log("Getting group messages: ", group._id);
      try {
        const response = await apiClient.post(GET_GROUP_MESSAGES_ROUTE, {
          params: { groupID: group._id },
        });
        if (response.status === 200) {
          setMessages(
            response.data.messages.map((msg: GroupMessage) => ({
              ...msg,
              fromSelf: msg.sender.nickname === userInfo.nickname,
            }))
          );
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

  const sendMessage = async (fileURL: any, fileType: any) => {
    if (!socket) return;
    const groupId = group._id;
    const newMessage = {
      sender: userInfo.userID,
      content: message.trim() ? message : undefined, // Nội dung tin nhắn
      messageType: fileURL === undefined ? "text" : fileType, // Loại tin nhắn
      fileURL: fileURL,
      groupID: groupId,
    };
    socket.emit("send_group_message", newMessage);
    // Thêm tin nhắn vào danh sách hiển thị
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...newMessage, fromSelf: true },
    ]);
    console.log("Message sent: ", messages);
    setMessage(""); // Xóa nội dung sau khi gửi
    setSending(false);
    scrollToBottom();
  };

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
                {!item.fromSelf ? (
                  <Text style={{ alignSelf: "flex-start" }}>
                    {item.sender.nickname}
                  </Text>
                ) : null}
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

        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
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
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                marginRight: 10,
              }}
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
            <ActivityIndicator size="large" color="#0000ff" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
