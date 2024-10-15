import React, { useEffect, useContext } from "react";
import { View, Text, Image, Button, FlatList, Pressable } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  Contact,
  ContactList,
  User,
  Message,
} from "../../type/type";
import apiClient from "../../lib/api-client";
import { GET_DM_LIST_ROUTE } from "../../utils/constants";
import { useFocusEffect } from "@react-navigation/native";
import { SocketContext } from "../../context/SocketContext";

// TODO Sua lai component nay

// Định nghĩa kiểu Props cho component ContactsContainer
type ContactsContainerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
  userInfo: User; // Thêm userInfo vào props
};

const ContactsContainer: React.FC<ContactsContainerProps> = ({
  navigation,
  userInfo,
}) => {
  const [contactList, setContactList] = useState<ContactList[]>([]); // Khởi tạo state với kiểu Contact[]
  const socket = useContext(SocketContext);

  const loadContactList = async () => {
    try {
      const response = await apiClient.post(GET_DM_LIST_ROUTE, {
        params: { userID: userInfo.userID },
      });

      if (response.status === 200 && response.data.contacts) {
        // Kiểm tra nếu contacts không phải là null hoặc undefined
        setContactList(response.data.contacts);
      } else {
        console.error("No contacts found or invalid response data");
        setContactList([]); // Đảm bảo rằng contactList được gán với mảng rỗng
      }
    } catch (error) {
      console.error("Error retrieving contact list", error);
    }
  };

  useEffect(() => {
    loadContactList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContactList();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (message: Message) => {
      console.log("New message received: ", message.content);
      loadContactList();
    };
    socket.on("recieveMessage", handleMessage);
    return () => {
      socket.off("recieveMessage", handleMessage);
    };
  }, [socket, loadContactList]);

  const handlePress = (item: ContactList) => {
    const contact: Contact = {
      _id: item._id, // ID của người liên hệ
      nickname: item.nickname, // Biệt danh
      picture: item.picture, // Hình ảnh đại diện
      email: item.email, // Email
      setupProfile: true, // Chưa cài đặt hồ sơ
    };
    navigation.navigate("ChatScreen", {
      contact,
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: ContactList }) => {
      return (
        <View className=" bg-gray-100">
          <Pressable
            key={item._id}
            onPress={() => {
              handlePress(item);
            }} // Truyền item khi điều hướng
          >
            <View className="flex flex-row">
              <View className="p-[20px] justify-center">
                <Image
                  source={{ uri: item.picture }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    marginRight: 5,
                  }}
                />
              </View>
              <View className="p-[20px] pl-0 justify-center border-b-[1px] w-[100vw] items-start">
                <Text className="font-bold text-xl">{item.nickname}</Text>
                <View className="flex flex-row items-center">
                  <Text>
                    {item.lastMessageContent
                      ? item.lastMessageContent.length > 10
                        ? item.lastMessageContent.slice(0, 10) + "..."
                        : item.lastMessageContent + " "
                      : "File đính kèm"}
                  </Text>

                  <Text>
                    {(() => {
                      const messageDate = new Date(item.lastMessageTime);
                      const currentDate = new Date();

                      // Kiểm tra xem có cùng ngày, tháng, năm không
                      const isSameDay =
                        messageDate.getDate() === currentDate.getDate() &&
                        messageDate.getMonth() === currentDate.getMonth() &&
                        messageDate.getFullYear() === currentDate.getFullYear();

                      // Nếu cùng ngày, chỉ hiển thị giờ
                      if (isSameDay) {
                        return messageDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } else {
                        // Nếu khác ngày, hiển thị đầy đủ ngày giờ
                        return messageDate.toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      );
    },
    [handlePress]
  );

  const memoizedData = useMemo(() => contactList, [contactList]);

  return (
    <FlatList
      data={memoizedData}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      style={{ height: 530 }}
    />
  );
};

export default ContactsContainer;
