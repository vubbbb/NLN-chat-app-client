import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  Button,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { RootStackParamList, User } from "../type/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ChatHeader from "../components/Contacts/ContactsHeader";
import ContactsContainer from "../components/Contacts/ContactsContainer";
import CoctactsFooter from "../components/Contacts/ContactsFooter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocketContext } from "../context/SocketContext";
import GroupsContainer from "../components/Groups/GroupsContainer";

type Props = NativeStackScreenProps<RootStackParamList, "ContactsScreen">;


const ContactsScreen = ({ navigation }: Props) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const socket = useContext(SocketContext); // Lấy socket từ context
  const [currentView, setCurrentView] = useState<'contacts' | 'groups'>('contacts');

  useEffect(() => {
    const getUserDataFromStorage = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userInfo");
        if (userDataString) {
          const userData: User = JSON.parse(userDataString);
          setUser(userData); // Gán dữ liệu sau khi lấy được
          if (userData) {
            setLoading(false);
            socket?.emit("register", userData.userID);
            console.log("Registering user with socket");
          }
        }
      } catch (error) {
        console.error("Error retrieving user data from AsyncStorage", error);
      }
    };
    getUserDataFromStorage();
  }, []); // Chỉ chạy 1 lần khi component được render

  if (loading) {
    // Hiển thị ActivityIndicator khi đang lấy dữ liệu
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Đang...</Text>
      </View>
    );
  }
  if (!user) {
    // Xử lý khi user là null, có thể hiển thị thông báo lỗi hoặc điều hướng
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không thể tải dữ liệu người dùng</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <ChatHeader navigation={navigation} userInfo={user} />
      {currentView == 'contacts' ? (
        <ContactsContainer navigation={navigation} userInfo={user} />
      ) : (
        <GroupsContainer navigation={navigation} userInfo={user} />
      )}
      <CoctactsFooter setCurrentView={setCurrentView}/>
    </SafeAreaView>
  );
};

export default ContactsScreen;
