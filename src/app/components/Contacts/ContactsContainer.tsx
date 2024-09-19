import React from "react";
import { View, Text, Image, Button, FlatList, Pressable } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Contact } from "../../type/type";

// TODO Sua lai component nay

// Định nghĩa kiểu Props cho component ContactsContainer
type ContactsContainerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
};

const ContactsContainer: React.FC<ContactsContainerProps> = ({
  navigation,
}) => {
  // Tạo dữ liệu mẫu với kiểu Contact
  const initialData: Contact[] = [
    {
      _id: "1",
      email: "user1@example.com",
      nickname: "User 1",
      setupProfile: true,
      picture:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      _id: "2",
      email: "user2@example.com",
      nickname: "User 2",
      setupProfile: false,
      picture:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      _id: "3",
      email: "user3@example.com",
      nickname: "User 3",
      setupProfile: true,
      picture:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      _id: "4",
      email: "user4@example.com",
      nickname: "User 4",
      setupProfile: false,
      picture:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      _id: "5",
      email: "user5@example.com",
      nickname: "User 5",
      setupProfile: true,
      picture:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    // ... thêm nhiều item nữa
  ];

  // Khởi tạo state với kiểu Contact[]
  const [data, setData] = useState<Contact[]>(initialData);
  const [count, setCount] = useState(0);

  const handlePress = (item: Contact) => {
    navigation.navigate("ChatScreen", {
      contact: item,
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => {
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
                  Ten Nguoi Dung {item.nickname}
                </Text>
                <Text>Noi dung tin nhan voi nguoi dung</Text>
              </View>
            </View>
          </Pressable>
        </View>
      );
    },
    [handlePress]
  );

  const memoizedData = useMemo(() => data, [data]);

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
