import React, { useEffect, useState } from "react";
import { View, Text, Image, Button, SafeAreaView, ActivityIndicator } from "react-native";
import { RootStackParamList } from "../index";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ChatHeader from "../components/Contacts/ContactsHeader";
import ContactsContainer from "../components/Contacts/ContactsContainer";
import ChatFooter from "../components/Contacts/ContactsFooter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

type Props = NativeStackScreenProps<RootStackParamList, "ContactsScreen">;
interface User {
  email: string;
  name: string;
  picture?: string;
}

const ContactsScreen = ({ navigation }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    const getUserDataFromStorage = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userInfo");
        if (userDataString) {
          const userData: User = JSON.parse(userDataString);
          setUser(userData); // Gán dữ liệu sau khi lấy được
        }
      } catch (error) {
        console.error("Error retrieving user data from AsyncStorage", error);
      } finally {
        if(user){
          setLoading(false);
        } else {
          getUserDataFromStorage();
        }
      }
    };
    getUserDataFromStorage();
  },); // Chỉ chạy 1 lần khi component được render

  if (loading) {
    // Hiển thị ActivityIndicator khi đang lấy dữ liệu
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <ChatHeader navigation={navigation} userInfo={user} />
      <ContactsContainer navigation={navigation} />
      <ChatFooter />
    </SafeAreaView>
  );
};

export default ContactsScreen;
