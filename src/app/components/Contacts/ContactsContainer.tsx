import React, { useEffect, useContext  } from "react";
import { View, Text, Image, Button, FlatList, Pressable } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Contact, ContactList, User } from "../../type/type";
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
  navigation, userInfo
}) => {
  const [contactList, setContactList] = useState<ContactList[]>([]); // Khởi tạo state với kiểu Contact[]
  const socket = useContext(SocketContext);


  const loadContactList = async () => {
    try {
      const response = await apiClient.post(GET_DM_LIST_ROUTE, {
        params: { userID: userInfo.userID },
      });
      if (response.status === 200) {
        console.log("Contact list: ", response.data.contacts);
        setContactList(response.data.contacts);
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


  useEffect(()=> {
    if(socket){
      const handleMessage = () => {
        loadContactList();
      }
      socket.on("recieveMessage", handleMessage);
    }
  }, [socket])


  const handlePress = (item: ContactList) => {
    const contact: Contact = {
      _id: item._id,          // ID của người liên hệ
      nickname: item.nickname, // Biệt danh
      picture: item.picture,   // Hình ảnh đại diện
      email: item.email,       // Email
      setupProfile: true,     // Chưa cài đặt hồ sơ
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
                <Text className="font-bold text-xl">
                  {item.nickname}
                </Text>
                <Text>{item.lastMessageContent}</Text>
                <Text>{item.lastMessageTime.toLocaleString()}</Text>
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
