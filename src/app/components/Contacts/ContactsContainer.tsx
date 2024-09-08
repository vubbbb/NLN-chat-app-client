import React from "react";
import { View, Text, Image, Button, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/app/index";

// Định nghĩa kiểu Props cho component ContactsContainer
type ContactsContainerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
};


interface Item {
  img_uri: string;
  name: string;
  id: number;
}

const ContactsContainer: React.FC<ContactsContainerProps> = ({ navigation }) => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "User 1",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 2,
      name: "User 2",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 3,
      name: "User 3",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 4,
      name: "User 4",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 5,
      name: "User 5",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 6,
      name: "User 6",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 7,
      name: "User 7",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 8,
      name: "User 8",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 9,
      name: "User 9",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 10,
      name: "User 10",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 11,
      name: "User 11",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 12,
      name: "User 12",
      img_uri:
        "https://th.bing.com/th/id/OIP.4W97WdNAfTqVyDfHEtFinQHaHa?rs=1&pid=ImgDetMain",
    },
    // ... thêm nhiều item nữa
  ]);

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View className=" bg-gray-100">
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate("ChatScreen", { user: { id: item.id, name: item.name, email: 'user1@example.com', uri: item.img_uri } })} // Truyền item khi điều hướng
        >
          <View className="flex flex-row">
            <View className="p-[20px] justify-center">
              <Image
                source={{ uri: item.img_uri }}
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
                Ten Nguoi Dung {item.id}
              </Text>
              <Text>Noi dung tin nhan voi nguoi dung</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={{ height: 530 }}
    />
  );
};

export default ContactsContainer;
